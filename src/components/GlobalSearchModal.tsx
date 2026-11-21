import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Heart,
  Lock,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  AppState,
  CoupleEvent,
  HomeTask,
  MarketSubTab,
  PantryItem,
  ShoppingItem,
  TabId,
  WishItem,
} from '../types/app';
import { formatJalaliFull, toFa } from '../utils/jalali';

export type SearchResultItem =
  | { kind: 'event'; id: string; title: string; subtitle: string; item: CoupleEvent }
  | { kind: 'shopping'; id: string; title: string; subtitle: string; done: boolean; item: ShoppingItem }
  | { kind: 'pantry'; id: string; title: string; subtitle: string; item: PantryItem }
  | { kind: 'task'; id: string; title: string; subtitle: string; done: boolean; item: HomeTask }
  | { kind: 'wish'; id: string; title: string; subtitle: string; done: boolean; isPrivate: boolean; item: WishItem };

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  state: AppState;
  onNavigateTab: (tab: TabId, marketSub?: MarketSubTab) => void;
  onSelectEvent: (ev: CoupleEvent) => void;
  onSelectShopping: (item: ShoppingItem) => void;
  onSelectPantry: (item: PantryItem) => void;
  onSelectTask: (task: HomeTask) => void;
  onSelectWish: (wish: WishItem) => void;
}

const KIND_LABELS: Record<SearchResultItem['kind'], string> = {
  event: 'رویداد',
  shopping: 'لیست خرید',
  pantry: 'انبار خانه',
  task: 'کار منزل',
  wish: 'آرزو و ایده',
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  open,
  onClose,
  state,
  onNavigateTab,
  onSelectEvent,
  onSelectShopping,
  onSelectPantry,
  onSelectTask,
  onSelectWish,
}) => {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIdx(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [open]);

  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const out: SearchResultItem[] = [];

    for (const ev of state.events) {
      const hay = `${ev.title} ${ev.category} ${ev.note || ''} ${ev.dateKey}`.toLowerCase();
      if (hay.includes(q)) {
        out.push({
          kind: 'event',
          id: `ev-${ev.id}`,
          title: ev.title,
          subtitle: `${ev.category} · ${formatJalaliFull(ev.dateKey)}`,
          item: ev,
        });
      }
    }

    for (const item of state.shopping) {
      const hay = `${item.title} ${item.category} ${item.qty} ${item.note} ${item.tags.join(' ')}`.toLowerCase();
      if (hay.includes(q)) {
        const parts = [item.category, item.qty, state.partners[item.addedBy]].filter(Boolean);
        out.push({
          kind: 'shopping',
          id: `sh-${item.id}`,
          title: item.title,
          subtitle: parts.join(' · '),
          done: item.done,
          item,
        });
      }
    }

    for (const item of state.pantry) {
      const hay = `${item.title} ${item.category} ${item.qty} ${item.note} ${item.tags.join(' ')}`.toLowerCase();
      if (hay.includes(q)) {
        const statusFa =
          item.status === 'ok' ? 'موجود' : item.status === 'low' ? 'رو به اتمام' : 'تمام شده';
        const parts = [statusFa, item.category, item.qty].filter(Boolean);
        out.push({
          kind: 'pantry',
          id: `pn-${item.id}`,
          title: item.title,
          subtitle: parts.join(' · '),
          item,
        });
      }
    }

    for (const t of state.tasks) {
      const assigneeName = t.assignee === 'both' ? 'دوتایی' : state.partners[t.assignee];
      const hay = `${t.title} ${t.category} ${assigneeName} ${t.note} ${t.tags.join(' ')}`.toLowerCase();
      if (hay.includes(q)) {
        out.push({
          kind: 'task',
          id: `tk-${t.id}`,
          title: t.title,
          subtitle: `${t.category} · ${assigneeName}`,
          done: t.done,
          item: t,
        });
      }
    }

    // Privacy invariant: never reveal partner's private wishes in global search
    for (const w of state.wishes) {
      if (w.isPrivate && w.addedBy !== state.myAccount) continue;
      const hay = `${w.title} ${w.category} ${w.note} ${w.tags.join(' ')}`.toLowerCase();
      if (hay.includes(q)) {
        out.push({
          kind: 'wish',
          id: `ws-${w.id}`,
          title: w.title,
          subtitle: `${w.category} · ${w.isPrivate ? 'خصوصی' : state.partners[w.addedBy]}`,
          done: w.done,
          isPrivate: w.isPrivate,
          item: w,
        });
      }
    }

    return out.slice(0, 30);
  }, [query, state]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const handleSelectResult = (res: SearchResultItem) => {
    onClose();
    switch (res.kind) {
      case 'event':
        onSelectEvent(res.item);
        break;
      case 'shopping':
        onSelectShopping(res.item);
        break;
      case 'pantry':
        onSelectPantry(res.item);
        break;
      case 'task':
        onSelectTask(res.item);
        break;
      case 'wish':
        onSelectWish(res.item);
        break;
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown' && results.length > 0) {
        e.preventDefault();
        setActiveIdx((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp' && results.length > 0) {
        e.preventDefault();
        setActiveIdx((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        const chosen = results[activeIdx] || results[0];
        if (chosen) handleSelectResult(chosen);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const visibleWishCount = state.wishes.filter(
    (w) => !w.isPrivate || w.addedBy === state.myAccount
  ).length;

  const renderIcon = (kind: SearchResultItem['kind']) => {
    switch (kind) {
      case 'event':
        return <CalendarDays className="w-4 h-4 shrink-0" style={{ color: 'var(--md-primary)' }} />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 shrink-0" style={{ color: 'var(--md-primary)' }} />;
      case 'pantry':
        return <Package className="w-4 h-4 shrink-0" style={{ color: 'var(--md-warning)' }} />;
      case 'task':
        return <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--md-success)' }} />;
      case 'wish':
        return <Heart className="w-4 h-4 shrink-0" style={{ color: 'var(--pastel-rose)' }} />;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8vh] sm:pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="جستجوی سراسری دوتایی"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl rounded-3xl overflow-hidden flex flex-col max-h-[76dvh]"
            style={{
              backgroundColor: 'var(--md-card)',
              border: '1px solid var(--md-outline-variant)',
              boxShadow: 'var(--md-shadow-2)',
            }}
          >
            {/* Search Input Header */}
            <div
              className="flex items-center gap-2.5 px-4 py-3 border-b"
              style={{ borderColor: 'var(--md-outline-variant)' }}
            >
              <Search className="w-5 h-5 shrink-0" style={{ color: 'var(--md-primary)' }} />
              <label htmlFor="global-search-input" className="sr-only">
                جستجو در رویدادها، خرید، انبار، کارها و آرزوها
              </label>
              <input
                ref={inputRef}
                id="global-search-input"
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base font-medium min-h-[36px]"
                style={{ color: 'var(--md-on-surface)' }}
                placeholder="جستجو در رویدادها، خرید، انبار، کارها و آرزوها..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="text-xs font-semibold px-2 py-1 rounded-lg cursor-pointer"
                  style={{ color: 'var(--md-on-surface-variant)' }}
                >
                  پاک کردن
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="m3-icon-btn !min-w-[36px] !min-h-[36px]"
                aria-label="بستن جستجو"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-3 space-y-2">
              {!query.trim() ? (
                <div className="space-y-3 p-1">
                  <p
                    className="text-xs font-semibold px-1"
                    style={{ color: 'var(--md-on-surface-variant)' }}
                  >
                    پرش سریع به بخش‌ها
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: 'تقویم و رویدادها',
                        count: state.events.length,
                        icon: <CalendarDays className="w-4 h-4" style={{ color: 'var(--md-primary)' }} />,
                        action: () => {
                          onClose();
                          onNavigateTab('calendar');
                        },
                      },
                      {
                        label: 'لیست خرید',
                        count: state.shopping.filter((i) => !i.done).length,
                        icon: <ShoppingBag className="w-4 h-4" style={{ color: 'var(--md-primary)' }} />,
                        action: () => {
                          onClose();
                          onNavigateTab('market', 'shopping');
                        },
                      },
                      {
                        label: 'انبار خانه',
                        count: state.pantry.length,
                        icon: <Package className="w-4 h-4" style={{ color: 'var(--md-warning)' }} />,
                        action: () => {
                          onClose();
                          onNavigateTab('market', 'pantry');
                        },
                      },
                      {
                        label: 'کارهای منزل',
                        count: state.tasks.filter((t) => !t.done).length,
                        icon: <Sparkles className="w-4 h-4" style={{ color: 'var(--md-success)' }} />,
                        action: () => {
                          onClose();
                          onNavigateTab('tasks');
                        },
                      },
                      {
                        label: 'دفترچه آرزوها',
                        count: visibleWishCount,
                        icon: <Heart className="w-4 h-4" style={{ color: 'var(--pastel-rose)' }} />,
                        action: () => {
                          onClose();
                          onNavigateTab('wishes');
                        },
                      },
                    ].map((shortcut) => (
                      <button
                        key={shortcut.label}
                        type="button"
                        onClick={shortcut.action}
                        className="p-3 rounded-2xl flex items-center justify-between gap-2 text-right cursor-pointer transition-colors"
                        style={{
                          backgroundColor: 'var(--md-surface-low)',
                          border: '1px solid var(--md-outline-variant)',
                        }}
                      >
                        <span className="flex items-center gap-2 text-xs font-bold min-w-0 truncate">
                          {shortcut.icon}
                          <span className="truncate">{shortcut.label}</span>
                        </span>
                        <span
                          className="text-xs font-bold tabular-nums shrink-0"
                          style={{ color: 'var(--md-on-surface-variant)' }}
                        >
                          {toFa(shortcut.count)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="py-10 text-center space-y-1">
                  <p className="text-sm font-bold">نتیجه‌ای برای «{query.trim()}» پیدا نشد</p>
                  <p className="text-xs" style={{ color: 'var(--md-on-surface-variant)' }}>
                    عبارت دیگری یا نام یک دسته‌بندی و تگ را امتحان کنید.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p
                    className="text-[11px] font-semibold px-2 pb-1 tabular-nums"
                    style={{ color: 'var(--md-on-surface-variant)' }}
                  >
                    {toFa(results.length)} نتیجه یافت شد
                  </p>
                  {results.map((res, idx) => {
                    const isActive = idx === activeIdx;
                    const isDone = 'done' in res && res.done;
                    return (
                      <button
                        key={res.id}
                        type="button"
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => handleSelectResult(res)}
                        className="w-full px-3 py-2.5 rounded-2xl flex items-center gap-3 text-right cursor-pointer transition-colors"
                        style={{
                          backgroundColor: isActive
                            ? 'var(--md-primary-container)'
                            : 'transparent',
                        }}
                      >
                        <span
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: isActive ? 'var(--md-card)' : 'var(--md-surface-low)',
                            border: '1px solid var(--md-outline-variant)',
                          }}
                        >
                          {renderIcon(res.kind)}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-sm font-bold truncate ${isDone ? 'line-through opacity-60' : ''}`}
                            >
                              {res.title}
                            </span>
                            {isDone && (
                              <CheckCircle2
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: 'var(--md-success)' }}
                              />
                            )}
                            {res.kind === 'wish' && res.isPrivate && (
                              <Lock
                                className="w-3 h-3 shrink-0"
                                style={{ color: 'var(--md-primary)' }}
                              />
                            )}
                          </div>
                          <div
                            className="text-xs flex items-center gap-1.5 truncate mt-0.5"
                            style={{ color: 'var(--md-on-surface-variant)' }}
                          >
                            <span className="font-semibold" style={{ color: 'var(--md-primary)' }}>
                              {KIND_LABELS[res.kind]}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{res.subtitle}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Hint (Desktop) */}
            <div
              className="hidden sm:flex items-center justify-between px-4 py-2 border-t text-[11px]"
              style={{
                borderColor: 'var(--md-outline-variant)',
                backgroundColor: 'var(--md-surface-low)',
                color: 'var(--md-on-surface-variant)',
              }}
            >
              <span>برای حرکت از ↑↓ و برای باز کردن از Enter استفاده کنید</span>
              <span dir="ltr" className="font-mono font-semibold">
                Ctrl / ⌘ + K
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
