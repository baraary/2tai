import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Pin,
  Plus,
  ShoppingBag,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CategoryIcon } from '../data/assets';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { ShoppingItem } from '../types/app';
import { launchPastelConfetti, triggerHaptic } from '../utils/celebration';
import { toFa } from '../utils/jalali';
import { playSound } from '../utils/soundEffects';

interface InStoreShoppingModalProps {
  open: boolean;
  onClose: () => void;
  store: CoupleStore;
}

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
}

export const InStoreShoppingModal: React.FC<InStoreShoppingModalProps> = ({
  open,
  onClose,
  store,
}) => {
  const { state } = store;
  const [quickTitle, setQuickTitle] = useState('');
  const [wakeActive, setWakeActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);
  const celebratedCompleteRef = useRef(false);

  const totalCount = state.shopping.length;
  const doneCount = state.shopping.filter((i) => i.done).length;
  const pendingCount = totalCount - doneCount;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Screen Wake Lock API: keep screen awake while shopping in store
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const requestWakeLock = async () => {
      try {
        const nav = navigator as Navigator & {
          wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
        };
        if (!nav.wakeLock) return;
        const sentinel = await nav.wakeLock.request('screen');
        if (cancelled) {
          void sentinel.release();
          return;
        }
        wakeLockRef.current = sentinel;
        setWakeActive(true);
      } catch {
        setWakeActive(false);
      }
    };

    void requestWakeLock();

    const onVisChange = () => {
      if (document.visibilityState === 'visible' && open) {
        void requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisChange);
      if (wakeLockRef.current) {
        void wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
      setWakeActive(false);
    };
  }, [open]);

  // Escape key closes In-Store mode
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Celebrate when all shopping items are ticked off in store!
  useEffect(() => {
    if (!open) {
      celebratedCompleteRef.current = false;
      return;
    }
    if (totalCount > 0 && pendingCount === 0 && !celebratedCompleteRef.current) {
      celebratedCompleteRef.current = true;
      triggerHaptic('celebrate');
      playSound('celebrate', state.soundEnabled);
      launchPastelConfetti('celebration');
    } else if (pendingCount > 0) {
      celebratedCompleteRef.current = false;
    }
  }, [open, pendingCount, state.soundEnabled, totalCount]);

  // Group items by store aisle / category, keeping pending aisles first
  const groupedAisles = useMemo(() => {
    const map = new Map<string, ShoppingItem[]>();
    for (const item of state.shopping) {
      const cat = item.category || 'عمومی';
      const arr = map.get(cat) || [];
      arr.push(item);
      map.set(cat, arr);
    }

    const catOrder = new Map<string, number>();
    state.marketCategories.forEach((c, idx) => catOrder.set(c.name, idx));

    return Array.from(map.entries())
      .map(([category, items]) => {
        const sorted = [...items].sort((a, b) => {
          if (a.done !== b.done) return Number(a.done) - Number(b.done);
          if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
          const oa = a.order ?? Number.MAX_SAFE_INTEGER;
          const ob = b.order ?? Number.MAX_SAFE_INTEGER;
          if (oa !== ob) return oa - ob;
          return b.updatedAt - a.updatedAt;
        });
        const remaining = sorted.filter((i) => !i.done).length;
        const catMeta = state.marketCategories.find((c) => c.name === category);
        return {
          category,
          icon: catMeta?.icon || 'cart',
          items: sorted,
          remaining,
          orderIdx: catOrder.get(category) ?? 999,
        };
      })
      .sort((a, b) => {
        if ((a.remaining === 0) !== (b.remaining === 0)) {
          return a.remaining === 0 ? 1 : -1;
        }
        return a.orderIdx - b.orderIdx;
      });
  }, [state.marketCategories, state.shopping]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) return;
    store.saveMarketItem({
      target: 'shopping',
      title: trimmed,
      qty: '',
      category: state.marketCategories[0]?.name || 'سوپرمارکت و لبنیات',
      status: 'ok',
      purchaseDate: null,
      expiryDate: null,
      priority: 'normal',
      tags: [],
      note: '',
    });
    setQuickTitle('');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
          style={{ backgroundColor: 'var(--md-bg)', color: 'var(--md-on-surface)' }}
          role="dialog"
          aria-modal="true"
          aria-label="حالت توی فروشگاه هستم"
        >
          {/* Sticky Top Bar */}
          <header
            className="shrink-0 border-b px-4 py-3.5"
            style={{
              backgroundColor: 'var(--md-card)',
              borderColor: 'var(--md-outline-variant)',
            }}
          >
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: 'var(--pastel-mint-soft)',
                      color: 'var(--pastel-mint)',
                    }}
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-black leading-tight truncate">
                      حالت توی فروشگاه
                    </h2>
                    <div
                      className="text-xs font-semibold flex items-center gap-1.5 mt-0.5 tabular-nums"
                      style={{ color: 'var(--md-on-surface-variant)' }}
                    >
                      <span>
                        {toFa(doneCount)} از {toFa(totalCount)} در سبد
                      </span>
                      {wakeActive && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span
                            className="inline-flex items-center gap-1"
                            style={{ color: 'var(--pastel-mint)' }}
                          >
                            <Sun className="w-3 h-3" />
                            <span>صفحه روشن</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="m3-btn-tonal text-xs !min-h-[42px] px-3.5 shrink-0"
                >
                  <X className="w-4 h-4" />
                  <span>خروج</span>
                </button>
              </div>

              {/* Pastel Progress Bar */}
              <div
                className="h-2 w-full rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--md-surface-container)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPct}%`,
                    backgroundColor: 'var(--pastel-mint)',
                  }}
                />
              </div>
            </div>
          </header>

          {/* Scrollable Large-Target Aisle List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Quick Add in Aisle */}
              <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
                <label htmlFor="instore-quick-add" className="sr-only">
                  افزودن سریع کالا در فروشگاه
                </label>
                <input
                  id="instore-quick-add"
                  type="text"
                  className="m3-input text-base !min-h-[48px]"
                  style={{ backgroundColor: 'var(--md-card)' }}
                  placeholder="چیزی یادت افتاد؟ اینجا بنویس..."
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                />
                <button
                  type="submit"
                  className="m3-btn-primary !min-h-[48px] px-4 shrink-0"
                  style={{ backgroundColor: 'var(--pastel-mint)', color: '#FFFFFF' }}
                  aria-label="افزودن به سبد"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              {/* All Done Celebration Banner */}
              {totalCount > 0 && pendingCount === 0 && (
                <div
                  className="rounded-3xl p-5 text-center space-y-3"
                  style={{
                    backgroundColor: 'var(--pastel-mint-soft)',
                    border: '1px solid var(--md-outline-variant)',
                  }}
                >
                  <CheckCircle2
                    className="w-10 h-10 mx-auto"
                    style={{ color: 'var(--pastel-mint)' }}
                  />
                  <div>
                    <p className="text-lg font-black">همه خریدها کامل شد! 🎉</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--md-on-surface-variant)' }}>
                      کالاهای مشابه در انبار خانه هم خودکار به‌روزرسانی شدند.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      store.clearDoneShopping();
                      onClose();
                    }}
                    className="m3-btn-primary text-xs mx-auto"
                    style={{ backgroundColor: 'var(--pastel-mint)', color: '#FFFFFF' }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>پاکسازی خریده‌شده‌ها و خروج</span>
                  </button>
                </div>
              )}

              {totalCount === 0 ? (
                <div
                  className="m3-surface-card rounded-3xl p-10 text-center space-y-2"
                >
                  <p className="text-base font-bold">لیست خرید فعلاً خالی است</p>
                  <p className="text-xs" style={{ color: 'var(--md-on-surface-variant)' }}>
                    از کادر بالا می‌توانید سریع هر کالایی را اضافه کنید.
                  </p>
                </div>
              ) : (
                groupedAisles.map((aisle) => (
                  <section
                    key={aisle.category}
                    className="m3-surface-card rounded-3xl overflow-hidden"
                  >
                    <div
                      className="px-4 py-3 flex items-center justify-between gap-2 border-b"
                      style={{
                        backgroundColor: 'var(--md-surface-low)',
                        borderColor: 'var(--md-outline-variant)',
                      }}
                    >
                      <div className="flex items-center gap-2 font-extrabold text-sm">
                        <CategoryIcon
                          name={aisle.icon}
                          className="w-4 h-4 shrink-0 text-[var(--pastel-mint)]"
                        />
                        <span>{aisle.category}</span>
                      </div>
                      <span
                        className="text-xs font-bold tabular-nums"
                        style={{
                          color:
                            aisle.remaining === 0
                              ? 'var(--pastel-mint)'
                              : 'var(--md-on-surface-variant)',
                        }}
                      >
                        {aisle.remaining === 0
                          ? 'تکمیل شد ✓'
                          : `${toFa(aisle.remaining)} مورد باقی‌مانده`}
                      </span>
                    </div>

                    <div className="divide-y" style={{ borderColor: 'var(--md-outline-variant)' }}>
                      {aisle.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => store.toggleShoppingDone(item.id)}
                          className="w-full min-h-[64px] px-4 py-3.5 flex items-center gap-4 text-right cursor-pointer active:bg-[var(--md-surface-low)] transition-colors"
                        >
                          <span
                            className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-colors ${item.done ? 'check-pop' : ''}`}
                            style={{
                              borderColor: item.done
                                ? 'var(--pastel-mint)'
                                : 'var(--md-outline)',
                              backgroundColor: item.done ? 'var(--pastel-mint)' : 'transparent',
                              color: '#FFFFFF',
                            }}
                          >
                            {item.done && <Check className="w-5 h-5 stroke-[3]" />}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-base sm:text-lg font-extrabold flex items-center gap-2 strike-smooth ${item.done ? 'line-through opacity-45' : ''}`}
                            >
                              {item.pinned && !item.done && (
                                <Pin
                                  className="w-3.5 h-3.5 shrink-0"
                                  style={{ color: 'var(--md-primary)' }}
                                />
                              )}
                              <span className="truncate">{item.title}</span>
                            </div>
                            {(item.qty || item.note || item.priority === 'high') && (
                              <div
                                className="text-xs sm:text-sm flex items-center gap-2 flex-wrap mt-0.5"
                                style={{ color: 'var(--md-on-surface-variant)' }}
                              >
                                {item.qty && <span className="font-bold">{item.qty}</span>}
                                {item.priority === 'high' && !item.done && (
                                  <>
                                    {item.qty && <span aria-hidden="true">·</span>}
                                    <span style={{ color: 'var(--md-danger)', fontWeight: 700 }}>
                                      فوری
                                    </span>
                                  </>
                                )}
                                {item.note && (
                                  <>
                                    {(item.qty || (item.priority === 'high' && !item.done)) && (
                                      <span aria-hidden="true">·</span>
                                    )}
                                    <span className="truncate">{item.note}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
