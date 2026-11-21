import type {
  AppState,
  CategoryItem,
  CoupleEvent,
  DeletedTombstones,
  HeroArtKey,
  HomeTask,
  MemoryNote,
  PaletteId,
  PantryItem,
  PartnerId,
  ShoppingItem,
  TaskFrequency,
  WishItem,
} from '../types/app';
import { getTodayJalaliKey, parseDateKey } from './jalali';
import { PALETTES } from './themeEngine';

export const STORAGE_KEY = 'dotaee_m3_expressive_v2';
const LEGACY_AUTH_CACHE = 'dotaee-auth-v1';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function parseTagsInput(raw: string): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  return raw
    .split(/[,،\s#]+/)
    .map((t) => t.trim())
    .filter((t) => {
      if (!t || seen.has(t)) return false;
      seen.add(t);
      return true;
    })
    .slice(0, 12);
}

export function createDefaultState(): AppState {
  return {
    schemaVersion: 3,
    lastUpdated: 0,
    isInitialized: false,
    partners: { p1: 'نفر اول', p2: 'نفر دوم' },
    partnerAvatars: { p1: 'initial', p2: 'initial' },
    myAccount: 'p1',
    themeMode: 'light',
    darkStylePref: 'amoled',
    palette: 'rose',
    heroDisplayMode: 'slider',
    soundEnabled: true,
    syncConfig: { gistToken: '', gistId: '' },
    notifPrefs: { events: true, expiry: true, tasks: true },
    pendingOfflineSync: false,
    dailyPulse: {
      p1: { mood: '😊', note: '', updatedAt: 0 },
      p2: { mood: '🤍', note: '', updatedAt: 0 },
    },
    quickNudge: null,
    eventCategories: [
      { name: 'سالگرد و عاشقانه', icon: 'ring', heroArt: 'rings' },
      { name: 'سفر و تفریح', icon: 'tent', heroArt: 'camping' },
      { name: 'قرار دونفره', icon: 'coffee', heroArt: 'cafe' },
      { name: 'تولد و جشن', icon: 'cake', heroArt: 'cake' },
      { name: 'پرواز و ماجراجویی', icon: 'plane', heroArt: 'plane' },
      { name: 'پزشکی و سلامت', icon: 'medical', heroArt: 'health' },
    ],
    marketCategories: [
      { name: 'سوپرمارکت و لبنیات', icon: 'cart' },
      { name: 'میوه و تره‌بار', icon: 'apple' },
      { name: 'نان و پروتئین', icon: 'bread' },
      { name: 'شوینده و بهداشتی', icon: 'sparkles' },
      { name: 'خانه و پت', icon: 'paw' },
      { name: 'داروخانه', icon: 'pill' },
    ],
    taskCategories: [
      { name: 'تعمیرات فنی', icon: 'wrench' },
      { name: 'نظافت و شستشو', icon: 'sparkles' },
      { name: 'آشپزخانه و منزل', icon: 'home' },
      { name: 'گل‌وگیاه و پت', icon: 'leaf' },
      { name: 'قبوض و خرید خانه', icon: 'receipt' },
    ],
    wishCategories: [
      { name: 'سفر و طبیعت‌گردی', icon: 'tent' },
      { name: 'فیلم و سریال', icon: 'movie' },
      { name: 'کافه و رستوران', icon: 'coffee' },
      { name: 'ایده هدیه', icon: 'gift' },
      { name: 'خریدهای بزرگ مشترک', icon: 'star' },
    ],
    events: [],
    shopping: [],
    pantry: [],
    tasks: [],
    wishes: [],
    memories: [],
    deletedIds: {
      events: {},
      shopping: {},
      pantry: {},
      tasks: {},
      wishes: {},
      memories: {},
    },
  };
}

const VALID_HERO_ARTS = new Set<HeroArtKey>([
  'rings',
  'hearts',
  'loveletter',
  'bouquet',
  'dinner',
  'cafe',
  'tea',
  'cake',
  'giftbox',
  'fireworks',
  'cinema',
  'music',
  'camera',
  'books',
  'gaming',
  'art',
  'pizza',
  'icecream',
  'cooking',
  'shopping',
  'camping',
  'plane',
  'roadtrip',
  'train',
  'boat',
  'balloon',
  'bicycle',
  'mountains',
  'beach',
  'sunset',
  'sunrise',
  'picnic',
  'stargaze',
  'rainy',
  'autumn',
  'snow',
  'nowruz',
  'yalda',
  'home',
  'keys',
  'garden',
  'pet',
  'health',
  'fitness',
  'spa',
  'graduation',
  'savings',
  'baby',
]);

const VALID_FREQS = new Set<TaskFrequency>(['یک‌بار', 'روزانه', 'هفتگی', 'ماهانه']);
const VALID_PALETTES = new Set<PaletteId>(PALETTES.map((p) => p.id));

function isPlainRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function safeString(val: unknown, fallback = '', maxLen = 500): string {
  if (typeof val !== 'string') return fallback;
  return val.slice(0, maxLen);
}

function safeId(val: unknown): string {
  if (typeof val === 'string' && val.trim()) return val.trim().slice(0, 80);
  if (typeof val === 'number' && Number.isFinite(val)) return String(val);
  return generateId();
}

function safePartnerId(val: unknown): PartnerId {
  return val === 'p2' ? 'p2' : 'p1';
}

function safeTimestamp(val: unknown): number {
  return typeof val === 'number' && Number.isFinite(val) && val >= 0 ? val : 0;
}

export function normalizeCategoryList(
  list: unknown,
  fallback: CategoryItem[],
  defaultIcon: string,
  isEvent = false
): CategoryItem[] {
  if (!Array.isArray(list) || list.length === 0) return fallback.map((c) => ({ ...c }));
  const seen = new Set<string>();
  const out: CategoryItem[] = [];
  for (const item of list) {
    let name = '';
    let icon = defaultIcon;
    let heroArt: HeroArtKey = 'hearts';
    if (typeof item === 'string') {
      name = item.trim();
    } else if (isPlainRecord(item)) {
      name = safeString(item.name, '').trim();
      icon = safeString(item.icon, defaultIcon) || defaultIcon;
      if (typeof item.heroArt === 'string' && VALID_HERO_ARTS.has(item.heroArt as HeroArtKey)) {
        heroArt = item.heroArt as HeroArtKey;
      }
    }
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(isEvent ? { name, icon, heroArt } : { name, icon });
  }
  return out.length > 0 ? out : fallback.map((c) => ({ ...c }));
}

function sanitizeTombstones(raw: unknown): DeletedTombstones {
  const empty: DeletedTombstones = {
    events: {},
    shopping: {},
    pantry: {},
    tasks: {},
    wishes: {},
    memories: {},
  };
  if (!isPlainRecord(raw)) return empty;
  const keys: (keyof DeletedTombstones)[] = [
    'events',
    'shopping',
    'pantry',
    'tasks',
    'wishes',
    'memories',
  ];
  for (const k of keys) {
    const map = raw[k];
    if (isPlainRecord(map)) {
      for (const [id, ts] of Object.entries(map)) {
        if (id === '__proto__' || id === 'constructor' || id === 'prototype') continue;
        const safeTs = safeTimestamp(ts);
        if (safeTs > 0) empty[k][id] = safeTs;
      }
    }
  }
  return empty;
}

export function sanitizeState(raw: unknown, preserveLocal?: AppState): AppState {
  const base = createDefaultState();
  if (!isPlainRecord(raw)) return preserveLocal ? { ...preserveLocal } : base;

  const partnersRaw = isPlainRecord(raw.partners) ? raw.partners : {};
  const partners = {
    p1: safeString(partnersRaw.p1, preserveLocal?.partners.p1 || base.partners.p1, 40).trim() || 'نفر اول',
    p2: safeString(partnersRaw.p2, preserveLocal?.partners.p2 || base.partners.p2, 40).trim() || 'نفر دوم',
  };

  const avatarsRaw = isPlainRecord(raw.partnerAvatars) ? raw.partnerAvatars : {};
  const partnerAvatars = {
    p1: safeString(avatarsRaw.p1, preserveLocal?.partnerAvatars?.p1 || 'initial', 12) || 'initial',
    p2: safeString(avatarsRaw.p2, preserveLocal?.partnerAvatars?.p2 || 'initial', 12) || 'initial',
  };

  const nudgeRaw = isPlainRecord(raw.quickNudge) ? raw.quickNudge : null;
  const quickNudge: AppState['quickNudge'] =
    nudgeRaw && safeString(nudgeRaw.message, '', 140).trim()
      ? {
          id: safeId(nudgeRaw.id),
          from: safePartnerId(nudgeRaw.from),
          emoji: safeString(nudgeRaw.emoji, '🤍', 8) || '🤍',
          message: safeString(nudgeRaw.message, '', 140).trim(),
          createdAt: safeTimestamp(nudgeRaw.createdAt) || Date.now(),
          seenBy:
            nudgeRaw.seenBy === 'p1'
              ? 'p1'
              : nudgeRaw.seenBy === 'p2'
                ? 'p2'
                : null,
        }
      : null;

  const syncRaw = isPlainRecord(raw.syncConfig) ? raw.syncConfig : {};
  const notifRaw = isPlainRecord(raw.notifPrefs) ? raw.notifPrefs : {};
  const pulseRaw = isPlainRecord(raw.dailyPulse) ? raw.dailyPulse : {};
  const pulseP1 = isPlainRecord(pulseRaw.p1) ? pulseRaw.p1 : {};
  const pulseP2 = isPlainRecord(pulseRaw.p2) ? pulseRaw.p2 : {};

  const events: CoupleEvent[] = Array.isArray(raw.events)
    ? raw.events
        .filter(isPlainRecord)
        .map((e) => ({
          id: safeId(e.id),
          title: safeString(e.title, 'رویداد', 140).trim() || 'رویداد',
          dateKey: parseDateKey(safeString(e.dateKey)) ? safeString(e.dateKey) : getTodayJalaliKey(),
          time: safeString(e.time, '', 10),
          partner: e.partner === 'p1' || e.partner === 'p2' ? e.partner : 'both',
          category: safeString(e.category, base.eventCategories[0].name, 60),
          heroArt:
            typeof e.heroArt === 'string' && VALID_HERO_ARTS.has(e.heroArt as HeroArtKey)
              ? (e.heroArt as HeroArtKey)
              : 'hearts',
          pinned: Boolean(e.pinned),
          repeatYearly: Boolean(e.repeatYearly),
          note: safeString(e.note, '', 500),
          updatedAt: safeTimestamp(e.updatedAt) || safeTimestamp(raw.lastUpdated) || 1,
        }))
    : [];

  const shopping: ShoppingItem[] = Array.isArray(raw.shopping)
    ? raw.shopping
        .filter(isPlainRecord)
        .map((s) => ({
          id: safeId(s.id),
          title: safeString(s.title, 'کالا', 140).trim() || 'کالا',
          qty: safeString(s.qty, '', 40),
          category: safeString(s.category, base.marketCategories[0].name, 60),
          priority: s.priority === 'high' ? 'high' : 'normal',
          tags: Array.isArray(s.tags)
            ? s.tags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).slice(0, 12)
            : [],
          note: safeString(s.note, '', 500),
          addedBy: safePartnerId(s.addedBy),
          done: Boolean(s.done),
          pinned: Boolean(s.pinned),
          order: typeof s.order === 'number' && Number.isFinite(s.order) ? s.order : undefined,
          updatedAt: safeTimestamp(s.updatedAt) || safeTimestamp(raw.lastUpdated) || 1,
        }))
    : [];

  const pantry: PantryItem[] = Array.isArray(raw.pantry)
    ? raw.pantry
        .filter(isPlainRecord)
        .map((p) => ({
          id: safeId(p.id),
          title: safeString(p.title, 'کالا', 140).trim() || 'کالا',
          qty: safeString(p.qty, '', 40),
          category: safeString(p.category, base.marketCategories[0].name, 60),
          status: p.status === 'low' || p.status === 'empty' ? p.status : 'ok',
          purchaseDate: parseDateKey(safeString(p.purchaseDate)) ? safeString(p.purchaseDate) : null,
          expiryDate: parseDateKey(safeString(p.expiryDate)) ? safeString(p.expiryDate) : null,
          priority: p.priority === 'high' ? 'high' : 'normal',
          tags: Array.isArray(p.tags)
            ? p.tags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).slice(0, 12)
            : [],
          note: safeString(p.note, '', 500),
          addedBy: safePartnerId(p.addedBy),
          updatedAt: safeTimestamp(p.updatedAt) || safeTimestamp(raw.lastUpdated) || 1,
        }))
    : [];

  const tasks: HomeTask[] = Array.isArray(raw.tasks)
    ? raw.tasks
        .filter(isPlainRecord)
        .map((t) => ({
          id: safeId(t.id),
          title: safeString(t.title, 'کار خانه', 140).trim() || 'کار خانه',
          category: safeString(t.category, base.taskCategories[0].name, 60),
          assignee: t.assignee === 'p1' || t.assignee === 'p2' ? t.assignee : 'both',
          freq:
            typeof t.freq === 'string' && VALID_FREQS.has(t.freq as TaskFrequency)
              ? (t.freq as TaskFrequency)
              : 'یک‌بار',
          priority: t.priority === 'high' ? 'high' : 'normal',
          tags: Array.isArray(t.tags)
            ? t.tags.filter((tg): tg is string => typeof tg === 'string' && tg.trim().length > 0).slice(0, 12)
            : [],
          note: safeString(t.note, '', 500),
          done: Boolean(t.done),
          pinned: Boolean(t.pinned),
          order: typeof t.order === 'number' && Number.isFinite(t.order) ? t.order : undefined,
          lastCompletedDate: parseDateKey(safeString(t.lastCompletedDate))
            ? safeString(t.lastCompletedDate)
            : null,
          updatedAt: safeTimestamp(t.updatedAt) || safeTimestamp(raw.lastUpdated) || 1,
        }))
    : [];

  const wishes: WishItem[] = Array.isArray(raw.wishes)
    ? raw.wishes
        .filter(isPlainRecord)
        .map((w) => ({
          id: safeId(w.id),
          title: safeString(w.title, 'آرزو', 140).trim() || 'آرزو',
          category: safeString(w.category, base.wishCategories[0].name, 60),
          priority: w.priority === 'high' ? 'high' : 'normal',
          tags: Array.isArray(w.tags)
            ? w.tags.filter((tg): tg is string => typeof tg === 'string' && tg.trim().length > 0).slice(0, 12)
            : [],
          isPrivate: Boolean(w.isPrivate),
          localOnly: Boolean(w.localOnly),
          note: safeString(w.note, '', 500),
          addedBy: safePartnerId(w.addedBy),
          done: Boolean(w.done),
          pinned: Boolean(w.pinned),
          order: typeof w.order === 'number' && Number.isFinite(w.order) ? w.order : undefined,
          updatedAt: safeTimestamp(w.updatedAt) || safeTimestamp(raw.lastUpdated) || 1,
        }))
    : [];

  const memories: MemoryNote[] = Array.isArray(raw.memories)
    ? raw.memories
        .filter(isPlainRecord)
        .map((m) => ({
          id: safeId(m.id),
          text: safeString(m.text, '', 500).trim(),
          emoji: safeString(m.emoji, '✨', 8) || '✨',
          dateKey: parseDateKey(safeString(m.dateKey)) ? safeString(m.dateKey) : getTodayJalaliKey(),
          unlockDateKey: parseDateKey(safeString(m.unlockDateKey))
            ? safeString(m.unlockDateKey)
            : null,
          author: safePartnerId(m.author),
          createdAt: safeTimestamp(m.createdAt) || safeTimestamp(m.updatedAt) || Date.now(),
          updatedAt: safeTimestamp(m.updatedAt) || safeTimestamp(raw.lastUpdated) || 1,
        }))
        .filter((m) => m.text.length > 0)
    : [];

  const rawTheme = raw.themeMode;
  const themeMode =
    rawTheme === 'auto' || rawTheme === 'light' || rawTheme === 'dark' || rawTheme === 'amoled'
      ? rawTheme
      : base.themeMode;

  const rawPalette = raw.palette as PaletteId;
  const palette = VALID_PALETTES.has(rawPalette) ? rawPalette : base.palette;

  return {
    schemaVersion: 3,
    lastUpdated: safeTimestamp(raw.lastUpdated),
    isInitialized: Boolean(raw.isInitialized),
    partners,
    partnerAvatars,
    myAccount: preserveLocal ? preserveLocal.myAccount : safePartnerId(raw.myAccount),
    themeMode: preserveLocal ? preserveLocal.themeMode : themeMode,
    darkStylePref: preserveLocal
      ? preserveLocal.darkStylePref
      : raw.darkStylePref === 'dark'
        ? 'dark'
        : 'amoled',
    palette: preserveLocal ? preserveLocal.palette : palette,
    heroDisplayMode: preserveLocal
      ? preserveLocal.heroDisplayMode
      : raw.heroDisplayMode === 'stack'
        ? 'stack'
        : 'slider',
    soundEnabled: preserveLocal
      ? preserveLocal.soundEnabled
      : raw.soundEnabled !== false,
    syncConfig: preserveLocal
      ? { ...preserveLocal.syncConfig }
      : {
          gistToken: safeString(syncRaw.gistToken, '', 300).trim(),
          gistId: safeString(syncRaw.gistId, '', 120).trim(),
        },
    notifPrefs: preserveLocal
      ? { ...preserveLocal.notifPrefs }
      : {
          events: notifRaw.events !== false,
          expiry: notifRaw.expiry !== false,
          tasks: notifRaw.tasks !== false,
        },
    pendingOfflineSync: Boolean(raw.pendingOfflineSync),
    dailyPulse: {
      p1: {
        mood: safeString(pulseP1.mood, '😊', 8),
        note: safeString(pulseP1.note, '', 140),
        updatedAt: safeTimestamp(pulseP1.updatedAt),
      },
      p2: {
        mood: safeString(pulseP2.mood, '🤍', 8),
        note: safeString(pulseP2.note, '', 140),
        updatedAt: safeTimestamp(pulseP2.updatedAt),
      },
    },
    quickNudge,
    eventCategories: normalizeCategoryList(raw.eventCategories, base.eventCategories, 'heart', true),
    marketCategories: normalizeCategoryList(raw.marketCategories, base.marketCategories, 'cart', false),
    taskCategories: normalizeCategoryList(raw.taskCategories, base.taskCategories, 'wrench', false),
    wishCategories: normalizeCategoryList(raw.wishCategories, base.wishCategories, 'star', false),
    events,
    shopping,
    pantry,
    tasks,
    wishes,
    memories,
    deletedIds: sanitizeTombstones(raw.deletedIds),
  };
}

export function loadStateFromStorage(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    return sanitizeState(parsed);
  } catch {
    return createDefaultState();
  }
}

export function saveStateToStorage(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/**
 * Purges legacy insecure CacheStorage auth cache (`dotaee-auth-v1` / `/__dotaee_auth__`)
 * so GitHub PATs are never left behind on shared GitHub Pages origins.
 */
export async function clearLegacyAuthCache(): Promise<void> {
  if (typeof caches === 'undefined') return;
  try {
    await caches.delete(LEGACY_AUTH_CACHE);
  } catch {
    // ignore
  }
}

/**
 * Safe backup export using Blob + ObjectURL (never hits Data URI length limits)
 * and strips the GitHub PAT so secrets are never leaked into downloaded JSON files.
 */
export function exportSafeBackupJson(state: AppState): void {
  const safeSnapshot: AppState = {
    ...state,
    syncConfig: {
      gistToken: '', // Never export raw PAT into plain backup files
      gistId: state.syncConfig.gistId,
    },
  };
  const blob = new Blob([JSON.stringify(safeSnapshot, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dotaee-backup-${getTodayJalaliKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
