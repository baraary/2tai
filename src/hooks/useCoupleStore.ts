import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AppState,
  CategoryItem,
  CategoryListKey,
  CoupleEvent,
  DarkStylePref,
  HomeTask,
  PaletteId,
  PantryItem,
  PartnerId,
  ShoppingItem,
  SyncStateKind,
  ThemeMode,
  UndoAction,
  WishItem,
} from '../types/app';
import {
  extractIncomingInviteCode,
  inspectInviteCode,
  type InvitePayload,
} from '../utils/cryptoAndInvite';
import {
  buildSharedCloudPayload,
  fetchGistRemote,
  mergeStates,
  pushGistRemote,
} from '../utils/gistSync';
import { getTodayJalali, getTodayJalaliKey, shouldResetRecurringTask } from '../utils/jalali';
import { maybeSendDailyReminder } from '../utils/notifications';
import {
  clearLegacyAuthCache,
  generateId,
  loadStateFromStorage,
  sanitizeState,
  saveStateToStorage,
} from '../utils/storageAndValidation';
import { launchPastelConfetti, triggerHaptic } from '../utils/celebration';
import { playSound } from '../utils/soundEffects';
import { applyMaterialYouTheme } from '../utils/themeEngine';
import { useOnlineStatus } from './useOnlineStatus';

export interface ToastState {
  id: number;
  message: string;
  undo?: UndoAction;
}

export function useCoupleStore() {
  const isOnline = useOnlineStatus();
  const [state, setState] = useState<AppState>(() => loadStateFromStorage());
  const stateRef = useRef<AppState>(state);
  stateRef.current = state;

  const [todayJalali, setTodayJalali] = useState<[number, number, number]>(() => getTodayJalali());
  const [syncKind, setSyncKind] = useState<SyncStateKind>('idle');
  const [syncLabel, setSyncLabel] = useState<string>('ذخیره محلی');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [pendingPinInvite, setPendingPinInvite] = useState<string | null>(null);

  const toastTimerRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const syncInFlightRef = useRef<boolean>(false);
  const hasQueuedLocalPushRef = useRef<boolean>(false);
  const etagRef = useRef<string | null>(null);

  const showToast = useCallback((message: string, undo?: UndoAction) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), message, undo });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, undo ? 5200 : 2800);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(null);
  }, []);

  const persistLocal = useCallback((next: AppState) => {
    const ok = saveStateToStorage(next);
    if (!ok) {
      showToast('فضای ذخیره مرورگر پر است؛ لطفاً بکاپ بگیرید');
    }
  }, [showToast]);

  // Apply Material You theme & listen to system color scheme changes
  useEffect(() => {
    applyMaterialYouTheme(state.palette, state.themeMode);
    if (state.themeMode !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyMaterialYouTheme(state.palette, 'auto');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [state.palette, state.themeMode]);

  // Midnight rollover watcher + automatic recurring task reset
  useEffect(() => {
    const checkDateAndRecurring = () => {
      const fresh = getTodayJalali();
      const freshKey = getTodayJalaliKey();
      setTodayJalali((prev) =>
        prev[0] === fresh[0] && prev[1] === fresh[1] && prev[2] === fresh[2] ? prev : fresh
      );

      setState((prev) => {
        let changed = false;
        const nowTs = Date.now();
        const nextTasks = prev.tasks.map((t) => {
          if (t.done && shouldResetRecurringTask(t.freq, t.lastCompletedDate, freshKey)) {
            changed = true;
            return { ...t, done: false, updatedAt: nowTs };
          }
          return t;
        });
        if (!changed) return prev;
        const updated = { ...prev, tasks: nextTasks, lastUpdated: nowTs };
        saveStateToStorage(updated);
        return updated;
      });
    };

    checkDateAndRecurring();
    const timer = window.setInterval(checkDateAndRecurring, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // Core Gist Push (merges remote first if needed to prevent overwriting partner changes!)
  const pushToCloud = useCallback(
    async (silent = false): Promise<boolean> => {
      const current = stateRef.current;
      const { gistToken, gistId } = current.syncConfig;
      if (!gistToken) {
        if (!silent) showToast('ابتدا توکن گیت‌هاب را در تنظیمات وارد کنید');
        return false;
      }
      if (!navigator.onLine) {
        setState((prev) => {
          const next = { ...prev, pendingOfflineSync: true };
          persistLocal(next);
          return next;
        });
        setSyncKind('offline');
        setSyncLabel('در صف آفلاین');
        return false;
      }

      if (syncInFlightRef.current) {
        hasQueuedLocalPushRef.current = true;
        return false;
      }

      syncInFlightRef.current = true;
      setSyncKind('syncing');
      setSyncLabel('در حال همگام‌سازی...');

      try {
        let stateToPush = stateRef.current;

        // Pull-before-push 3-way merge when an existing Gist exists so partner's concurrent edits are NEVER lost
        if (gistId) {
          const remoteCheck = await fetchGistRemote(gistToken, gistId, etagRef.current);
          if (remoteCheck.status === 'updated' && remoteCheck.data) {
            stateToPush = mergeStates(stateRef.current, remoteCheck.data);
            setState(stateToPush);
            persistLocal(stateToPush);
          }
        }

        const payload = buildSharedCloudPayload(stateToPush);
        const res = await pushGistRemote(gistToken, gistId, payload);
        if (!res.ok) {
          setSyncKind('error');
          setSyncLabel(res.errorMessage || 'خطای همگام‌سازی');
          if (!silent) showToast(res.errorMessage || 'خطا در ذخیره ابری');
          setState((prev) => {
            const next = { ...prev, pendingOfflineSync: true };
            persistLocal(next);
            return next;
          });
          return false;
        }

        if (res.etag) etagRef.current = res.etag;
        setState((prev) => {
          const next: AppState = {
            ...prev,
            pendingOfflineSync: false,
            syncConfig: {
              ...prev.syncConfig,
              gistId: res.gistId || prev.syncConfig.gistId,
            },
          };
          persistLocal(next);
          return next;
        });

        setSyncKind('online');
        setSyncLabel('همگام با ابر');
        if (!silent) showToast('با موفقیت در ابر ذخیره شد');
        return true;
      } finally {
        syncInFlightRef.current = false;
        if (hasQueuedLocalPushRef.current) {
          hasQueuedLocalPushRef.current = false;
          void pushToCloud(true);
        }
      }
    },
    [persistLocal, showToast]
  );

  // Core Gist Pull with ETag (If-None-Match) + 3-way merge (never wipes local unsynced edits!)
  const pullFromCloud = useCallback(
    async (silent = false, forceNoEtag = false): Promise<boolean> => {
      const current = stateRef.current;
      const { gistToken, gistId } = current.syncConfig;
      if (!gistToken || !gistId) {
        if (!silent) showToast('توکن و شناسه Gist الزامی است');
        return false;
      }
      if (!navigator.onLine) {
        setSyncKind('offline');
        setSyncLabel('حالت آفلاین');
        return false;
      }
      if (syncInFlightRef.current) return false;

      // If we have local edits pending (offline or debounce), run merge+push instead of bare pull
      if (current.pendingOfflineSync || debounceTimerRef.current !== null) {
        if (debounceTimerRef.current) {
          window.clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        return await pushToCloud(silent);
      }

      syncInFlightRef.current = true;
      if (!silent) {
        setSyncKind('syncing');
        setSyncLabel('در حال دریافت...');
      }

      try {
        const res = await fetchGistRemote(gistToken, gistId, forceNoEtag ? null : etagRef.current);
        if (res.status === 'not_modified') {
          setSyncKind('online');
          setSyncLabel('همگام با ابر');
          if (!silent) showToast('اطلاعات به‌روز است');
          return true;
        }
        if (res.status === 'error') {
          setSyncKind('error');
          setSyncLabel(res.errorMessage || 'خطای اتصال');
          if (!silent) showToast(res.errorMessage || 'خطا در دریافت اطلاعات');
          return false;
        }

        if (res.etag) etagRef.current = res.etag;
        if (res.data) {
          const merged = mergeStates(stateRef.current, res.data);
          setState(merged);
          persistLocal(merged);
        }
        setSyncKind('online');
        setSyncLabel('همگام با ابر');
        if (!silent) showToast('اطلاعات با موفقیت همگام شد');
        return true;
      } finally {
        syncInFlightRef.current = false;
      }
    },
    [persistLocal, pushToCloud, showToast]
  );

  const scheduleCloudSync = useCallback(() => {
    const current = stateRef.current;
    if (!current.syncConfig.gistToken) return;

    if (!navigator.onLine) {
      setState((prev) => {
        const next = { ...prev, pendingOfflineSync: true };
        persistLocal(next);
        return next;
      });
      setSyncKind('offline');
      setSyncLabel('در صف آفلاین');
      return;
    }

    setSyncKind('syncing');
    setSyncLabel('در انتظار ذخیره...');
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null;
      void pushToCloud(true);
    }, 1200);
  }, [persistLocal, pushToCloud]);

  const updateState = useCallback(
    (updater: (prev: AppState) => AppState, options?: { syncCloud?: boolean }) => {
      const shouldSync = options?.syncCloud ?? true;
      setState((prev) => {
        const nextBase = updater(prev);
        const next: AppState = {
          ...nextBase,
          lastUpdated: shouldSync ? Date.now() : prev.lastUpdated,
        };
        persistLocal(next);
        return next;
      });
      if (shouldSync) {
        scheduleCloudSync();
      }
    },
    [persistLocal, scheduleCloudSync]
  );

  // Apply an incoming magic invite payload cleanly
  const applyInvitePayload = useCallback(
    async (payload: InvitePayload) => {
      etagRef.current = null;
      setState((prev) => {
        const next: AppState = {
          ...prev,
          isInitialized: true,
          myAccount: payload.a,
          partners: {
            p1: payload.p1 || prev.partners.p1,
            p2: payload.p2 || prev.partners.p2,
          },
          palette: payload.pal || prev.palette,
          syncConfig: {
            gistToken: payload.t,
            gistId: payload.g,
          },
        };
        persistLocal(next);
        return next;
      });
      setPendingPinInvite(null);
      showToast('ورود با لینک اختصاصی انجام شد؛ در حال دریافت داده‌ها...');
      window.setTimeout(() => {
        void pullFromCloud(true, true);
      }, 150);
    },
    [persistLocal, pullFromCloud, showToast]
  );

  // Initial mount: register SW, purge legacy insecure cache, inspect incoming invite, kick off initial sync
  useEffect(() => {
    void clearLegacyAuthCache();

    if ('serviceWorker' in navigator) {
      if (import.meta.env.PROD) {
        if (
          window.location.protocol === 'https:' ||
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1'
        ) {
          navigator.serviceWorker.register('./sw.js').catch(() => {});
        }
      } else {
        // Never let a cached Service Worker interfere with Vite dev server
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => regs.forEach((r) => void r.unregister()))
          .catch(() => {});
      }
    }

    const inviteCode = extractIncomingInviteCode();
    if (inviteCode) {
      const parsed = inspectInviteCode(inviteCode);
      if (parsed.status === 'ready') {
        void applyInvitePayload(parsed.payload);
      } else if (parsed.status === 'needs_pin') {
        setPendingPinInvite(parsed.rawCode);
      } else {
        showToast('لینک دعوت معتبر نیست');
      }
    } else if (stateRef.current.syncConfig.gistToken && stateRef.current.syncConfig.gistId) {
      setSyncKind(navigator.onLine ? 'online' : 'offline');
      setSyncLabel(navigator.onLine ? 'همگام با ابر' : 'حالت آفلاین');
      if (navigator.onLine) {
        void pullFromCloud(true);
      }
    }

    void maybeSendDailyReminder(stateRef.current);
  }, [applyInvitePayload, pullFromCloud, showToast]);

  // Network online/offline sync triggers
  useEffect(() => {
    if (!stateRef.current.syncConfig.gistToken) return;
    if (isOnline) {
      if (stateRef.current.pendingOfflineSync) {
        void pushToCloud(true);
      } else if (stateRef.current.syncConfig.gistId) {
        void pullFromCloud(true);
      }
    } else {
      setSyncKind('offline');
      setSyncLabel('حالت آفلاین');
    }
  }, [isOnline, pullFromCloud, pushToCloud]);

  // Background ETag-cached polling every 45s while visible + visibilitychange refresh
  useEffect(() => {
    const onVisibility = () => {
      if (
        document.visibilityState === 'visible' &&
        navigator.onLine &&
        stateRef.current.syncConfig.gistToken &&
        stateRef.current.syncConfig.gistId
      ) {
        void pullFromCloud(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    const interval = window.setInterval(() => {
      if (
        document.visibilityState === 'visible' &&
        navigator.onLine &&
        stateRef.current.syncConfig.gistToken &&
        stateRef.current.syncConfig.gistId
      ) {
        void pullFromCloud(true);
      }
    }, 45_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(interval);
    };
  }, [pullFromCloud]);

  // ===== Domain Mutations =====

  const setPalette = useCallback(
    (palette: PaletteId) => {
      updateState((prev) => ({ ...prev, palette }), { syncCloud: false });
    },
    [updateState]
  );

  const setThemeMode = useCallback(
    (themeMode: ThemeMode) => {
      updateState(
        (prev) => ({
          ...prev,
          themeMode,
          darkStylePref:
            themeMode === 'dark' || themeMode === 'amoled' ? themeMode : prev.darkStylePref,
        }),
        { syncCloud: false }
      );
    },
    [updateState]
  );

  const setDarkStylePref = useCallback(
    (darkStylePref: DarkStylePref) => {
      updateState(
        (prev) => ({
          ...prev,
          darkStylePref,
          themeMode:
            prev.themeMode === 'dark' || prev.themeMode === 'amoled'
              ? darkStylePref
              : prev.themeMode,
        }),
        { syncCloud: false }
      );
    },
    [updateState]
  );

  const toggleQuickTheme = useCallback(() => {
    updateState(
      (prev) => {
        const isDarkNow =
          prev.themeMode === 'dark' ||
          prev.themeMode === 'amoled' ||
          (prev.themeMode === 'auto' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);
        return {
          ...prev,
          themeMode: isDarkNow ? 'light' : prev.darkStylePref,
        };
      },
      { syncCloud: false }
    );
  }, [updateState]);

  const toggleHeroDisplayMode = useCallback(() => {
    updateState(
      (prev) => {
        const nextMode = prev.heroDisplayMode === 'stack' ? 'slider' : 'stack';
        showToast(nextMode === 'stack' ? 'نمایش همزمان فعال شد' : 'نمایش اسلایدشو فعال شد');
        return { ...prev, heroDisplayMode: nextMode };
      },
      { syncCloud: false }
    );
  }, [showToast, updateState]);

  const switchDeviceAccount = useCallback(
    (myAccount: PartnerId) => {
      // Device-local setting — NEVER triggers cloud push that could affect partner
      updateState((prev) => ({ ...prev, myAccount }), { syncCloud: false });
      showToast(`این دستگاه روی اکانت «${stateRef.current.partners[myAccount]}» تنظیم شد`);
    },
    [showToast, updateState]
  );

  const setSoundEnabled = useCallback(
    (soundEnabled: boolean) => {
      updateState((prev) => ({ ...prev, soundEnabled }), { syncCloud: false });
      if (soundEnabled) {
        playSound('check', true);
      }
    },
    [updateState]
  );

  const updateDailyPulse = useCallback(
    (mood: string, note: string) => {
      const acc = stateRef.current.myAccount;
      triggerHaptic('light');
      playSound('check', stateRef.current.soundEnabled);
      updateState((prev) => ({
        ...prev,
        dailyPulse: {
          ...prev.dailyPulse,
          [acc]: { mood, note: note.trim().slice(0, 140), updatedAt: Date.now() },
        },
      }));
      showToast('حال‌وهوای امروز ثبت شد');
    },
    [showToast, updateState]
  );

  const sendQuickNudge = useCallback(
    (emoji: string, message: string) => {
      const cleanMsg = message.trim().slice(0, 140);
      if (!cleanMsg) return;
      const from = stateRef.current.myAccount;
      const toAcc: PartnerId = from === 'p1' ? 'p2' : 'p1';
      const toName = stateRef.current.partners[toAcc];
      triggerHaptic('celebrate');
      playSound('nudge', stateRef.current.soundEnabled);
      launchPastelConfetti('hearts');
      updateState((prev) => ({
        ...prev,
        quickNudge: {
          id: generateId(),
          from,
          emoji: emoji || '🤍',
          message: cleanMsg,
          createdAt: Date.now(),
          seenBy: null,
        },
      }));
      showToast(`تلنگر عاشقانه برای ${toName} ارسال شد`);
    },
    [showToast, updateState]
  );

  const dismissQuickNudge = useCallback(
    (replyWithHeart = false) => {
      const myAcc = stateRef.current.myAccount;
      const partnerAcc: PartnerId = myAcc === 'p1' ? 'p2' : 'p1';
      if (replyWithHeart) {
        triggerHaptic('celebrate');
        playSound('nudge', stateRef.current.soundEnabled);
        launchPastelConfetti('hearts');
        updateState((prev) => ({
          ...prev,
          quickNudge: {
            id: generateId(),
            from: myAcc,
            emoji: '🥰',
            message: 'پیامت رو دیدم و دلم گرم شد 🤍',
            createdAt: Date.now(),
            seenBy: null,
          },
        }));
        showToast(`قلب برای ${stateRef.current.partners[partnerAcc]} فرستاده شد`);
      } else {
        triggerHaptic('light');
        updateState((prev) => ({
          ...prev,
          quickNudge: prev.quickNudge ? { ...prev.quickNudge, seenBy: myAcc } : null,
        }));
      }
    },
    [showToast, updateState]
  );

  const setPartnerAvatar = useCallback(
    (partner: PartnerId, avatar: string) => {
      triggerHaptic('light');
      updateState((prev) => ({
        ...prev,
        partnerAvatars: {
          ...prev.partnerAvatars,
          [partner]: avatar || 'initial',
        },
      }));
    },
    [updateState]
  );

  // Events CRUD
  const saveEvent = useCallback(
    (data: Omit<CoupleEvent, 'id' | 'updatedAt'>, editId?: string | null) => {
      const nowTs = Date.now();
      updateState((prev) => {
        const hasCat = prev.eventCategories.some((c) => c.name === data.category);
        const eventCategories = hasCat
          ? prev.eventCategories
          : [...prev.eventCategories, { name: data.category, icon: 'heart', heroArt: data.heroArt || 'hearts' }];

        if (editId) {
          return {
            ...prev,
            eventCategories,
            events: prev.events.map((e) =>
              e.id === editId ? { ...e, ...data, id: editId, updatedAt: nowTs } : e
            ),
          };
        }
        return {
          ...prev,
          eventCategories,
          events: [{ ...data, id: generateId(), updatedAt: nowTs }, ...prev.events],
        };
      });
      showToast(editId ? 'رویداد ویرایش شد' : 'رویداد جدید ثبت شد');
    },
    [showToast, updateState]
  );

  const toggleEventPin = useCallback(
    (id: string) => {
      const target = stateRef.current.events.find((e) => e.id === id);
      if (!target) return;
      const nextPin = !target.pinned;
      updateState((prev) => ({
        ...prev,
        events: prev.events.map((e) =>
          e.id === id ? { ...e, pinned: nextPin, updatedAt: Date.now() } : e
        ),
      }));
      showToast(nextPin ? `«${target.title}» در صفحه خانه پین شد` : `پین «${target.title}» برداشته شد`);
    },
    [showToast, updateState]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      const removed = stateRef.current.events.find((e) => e.id === id);
      if (!removed) return;
      const delTs = Date.now();
      updateState((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== id),
        deletedIds: {
          ...prev.deletedIds,
          events: { ...prev.deletedIds.events, [id]: delTs },
        },
      }));
      showToast(`رویداد «${removed.title}» حذف شد`, {
        label: 'بازگردانی',
        restore: () => {
          updateState((prev) => {
            const nextDel = { ...prev.deletedIds.events };
            delete nextDel[id];
            return {
              ...prev,
              events: [{ ...removed, updatedAt: Date.now() }, ...prev.events],
              deletedIds: { ...prev.deletedIds, events: nextDel },
            };
          });
        },
      });
    },
    [showToast, updateState]
  );

  // Market (Shopping + Pantry) CRUD — fixes edit-and-move data loss & preserves original addedBy!
  const saveMarketItem = useCallback(
    (params: {
      target: 'shopping' | 'pantry';
      editId?: string | null;
      sourceList?: 'shopping' | 'pantry';
      title: string;
      qty: string;
      category: string;
      status: 'ok' | 'low' | 'empty';
      purchaseDate: string | null;
      expiryDate: string | null;
      priority: 'normal' | 'high';
      tags: string[];
      note: string;
    }) => {
      const nowTs = Date.now();
      const { target, editId, sourceList } = params;

      updateState((prev) => {
        const hasCat = prev.marketCategories.some((c) => c.name === params.category);
        const marketCategories = hasCat
          ? prev.marketCategories
          : [...prev.marketCategories, { name: params.category, icon: 'cart' }];

        const existingShop = editId ? prev.shopping.find((x) => x.id === editId) : undefined;
        const existingPantry = editId ? prev.pantry.find((x) => x.id === editId) : undefined;
        const originalAddedBy = existingShop?.addedBy || existingPantry?.addedBy || prev.myAccount;
        const originalDone = existingShop?.done ?? false;

        let nextShopping = prev.shopping;
        let nextPantry = prev.pantry;
        const nextDeleted = {
          ...prev.deletedIds,
          shopping: { ...prev.deletedIds.shopping },
          pantry: { ...prev.deletedIds.pantry },
        };

        // If user edited an item and switched it between Shopping <-> Pantry, move it cleanly!
        if (editId && sourceList && sourceList !== target) {
          if (sourceList === 'shopping') {
            nextShopping = nextShopping.filter((x) => x.id !== editId);
            nextDeleted.shopping[editId] = nowTs;
          } else {
            nextPantry = nextPantry.filter((x) => x.id !== editId);
            nextDeleted.pantry[editId] = nowTs;
          }
        }

        if (target === 'shopping') {
          const item: ShoppingItem = {
            id: editId && sourceList === 'shopping' ? editId : generateId(),
            title: params.title,
            qty: params.qty,
            category: params.category,
            priority: params.priority,
            tags: [...params.tags],
            note: params.note,
            addedBy: originalAddedBy,
            done: originalDone,
            updatedAt: nowTs,
          };
          if (editId && sourceList === 'shopping' && nextShopping.some((x) => x.id === editId)) {
            nextShopping = nextShopping.map((x) => (x.id === editId ? item : x));
          } else {
            nextShopping = [item, ...nextShopping];
          }
        } else {
          const item: PantryItem = {
            id: editId && sourceList === 'pantry' ? editId : generateId(),
            title: params.title,
            qty: params.qty,
            category: params.category,
            status: params.status,
            purchaseDate: params.purchaseDate,
            expiryDate: params.expiryDate,
            priority: params.priority,
            tags: [...params.tags],
            note: params.note,
            addedBy: originalAddedBy,
            updatedAt: nowTs,
          };
          if (editId && sourceList === 'pantry' && nextPantry.some((x) => x.id === editId)) {
            nextPantry = nextPantry.map((x) => (x.id === editId ? item : x));
          } else {
            nextPantry = [item, ...nextPantry];
          }
        }

        return {
          ...prev,
          marketCategories,
          shopping: nextShopping,
          pantry: nextPantry,
          deletedIds: nextDeleted,
        };
      });

      if (editId && sourceList && sourceList !== target) {
        showToast(target === 'pantry' ? 'کالا به انبار خانه منتقل شد' : 'کالا به لیست خرید منتقل شد');
      } else {
        showToast(
          editId
            ? 'کالا ویرایش شد'
            : target === 'shopping'
              ? 'به لیست خرید اضافه شد'
              : 'به انبار خانه اضافه شد'
        );
      }
    },
    [showToast, updateState]
  );

  const toggleShoppingDone = useCallback(
    (id: string) => {
      const todayKey = getTodayJalaliKey();
      const nowTs = Date.now();
      const existing = stateRef.current.shopping.find((x) => x.id === id);
      if (existing) {
        triggerHaptic(existing.done ? 'light' : 'success');
        playSound(existing.done ? 'uncheck' : 'check', stateRef.current.soundEnabled);
      }
      updateState((prev) => {
        const target = prev.shopping.find((x) => x.id === id);
        if (!target) return prev;
        const nextDone = !target.done;
        const nextShopping = prev.shopping.map((x) =>
          x.id === id ? { ...x, done: nextDone, updatedAt: nowTs } : x
        );
        const nextPantry = nextDone
          ? prev.pantry.map((p) =>
              p.title.trim().toLowerCase() === target.title.trim().toLowerCase()
                ? { ...p, status: 'ok' as const, purchaseDate: todayKey, updatedAt: nowTs }
                : p
            )
          : prev.pantry;
        return { ...prev, shopping: nextShopping, pantry: nextPantry };
      });
    },
    [updateState]
  );

  const toggleShoppingPin = useCallback(
    (id: string) => {
      triggerHaptic('light');
      updateState((prev) => ({
        ...prev,
        shopping: prev.shopping.map((x) =>
          x.id === id ? { ...x, pinned: !x.pinned, updatedAt: Date.now() } : x
        ),
      }));
    },
    [updateState]
  );

  const reorderShopping = useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) return;
      triggerHaptic('light');
      updateState((prev) => {
        const sorted = [...prev.shopping].sort((a, b) => {
          if (Boolean(a.done) !== Boolean(b.done)) return Number(a.done) - Number(b.done);
          if (Boolean(a.pinned) !== Boolean(b.pinned)) return Number(b.pinned) - Number(a.pinned);
          const oa = a.order ?? Number.MAX_SAFE_INTEGER;
          const ob = b.order ?? Number.MAX_SAFE_INTEGER;
          if (oa !== ob) return oa - ob;
          return b.updatedAt - a.updatedAt;
        });
        const fromIdx = sorted.findIndex((i) => i.id === fromId);
        const toIdx = sorted.findIndex((i) => i.id === toId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const [moved] = sorted.splice(fromIdx, 1);
        sorted.splice(toIdx, 0, moved);
        const nowTs = Date.now();
        const reordered = sorted.map((item, idx) => ({
          ...item,
          order: idx,
          updatedAt: item.id === fromId || item.id === toId ? nowTs : item.updatedAt,
        }));
        return { ...prev, shopping: reordered };
      });
    },
    [updateState]
  );

  const deleteShoppingItem = useCallback(
    (id: string) => {
      const removed = stateRef.current.shopping.find((x) => x.id === id);
      if (!removed) return;
      const delTs = Date.now();
      updateState((prev) => ({
        ...prev,
        shopping: prev.shopping.filter((x) => x.id !== id),
        deletedIds: {
          ...prev.deletedIds,
          shopping: { ...prev.deletedIds.shopping, [id]: delTs },
        },
      }));
      showToast(`«${removed.title}» حذف شد`, {
        label: 'بازگردانی',
        restore: () => {
          updateState((prev) => {
            const nextDel = { ...prev.deletedIds.shopping };
            delete nextDel[id];
            return {
              ...prev,
              shopping: [{ ...removed, updatedAt: Date.now() }, ...prev.shopping],
              deletedIds: { ...prev.deletedIds, shopping: nextDel },
            };
          });
        },
      });
    },
    [showToast, updateState]
  );

  const clearDoneShopping = useCallback(() => {
    const doneItems = stateRef.current.shopping.filter((x) => x.done);
    if (doneItems.length === 0) return;
    const delTs = Date.now();
    updateState((prev) => {
      const nextDel = { ...prev.deletedIds.shopping };
      doneItems.forEach((x) => {
        nextDel[x.id] = delTs;
      });
      return {
        ...prev,
        shopping: prev.shopping.filter((x) => !x.done),
        deletedIds: { ...prev.deletedIds, shopping: nextDel },
      };
    });
    showToast('خریدهای انجام‌شده پاکسازی شدند', {
      label: 'بازگردانی',
      restore: () => {
        updateState((prev) => {
          const nextDel = { ...prev.deletedIds.shopping };
          doneItems.forEach((x) => delete nextDel[x.id]);
          return {
            ...prev,
            shopping: [
              ...prev.shopping,
              ...doneItems.map((x) => ({ ...x, updatedAt: Date.now() })),
            ],
            deletedIds: { ...prev.deletedIds, shopping: nextDel },
          };
        });
      },
    });
  }, [showToast, updateState]);

  const cyclePantryStatus = useCallback(
    (id: string) => {
      const order: ('ok' | 'low' | 'empty')[] = ['ok', 'low', 'empty'];
      updateState((prev) => ({
        ...prev,
        pantry: prev.pantry.map((p) => {
          if (p.id !== id) return p;
          const nextStatus = order[(order.indexOf(p.status) + 1) % order.length];
          return { ...p, status: nextStatus, updatedAt: Date.now() };
        }),
      }));
    },
    [updateState]
  );

  const movePantryToShopping = useCallback(
    (id: string) => {
      const item = stateRef.current.pantry.find((x) => x.id === id);
      if (!item) return;
      const alreadyExists = stateRef.current.shopping.some(
        (s) => s.title.trim().toLowerCase() === item.title.trim().toLowerCase() && !s.done
      );
      if (alreadyExists) {
        showToast(`«${item.title}» از قبل در لیست خرید وجود دارد`);
        return;
      }
      updateState((prev) => ({
        ...prev,
        shopping: [
          {
            id: generateId(),
            title: item.title,
            qty: item.qty || '',
            category: item.category || prev.marketCategories[0]?.name || 'عمومی',
            priority: item.status === 'empty' ? 'high' : 'normal',
            tags: [...(item.tags || [])], // Safe shallow copy, no shared array reference
            note: item.note || '',
            addedBy: prev.myAccount,
            done: false,
            updatedAt: Date.now(),
          },
          ...prev.shopping,
        ],
      }));
      showToast(`«${item.title}» به لیست خرید اضافه شد`);
    },
    [showToast, updateState]
  );

  const deletePantryItem = useCallback(
    (id: string) => {
      const removed = stateRef.current.pantry.find((x) => x.id === id);
      if (!removed) return;
      const delTs = Date.now();
      updateState((prev) => ({
        ...prev,
        pantry: prev.pantry.filter((x) => x.id !== id),
        deletedIds: {
          ...prev.deletedIds,
          pantry: { ...prev.deletedIds.pantry, [id]: delTs },
        },
      }));
      showToast(`«${removed.title}» از انبار حذف شد`, {
        label: 'بازگردانی',
        restore: () => {
          updateState((prev) => {
            const nextDel = { ...prev.deletedIds.pantry };
            delete nextDel[id];
            return {
              ...prev,
              pantry: [{ ...removed, updatedAt: Date.now() }, ...prev.pantry],
              deletedIds: { ...prev.deletedIds, pantry: nextDel },
            };
          });
        },
      });
    },
    [showToast, updateState]
  );

  // Tasks CRUD
  const saveTask = useCallback(
    (data: Omit<HomeTask, 'id' | 'done' | 'lastCompletedDate' | 'updatedAt'>, editId?: string | null) => {
      const nowTs = Date.now();
      updateState((prev) => {
        const hasCat = prev.taskCategories.some((c) => c.name === data.category);
        const taskCategories = hasCat
          ? prev.taskCategories
          : [...prev.taskCategories, { name: data.category, icon: 'wrench' }];
        if (editId) {
          return {
            ...prev,
            taskCategories,
            tasks: prev.tasks.map((t) =>
              t.id === editId ? { ...t, ...data, updatedAt: nowTs } : t
            ),
          };
        }
        return {
          ...prev,
          taskCategories,
          tasks: [
            {
              ...data,
              id: generateId(),
              done: false,
              lastCompletedDate: null,
              updatedAt: nowTs,
            },
            ...prev.tasks,
          ],
        };
      });
      showToast(editId ? 'کار خانه ویرایش شد' : 'کار جدید ثبت شد');
    },
    [showToast, updateState]
  );

  const toggleTaskDone = useCallback(
    (id: string) => {
      const todayKey = getTodayJalaliKey();
      const existing = stateRef.current.tasks.find((t) => t.id === id);
      if (existing) {
        triggerHaptic(existing.done ? 'light' : 'success');
        playSound(existing.done ? 'uncheck' : 'check', stateRef.current.soundEnabled);
      }
      updateState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => {
          if (t.id !== id) return t;
          const nextDone = !t.done;
          return {
            ...t,
            done: nextDone,
            lastCompletedDate: nextDone ? todayKey : null,
            updatedAt: Date.now(),
          };
        }),
      }));
    },
    [updateState]
  );

  const toggleTaskPin = useCallback(
    (id: string) => {
      triggerHaptic('light');
      updateState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id ? { ...t, pinned: !t.pinned, updatedAt: Date.now() } : t
        ),
      }));
    },
    [updateState]
  );

  const reorderTasks = useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) return;
      triggerHaptic('light');
      updateState((prev) => {
        const sorted = [...prev.tasks].sort((a, b) => {
          if (Boolean(a.done) !== Boolean(b.done)) return Number(a.done) - Number(b.done);
          if (Boolean(a.pinned) !== Boolean(b.pinned)) return Number(b.pinned) - Number(a.pinned);
          const oa = a.order ?? Number.MAX_SAFE_INTEGER;
          const ob = b.order ?? Number.MAX_SAFE_INTEGER;
          if (oa !== ob) return oa - ob;
          return b.updatedAt - a.updatedAt;
        });
        const fromIdx = sorted.findIndex((i) => i.id === fromId);
        const toIdx = sorted.findIndex((i) => i.id === toId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const [moved] = sorted.splice(fromIdx, 1);
        sorted.splice(toIdx, 0, moved);
        const nowTs = Date.now();
        const reordered = sorted.map((item, idx) => ({
          ...item,
          order: idx,
          updatedAt: item.id === fromId || item.id === toId ? nowTs : item.updatedAt,
        }));
        return { ...prev, tasks: reordered };
      });
    },
    [updateState]
  );

  const deleteTask = useCallback(
    (id: string) => {
      const removed = stateRef.current.tasks.find((x) => x.id === id);
      if (!removed) return;
      const delTs = Date.now();
      updateState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((x) => x.id !== id),
        deletedIds: {
          ...prev.deletedIds,
          tasks: { ...prev.deletedIds.tasks, [id]: delTs },
        },
      }));
      showToast(`کار «${removed.title}» حذف شد`, {
        label: 'بازگردانی',
        restore: () => {
          updateState((prev) => {
            const nextDel = { ...prev.deletedIds.tasks };
            delete nextDel[id];
            return {
              ...prev,
              tasks: [{ ...removed, updatedAt: Date.now() }, ...prev.tasks],
              deletedIds: { ...prev.deletedIds, tasks: nextDel },
            };
          });
        },
      });
    },
    [showToast, updateState]
  );

  const clearCompletedTasks = useCallback(() => {
    const completed = stateRef.current.tasks.filter((t) => t.done && t.freq === 'یک‌بار');
    if (completed.length === 0) {
      showToast('کار یک‌باره انجام‌شده‌ای برای حذف نیست (کارهای تکراری خودکار ریست می‌شوند)');
      return;
    }
    const delTs = Date.now();
    updateState((prev) => {
      const nextDel = { ...prev.deletedIds.tasks };
      completed.forEach((t) => {
        nextDel[t.id] = delTs;
      });
      return {
        ...prev,
        tasks: prev.tasks.filter((t) => !(t.done && t.freq === 'یک‌بار')),
        deletedIds: { ...prev.deletedIds, tasks: nextDel },
      };
    });
    showToast('کارهای انجام‌شده پاکسازی شدند');
  }, [showToast, updateState]);

  // Wishes CRUD — preserves addedBy on edit + supports true localOnly surprise privacy!
  const saveWish = useCallback(
    (
      data: Omit<WishItem, 'id' | 'addedBy' | 'done' | 'updatedAt'>,
      editId?: string | null
    ) => {
      const nowTs = Date.now();
      updateState(
        (prev) => {
          const hasCat = prev.wishCategories.some((c) => c.name === data.category);
          const wishCategories = hasCat
            ? prev.wishCategories
            : [...prev.wishCategories, { name: data.category, icon: 'star' }];
          if (editId) {
            return {
              ...prev,
              wishCategories,
              wishes: prev.wishes.map((w) =>
                w.id === editId ? { ...w, ...data, updatedAt: nowTs } : w
              ),
            };
          }
          return {
            ...prev,
            wishCategories,
            wishes: [
              {
                ...data,
                id: generateId(),
                addedBy: prev.myAccount,
                done: false,
                updatedAt: nowTs,
              },
              ...prev.wishes,
            ],
          };
        },
        { syncCloud: !data.localOnly }
      );
      showToast(editId ? 'آرزو ویرایش شد' : 'آرزو ثبت شد');
    },
    [showToast, updateState]
  );

  const toggleWishDone = useCallback(
    (id: string) => {
      const target = stateRef.current.wishes.find((w) => w.id === id);
      if (!target) return;
      const becomingDone = !target.done;
      if (becomingDone) {
        triggerHaptic('celebrate');
        playSound('celebrate', stateRef.current.soundEnabled);
        launchPastelConfetti('celebration');
        showToast(`هورا! «${target.title}» به واقعیت پیوست 🎉`);
      } else {
        triggerHaptic('light');
        playSound('uncheck', stateRef.current.soundEnabled);
      }
      updateState(
        (prev) => ({
          ...prev,
          wishes: prev.wishes.map((w) =>
            w.id === id ? { ...w, done: becomingDone, updatedAt: Date.now() } : w
          ),
        }),
        { syncCloud: !target.localOnly }
      );
    },
    [showToast, updateState]
  );

  const toggleWishPin = useCallback(
    (id: string) => {
      const target = stateRef.current.wishes.find((w) => w.id === id);
      if (!target) return;
      triggerHaptic('light');
      updateState(
        (prev) => ({
          ...prev,
          wishes: prev.wishes.map((w) =>
            w.id === id ? { ...w, pinned: !w.pinned, updatedAt: Date.now() } : w
          ),
        }),
        { syncCloud: !target.localOnly }
      );
    },
    [updateState]
  );

  const reorderWishes = useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) return;
      triggerHaptic('light');
      updateState((prev) => {
        const sorted = [...prev.wishes].sort((a, b) => {
          if (Boolean(a.done) !== Boolean(b.done)) return Number(a.done) - Number(b.done);
          if (Boolean(a.pinned) !== Boolean(b.pinned)) return Number(b.pinned) - Number(a.pinned);
          const oa = a.order ?? Number.MAX_SAFE_INTEGER;
          const ob = b.order ?? Number.MAX_SAFE_INTEGER;
          if (oa !== ob) return oa - ob;
          return b.updatedAt - a.updatedAt;
        });
        const fromIdx = sorted.findIndex((i) => i.id === fromId);
        const toIdx = sorted.findIndex((i) => i.id === toId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const [moved] = sorted.splice(fromIdx, 1);
        sorted.splice(toIdx, 0, moved);
        const nowTs = Date.now();
        const reordered = sorted.map((item, idx) => ({
          ...item,
          order: idx,
          updatedAt: item.id === fromId || item.id === toId ? nowTs : item.updatedAt,
        }));
        return { ...prev, wishes: reordered };
      });
    },
    [updateState]
  );

  const deleteWish = useCallback(
    (id: string) => {
      const removed = stateRef.current.wishes.find((x) => x.id === id);
      if (!removed) return;
      const delTs = Date.now();
      updateState(
        (prev) => ({
          ...prev,
          wishes: prev.wishes.filter((x) => x.id !== id),
          deletedIds: removed.localOnly
            ? prev.deletedIds
            : {
                ...prev.deletedIds,
                wishes: { ...prev.deletedIds.wishes, [id]: delTs },
              },
        }),
        { syncCloud: !removed.localOnly }
      );
      showToast(`«${removed.title}» حذف شد`, {
        label: 'بازگردانی',
        restore: () => {
          updateState(
            (prev) => {
              const nextDel = { ...prev.deletedIds.wishes };
              delete nextDel[id];
              return {
                ...prev,
                wishes: [{ ...removed, updatedAt: Date.now() }, ...prev.wishes],
                deletedIds: { ...prev.deletedIds, wishes: nextDel },
              };
            },
            { syncCloud: !removed.localOnly }
          );
        },
      });
    },
    [showToast, updateState]
  );

  // Gratitude Jar & Time Capsule CRUD
  const addMemoryNote = useCallback(
    (params: { text: string; emoji: string; dateKey?: string; unlockDateKey?: string | null }) => {
      const cleanText = params.text.trim().slice(0, 500);
      if (!cleanText) return;
      const nowTs = Date.now();
      const todayKey = getTodayJalaliKey();
      const unlockKey = params.unlockDateKey?.trim() || null;
      triggerHaptic('success');
      playSound('jar', stateRef.current.soundEnabled);
      updateState((prev) => ({
        ...prev,
        memories: [
          {
            id: generateId(),
            text: cleanText,
            emoji: params.emoji || '✨',
            dateKey: params.dateKey || todayKey,
            unlockDateKey: unlockKey,
            author: prev.myAccount,
            createdAt: nowTs,
            updatedAt: nowTs,
          },
          ...prev.memories,
        ],
      }));
      showToast(
        unlockKey ? 'کپسول زمان مهروموم و در شیشه ذخیره شد' : 'خاطره شیرین در شیشه خاطرات افتاد ✨'
      );
    },
    [showToast, updateState]
  );

  const deleteMemoryNote = useCallback(
    (id: string) => {
      const removed = stateRef.current.memories.find((m) => m.id === id);
      if (!removed) return;
      const delTs = Date.now();
      updateState((prev) => ({
        ...prev,
        memories: prev.memories.filter((m) => m.id !== id),
        deletedIds: {
          ...prev.deletedIds,
          memories: { ...prev.deletedIds.memories, [id]: delTs },
        },
      }));
      showToast('یادداشت از شیشه حذف شد', {
        label: 'بازگردانی',
        restore: () => {
          updateState((prev) => {
            const nextDel = { ...prev.deletedIds.memories };
            delete nextDel[id];
            return {
              ...prev,
              memories: [{ ...removed, updatedAt: Date.now() }, ...prev.memories],
              deletedIds: { ...prev.deletedIds, memories: nextDel },
            };
          });
        },
      });
    },
    [showToast, updateState]
  );

  // Category Manager CRUD
  const saveCategory = useCallback(
    (listKey: CategoryListKey, newCat: CategoryItem, originalName?: string | null) => {
      updateState((prev) => {
        const list = [...prev[listKey]];
        if (originalName) {
          const idx = list.findIndex((c) => c.name === originalName);
          if (idx > -1) list[idx] = newCat;
          else list.push(newCat);

          const rename = <T extends { category: string; updatedAt: number }>(arr: T[]) =>
            arr.map((it) =>
              it.category === originalName
                ? { ...it, category: newCat.name, updatedAt: Date.now() }
                : it
            );

          return {
            ...prev,
            [listKey]: list,
            events: listKey === 'eventCategories' ? rename(prev.events) : prev.events,
            shopping: listKey === 'marketCategories' ? rename(prev.shopping) : prev.shopping,
            pantry: listKey === 'marketCategories' ? rename(prev.pantry) : prev.pantry,
            tasks: listKey === 'taskCategories' ? rename(prev.tasks) : prev.tasks,
            wishes: listKey === 'wishCategories' ? rename(prev.wishes) : prev.wishes,
          };
        }

        const existingIdx = list.findIndex((c) => c.name === newCat.name);
        if (existingIdx > -1) list[existingIdx] = newCat;
        else list.push(newCat);
        return { ...prev, [listKey]: list };
      });
      showToast(originalName ? `دسته «${newCat.name}» ویرایش شد` : `دسته «${newCat.name}» اضافه شد`);
    },
    [showToast, updateState]
  );

  const deleteCategory = useCallback(
    (listKey: CategoryListKey, name: string) => {
      if (stateRef.current[listKey].length <= 1) {
        showToast('حداقل یک دسته‌بندی باید باقی بماند');
        return;
      }
      updateState((prev) => ({
        ...prev,
        [listKey]: prev[listKey].filter((c) => c.name !== name),
      }));
      showToast(`دسته «${name}» حذف شد`);
    },
    [showToast, updateState]
  );

  // Settings, Notifications, Wizard, Backup Import
  const saveNotifPrefs = useCallback(
    (prefs: AppState['notifPrefs']) => {
      updateState((prev) => ({ ...prev, notifPrefs: prefs }), { syncCloud: false });
    },
    [updateState]
  );

  const saveSettings = useCallback(
    (params: { p1: string; p2: string; gistToken: string; gistId: string }) => {
      const cleanToken = params.gistToken.trim();
      const cleanGistId = params.gistId.trim();
      if (!cleanToken) {
        void clearLegacyAuthCache();
        etagRef.current = null;
        setSyncKind('idle');
        setSyncLabel('ذخیره محلی');
      }
      updateState(
        (prev) => ({
          ...prev,
          partners: {
            p1: params.p1.trim() || 'نفر اول',
            p2: params.p2.trim() || 'نفر دوم',
          },
          syncConfig: {
            gistToken: cleanToken,
            gistId: cleanGistId,
          },
        }),
        { syncCloud: Boolean(cleanToken) }
      );
      showToast('تنظیمات ذخیره شد');
    },
    [showToast, updateState]
  );

  const disconnectCloud = useCallback(async () => {
    await clearLegacyAuthCache();
    etagRef.current = null;
    updateState(
      (prev) => ({
        ...prev,
        pendingOfflineSync: false,
        syncConfig: { gistToken: '', gistId: '' },
      }),
      { syncCloud: false }
    );
    setSyncKind('idle');
    setSyncLabel('ذخیره محلی');
    showToast('اتصال ابری و توکن با امنیت کامل پاک شد');
  }, [showToast, updateState]);

  const finishWizard = useCallback(
    (params: {
      p1: string;
      p2: string;
      myAccount: PartnerId;
      firstEventTitle?: string;
      firstEventDateKey?: string;
    }) => {
      const nowTs = Date.now();
      updateState((prev) => {
        const nextEvents = [...prev.events];
        if (params.firstEventTitle?.trim() && params.firstEventDateKey) {
          nextEvents.unshift({
            id: generateId(),
            title: params.firstEventTitle.trim(),
            dateKey: params.firstEventDateKey,
            category: prev.eventCategories[0]?.name || 'سالگرد و عاشقانه',
            heroArt: 'rings',
            partner: 'both',
            pinned: true,
            repeatYearly: true,
            note: '',
            updatedAt: nowTs,
          });
        }
        return {
          ...prev,
          isInitialized: true,
          myAccount: params.myAccount,
          partners: {
            p1: params.p1.trim() || 'نفر اول',
            p2: params.p2.trim() || 'نفر دوم',
          },
          events: nextEvents,
        };
      });
      showToast(`خوش آمدی ${params.myAccount === 'p1' ? params.p1 || 'عزیزم' : params.p2 || 'عزیزم'}!`);
    },
    [showToast, updateState]
  );

  const importBackup = useCallback(
    (jsonText: string) => {
      try {
        const parsed = JSON.parse(jsonText);
        const sanitized = sanitizeState(parsed, stateRef.current);
        sanitized.isInitialized = true;
        setState(sanitized);
        persistLocal(sanitized);
        if (sanitized.syncConfig.gistToken) {
          scheduleCloudSync();
        }
        showToast('فایل پشتیبان با امنیت بررسی و بازیابی شد');
        return true;
      } catch {
        showToast('فایل پشتیبان نامعتبر یا خراب است');
        return false;
      }
    },
    [persistLocal, scheduleCloudSync, showToast]
  );

  return {
    state,
    todayJalali,
    isOnline,
    syncKind,
    syncLabel,
    toast,
    dismissToast,
    showToast,
    pendingPinInvite,
    setPendingPinInvite,
    applyInvitePayload,
    pushToCloud,
    pullFromCloud,
    setPalette,
    setThemeMode,
    setDarkStylePref,
    toggleQuickTheme,
    toggleHeroDisplayMode,
    setSoundEnabled,
    switchDeviceAccount,
    updateDailyPulse,
    sendQuickNudge,
    dismissQuickNudge,
    setPartnerAvatar,
    saveEvent,
    toggleEventPin,
    deleteEvent,
    saveMarketItem,
    toggleShoppingDone,
    toggleShoppingPin,
    reorderShopping,
    deleteShoppingItem,
    clearDoneShopping,
    cyclePantryStatus,
    movePantryToShopping,
    deletePantryItem,
    saveTask,
    toggleTaskDone,
    toggleTaskPin,
    reorderTasks,
    deleteTask,
    clearCompletedTasks,
    saveWish,
    toggleWishDone,
    toggleWishPin,
    reorderWishes,
    deleteWish,
    addMemoryNote,
    deleteMemoryNote,
    saveCategory,
    deleteCategory,
    saveNotifPrefs,
    saveSettings,
    disconnectCloud,
    finishWizard,
    importBackup,
  };
}

export type CoupleStore = ReturnType<typeof useCoupleStore>;
