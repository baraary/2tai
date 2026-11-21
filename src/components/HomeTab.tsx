import React, { useState } from 'react';
import {
  Check,
  ChevronLeft,
  Heart,
  Lock,
  Pin,
  Plus,
  Send,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { PULSE_MOODS } from '../data/assets';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { CoupleEvent, TabId } from '../types/app';
import {
  daysBetweenJalaliAndToday,
  formatRelativeDaysFa,
  JALALI_MONTHS,
  toFa,
} from '../utils/jalali';
import { HeroShowcase } from './HeroShowcase';
import { isMemorySealed } from './GratitudeJarModal';
import { PartnerAvatar } from './PartnerAvatar';

const QUICK_NUDGE_PRESETS = [
  { emoji: '🤍', message: 'دلم برات تنگ شده' },
  { emoji: '☕', message: 'چای دم کردم، بیا!' },
  { emoji: '🫂', message: 'بغل می‌خوام' },
  { emoji: '🍽️', message: 'امشب شام چی بخوریم؟' },
  { emoji: '🛍️', message: 'چیزی از بیرون لازم داری؟' },
  { emoji: '✨', message: 'خسته نباشی عزیزم' },
];

interface HomeTabProps {
  store: CoupleStore;
  onNavigate: (tab: TabId) => void;
  onOpenEventModal: (ev?: CoupleEvent) => void;
  onOpenMarketModal: () => void;
  onOpenTaskModal: () => void;
  onOpenWishModal: () => void;
  onOpenGratitudeJar: (initialView?: 'jar' | 'add') => void;
  isModalOpen: boolean;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  store,
  onNavigate,
  onOpenEventModal,
  onOpenMarketModal,
  onOpenTaskModal,
  onOpenWishModal,
  onOpenGratitudeJar,
  isModalOpen,
}) => {
  const { state, todayJalali } = store;
  const myAcc = state.myAccount;
  const partnerAcc = myAcc === 'p1' ? 'p2' : 'p1';
  const myPulse = state.dailyPulse[myAcc];
  const partnerPulse = state.dailyPulse[partnerAcc];

  const [pulseOpen, setPulseOpen] = useState(false);
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const [pulseMood, setPulseMood] = useState(myPulse.mood || '😊');
  const [pulseNote, setPulseNote] = useState(myPulse.note || '');
  const [customNudge, setCustomNudge] = useState('');

  const incomingNudge =
    state.quickNudge &&
    state.quickNudge.from !== myAcc &&
    state.quickNudge.seenBy !== myAcc
      ? state.quickNudge
      : null;

  const sortPreview = <T extends { pinned?: boolean; order?: number; updatedAt: number }>(
    list: T[]
  ) =>
    [...list].sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
      const oa = a.order ?? Number.MAX_SAFE_INTEGER;
      const ob = b.order ?? Number.MAX_SAFE_INTEGER;
      if (oa !== ob) return oa - ob;
      return b.updatedAt - a.updatedAt;
    });

  const pendingShop = sortPreview(state.shopping.filter((i) => !i.done)).slice(0, 4);
  const alertPantry = state.pantry
    .filter((p) => {
      if (p.status !== 'ok') return true;
      if (p.expiryDate) {
        const rem = daysBetweenJalaliAndToday(p.expiryDate);
        if (rem !== null && rem <= 5) return true;
      }
      return false;
    })
    .slice(0, 3);

  const pendingTasks = sortPreview(state.tasks.filter((t) => !t.done)).slice(0, 4);
  const visibleWishes = sortPreview(
    state.wishes.filter((w) => !w.done && (!w.isPrivate || w.addedBy === myAcc))
  ).slice(0, 4);

  const [ty, tm, td] = todayJalali;
  const todayLabel = `${toFa(td)} ${JALALI_MONTHS[tm - 1]} ${toFa(ty)}`;

  const handleSavePulse = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateDailyPulse(pulseMood, pulseNote);
    setPulseOpen(false);
  };

  const handleSendCustomNudge = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customNudge.trim();
    if (!trimmed) return;
    store.sendQuickNudge('💌', trimmed);
    setCustomNudge('');
    setNudgeOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Incoming Pastel Love Nudge Banner */}
      <AnimatePresence>
        {incomingNudge && (
          <motion.section
            key={incomingNudge.id}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
            style={{
              backgroundColor: 'var(--pastel-rose-soft)',
              border: '1px solid var(--md-outline-variant)',
            }}
            aria-label="تلنگر عاشقانه جدید"
          >
            <div className="flex items-center gap-3 min-w-0">
              <PartnerAvatar
                partner={incomingNudge.from}
                name={state.partners[incomingNudge.from]}
                avatar={state.partnerAvatars[incomingNudge.from]}
                size="md"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold" style={{ color: 'var(--pastel-rose)' }}>
                  تلنگر از {state.partners[incomingNudge.from]}
                </div>
                <p className="text-sm md:text-base font-extrabold mt-0.5 break-words">
                  <span className="ml-1.5">{incomingNudge.emoji}</span>
                  <span>{incomingNudge.message}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => store.dismissQuickNudge(true)}
                className="m3-btn-primary text-xs !min-h-[40px] px-3.5"
                style={{ backgroundColor: 'var(--pastel-rose)', color: '#FFFFFF' }}
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>قلب بفرست</span>
              </button>
              <button
                type="button"
                onClick={() => store.dismissQuickNudge(false)}
                className="m3-btn-tonal text-xs !min-h-[40px] px-3"
                style={{ backgroundColor: 'var(--md-card)' }}
              >
                دیدم
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Greeting & Today Date Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--md-on-surface-variant)' }}>
            امروز {todayLabel}
          </p>
          <h1 className="text-xl md:text-2xl font-black mt-0.5">
            سلام {state.partners[myAcc]} عزیز
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setPulseOpen(false);
              setNudgeOpen((v) => !v);
            }}
            className="m3-btn-tonal text-xs px-3"
            style={
              nudgeOpen
                ? {
                    backgroundColor: 'var(--pastel-rose-soft)',
                    borderColor: 'var(--pastel-rose)',
                    color: 'var(--pastel-rose)',
                  }
                : undefined
            }
          >
            <Heart className="w-3.5 h-3.5" style={{ color: 'var(--pastel-rose)' }} />
            <span>تلنگر</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setNudgeOpen(false);
              setPulseMood(myPulse.mood || '😊');
              setPulseNote(myPulse.note || '');
              setPulseOpen((v) => !v);
            }}
            className="m3-btn-tonal text-xs px-3"
            style={
              pulseOpen
                ? {
                    backgroundColor: 'var(--md-primary-container)',
                    borderColor: 'var(--md-primary)',
                    color: 'var(--md-on-primary-container)',
                  }
                : undefined
            }
          >
            <span className="text-base leading-none">{myPulse.mood || '😊'}</span>
            <span>حال‌وهوا</span>
          </button>
        </div>
      </div>

      {/* Couple Daily Pulse & Quick Nudge Card — Sky & Rose Pastel Harmony */}
      <section className="m3-surface-card rounded-3xl p-4 md:p-5 space-y-3" aria-label="حال‌وهوای امروز زوجین">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {([myAcc, partnerAcc] as const).map((acc) => {
            const p = state.dailyPulse[acc];
            const isMe = acc === myAcc;
            const softBg = acc === 'p1' ? 'var(--pastel-sky-soft)' : 'var(--pastel-rose-soft)';
            const accentInk = acc === 'p1' ? 'var(--pastel-sky)' : 'var(--pastel-rose)';
            return (
              <div
                key={acc}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{
                  backgroundColor: softBg,
                  border: '1px solid var(--md-outline-variant)',
                }}
              >
                <div className="relative shrink-0">
                  <PartnerAvatar
                    partner={acc}
                    name={state.partners[acc]}
                    avatar={state.partnerAvatars[acc]}
                    size="lg"
                  />
                  <span
                    className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm"
                    style={{
                      backgroundColor: 'var(--md-card)',
                      border: '1px solid var(--md-outline-variant)',
                    }}
                    title={`حال‌وهوای ${state.partners[acc]}`}
                  >
                    {p.mood || (isMe ? '😊' : '🤍')}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold">
                    <span style={{ color: accentInk }}>{state.partners[acc]}</span>
                    {isMe && (
                      <span style={{ color: 'var(--md-on-surface-variant)' }}>· شما</span>
                    )}
                  </div>
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: 'var(--md-on-surface-variant)' }}
                  >
                    {p.note || (isMe ? 'یادداشت کوتاه امروزت رو بنویس...' : 'هنوز یادداشتی ثبت نکرده')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {nudgeOpen && (
            <motion.div
              key="nudge-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div
                className="pt-3 border-t space-y-3"
                style={{ borderColor: 'var(--md-outline-variant)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--pastel-rose)' }}>
                    تلنگر سریع برای {state.partners[partnerAcc]}
                  </span>
                  {state.quickNudge?.from === myAcc && (
                    <span className="text-[11px]" style={{ color: 'var(--md-on-surface-variant)' }}>
                      {state.quickNudge.seenBy === partnerAcc
                        ? 'تلنگر قبلی دیده شد 🤍'
                        : 'تلنگر قبلی ارسال شده'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_NUDGE_PRESETS.map((preset) => (
                    <button
                      key={preset.message}
                      type="button"
                      onClick={() => {
                        store.sendQuickNudge(preset.emoji, preset.message);
                        setNudgeOpen(false);
                      }}
                      className="min-h-[42px] px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 text-right cursor-pointer transition-transform active:scale-95"
                      style={{
                        backgroundColor: 'var(--md-surface-low)',
                        border: '1px solid var(--md-outline-variant)',
                      }}
                    >
                      <span className="text-base leading-none shrink-0">{preset.emoji}</span>
                      <span className="truncate">{preset.message}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendCustomNudge} className="flex items-center gap-2">
                  <label htmlFor="custom-nudge-input" className="sr-only">
                    پیام تلنگر دلخواه
                  </label>
                  <input
                    id="custom-nudge-input"
                    type="text"
                    maxLength={120}
                    className="m3-input"
                    placeholder={`یا یک تلنگر دلخواه برای ${state.partners[partnerAcc]} بنویس...`}
                    value={customNudge}
                    onChange={(e) => setCustomNudge(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="m3-btn-primary shrink-0 px-4"
                    style={{ backgroundColor: 'var(--pastel-rose)', color: '#FFFFFF' }}
                    aria-label="ارسال تلنگر"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {pulseOpen && (
            <motion.form
              key="pulse-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSavePulse}
              className="overflow-hidden"
            >
              <div
                className="pt-3 border-t space-y-3"
                style={{ borderColor: 'var(--md-outline-variant)' }}
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PULSE_MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPulseMood(m)}
                      className="w-10 h-10 rounded-xl text-lg flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                      style={{
                        backgroundColor:
                          pulseMood === m
                            ? 'var(--md-primary-container)'
                            : 'var(--md-surface-low)',
                        border:
                          pulseMood === m
                            ? '1.5px solid var(--md-primary)'
                            : '1px solid var(--md-outline-variant)',
                      }}
                      aria-label={`انتخاب حس ${m}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="daily-pulse-note" className="sr-only">
                    یادداشت کوتاه برای همسرت
                  </label>
                  <input
                    id="daily-pulse-note"
                    type="text"
                    maxLength={140}
                    className="m3-input"
                    placeholder={`یک جمله کوتاه برای ${state.partners[partnerAcc]}...`}
                    value={pulseNote}
                    onChange={(e) => setPulseNote(e.target.value)}
                  />
                  <button type="submit" className="m3-btn-primary shrink-0 px-4" aria-label="ثبت حال‌وهوا">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </section>

      {/* Isolated Hero Countdown Showcase */}
      <HeroShowcase
        events={state.events}
        eventCategories={state.eventCategories}
        displayMode={state.heroDisplayMode}
        onToggleDisplayMode={store.toggleHeroDisplayMode}
        onEditEvent={(ev) => onOpenEventModal(ev)}
        onAddFirstEvent={() => onOpenEventModal()}
        isModalOpen={isModalOpen}
        soundEnabled={state.soundEnabled}
      />

      {/* Responsive 2-Column Dashboard Grid with Multi-Pastel Section Harmony */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Market & Pantry Preview — Mint Pastel Identity */}
        <section className="m3-surface-card rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-extrabold flex items-center gap-2.5">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'var(--pastel-mint-soft)',
                  color: 'var(--pastel-mint)',
                }}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
              </span>
              <span>خرید و انبار خانه</span>
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenMarketModal}
                className="m3-icon-btn"
                aria-label="افزودن کالا"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('market')}
                className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-2 rounded-xl cursor-pointer"
                style={{ color: 'var(--pastel-mint)' }}
              >
                <span>همه</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {pendingShop.length === 0 && alertPantry.length === 0 ? (
            <p
              className="text-sm py-6 text-center rounded-2xl"
              style={{
                backgroundColor: 'var(--md-surface-low)',
                color: 'var(--md-on-surface-variant)',
              }}
            >
              لیست خرید خالی است و وضعیت انبار خانه مرتب است.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--md-outline-variant)' }}>
              {pendingShop.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => store.toggleShoppingDone(item.id)}
                    className="flex-1 min-w-0 min-h-[44px] flex items-center gap-3 text-right cursor-pointer"
                  >
                    <span
                      className="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0"
                      style={{
                        borderColor: item.done ? 'var(--md-primary)' : 'var(--md-outline)',
                        backgroundColor: item.done ? 'var(--md-primary)' : 'transparent',
                        color: 'var(--md-on-primary)',
                      }}
                    >
                      {item.done && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate flex items-center gap-1.5">
                        {item.pinned && (
                          <Pin className="w-3 h-3 shrink-0" style={{ color: 'var(--md-primary)' }} />
                        )}
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div
                        className="text-xs flex items-center gap-1.5 truncate"
                        style={{ color: 'var(--md-on-surface-variant)' }}
                      >
                        <span>{item.category}</span>
                        {item.qty && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.qty}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <PartnerAvatar
                            partner={item.addedBy}
                            name={state.partners[item.addedBy]}
                            avatar={state.partnerAvatars[item.addedBy]}
                            size="xs"
                          />
                          <span>{state.partners[item.addedBy]}</span>
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              ))}

              {alertPantry.map((p) => {
                const rem = p.expiryDate ? daysBetweenJalaliAndToday(p.expiryDate) : null;
                return (
                  <div key={p.id} className="flex items-center justify-between gap-2 py-2.5">
                    <button
                      type="button"
                      onClick={() => store.cyclePantryStatus(p.id)}
                      className="flex-1 min-w-0 min-h-[44px] text-right cursor-pointer"
                    >
                      <div className="text-sm font-bold truncate">{p.title}</div>
                      <div
                        className="text-xs flex items-center gap-1.5 flex-wrap"
                        style={{
                          color:
                            p.status === 'empty' || (rem !== null && rem <= 1)
                              ? 'var(--md-danger)'
                              : 'var(--md-warning)',
                        }}
                      >
                        {p.status !== 'ok' && (
                          <span>{p.status === 'empty' ? 'تمام شده' : 'رو به اتمام'}</span>
                        )}
                        {p.status !== 'ok' && rem !== null && rem <= 5 && (
                          <span aria-hidden="true">·</span>
                        )}
                        {rem !== null && rem <= 5 && (
                          <span>
                            {rem < 0
                              ? 'منقضی شده'
                              : rem === 0
                                ? 'انقضا امروز'
                                : `انقضا ${formatRelativeDaysFa(rem)}`}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => store.movePantryToShopping(p.id)}
                      className="px-3 min-h-[40px] rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                      style={{
                        backgroundColor: 'var(--md-primary-container)',
                        color: 'var(--md-on-primary-container)',
                      }}
                    >
                      + به خرید
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Home Tasks Preview — Sky Pastel Identity */}
        <section className="m3-surface-card rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-extrabold flex items-center gap-2.5">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'var(--pastel-sky-soft)',
                  color: 'var(--pastel-sky)',
                }}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
              </span>
              <span>کارهای پیش‌روی خانه</span>
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenTaskModal}
                className="m3-icon-btn"
                aria-label="افزودن کار خانه"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-2 rounded-xl cursor-pointer"
                style={{ color: 'var(--pastel-sky)' }}
              >
                <span>همه</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {pendingTasks.length === 0 ? (
            <p
              className="text-sm py-6 text-center rounded-2xl"
              style={{
                backgroundColor: 'var(--md-surface-low)',
                color: 'var(--md-on-surface-variant)',
              }}
            >
              کار انجام‌نشده‌ای برای خانه وجود ندارد.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--md-outline-variant)' }}>
              {pendingTasks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => store.toggleTaskDone(t.id)}
                  className="w-full min-h-[52px] py-2.5 flex items-center gap-3 text-right cursor-pointer"
                >
                  <span
                    className="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: 'var(--md-outline)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold truncate flex items-center gap-1.5">
                      {t.pinned && (
                        <Pin className="w-3 h-3 shrink-0" style={{ color: 'var(--md-primary)' }} />
                      )}
                      <span className="truncate">{t.title}</span>
                    </div>
                    <div
                      className="text-xs flex items-center gap-1.5 truncate"
                      style={{ color: 'var(--md-on-surface-variant)' }}
                    >
                      <span>{t.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        {t.assignee !== 'both' && (
                          <PartnerAvatar
                            partner={t.assignee}
                            name={state.partners[t.assignee]}
                            avatar={state.partnerAvatars[t.assignee]}
                            size="xs"
                          />
                        )}
                        <span>
                          {t.assignee === 'both' ? 'دوتایی' : state.partners[t.assignee]}
                        </span>
                      </span>
                      {t.freq !== 'یک‌بار' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{t.freq}</span>
                        </>
                      )}
                      {t.priority === 'high' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span style={{ color: 'var(--md-danger)', fontWeight: 700 }}>فوری</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Wishes Preview — Rose Pastel Identity */}
        <section className="m3-surface-card rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-extrabold flex items-center gap-2.5">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'var(--pastel-rose-soft)',
                  color: 'var(--pastel-rose)',
                }}
              >
                <Heart className="w-4 h-4 shrink-0" />
              </span>
              <span>آرزوها و ایده‌های دوتایی</span>
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenWishModal}
                className="m3-icon-btn"
                aria-label="افزودن آرزو"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('wishes')}
                className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-2 rounded-xl cursor-pointer"
                style={{ color: 'var(--pastel-rose)' }}
              >
                <span>همه</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {visibleWishes.length === 0 ? (
            <p
              className="text-sm py-6 text-center rounded-2xl"
              style={{
                backgroundColor: 'var(--md-surface-low)',
                color: 'var(--md-on-surface-variant)',
              }}
            >
              هنوز آرزو یا ایده هدیه‌ای ثبت نشده است.
            </p>
          ) : (
            <div className="space-y-2">
              {visibleWishes.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => store.toggleWishDone(w.id)}
                  className="w-full p-3 rounded-2xl flex items-center gap-3 text-right cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--md-outline-variant)',
                  }}
                >
                  <span
                    className="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: 'var(--md-outline)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold truncate flex items-center gap-1.5">
                      {w.pinned && (
                        <Pin className="w-3 h-3 shrink-0" style={{ color: 'var(--pastel-rose)' }} />
                      )}
                      <span className="truncate">{w.title}</span>
                      {w.localOnly && (
                        <Lock
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: 'var(--pastel-rose)' }}
                        />
                      )}
                    </div>
                    <div
                      className="text-xs flex items-center gap-1.5 truncate"
                      style={{ color: 'var(--md-on-surface-variant)' }}
                    >
                      <span>{w.category}</span>
                      {w.isPrivate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{w.localOnly ? 'کاملاً خصوصی (فقط این گوشی)' : 'خصوصی'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Gratitude Jar & Time Capsule — Lavender Pastel Identity */}
        <section className="m3-surface-card rounded-3xl p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-extrabold flex items-center gap-2.5">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm"
                  style={{
                    backgroundColor: 'var(--pastel-lavender-soft)',
                    color: 'var(--pastel-lavender)',
                  }}
                >
                  ✨
                </span>
                <span>شیشه خاطرات و کپسول زمان</span>
              </h2>
              <button
                type="button"
                onClick={() => onOpenGratitudeJar('jar')}
                className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-2 rounded-xl cursor-pointer"
                style={{ color: 'var(--pastel-lavender)' }}
              >
                <span>مشاهده همه</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const unlocked = state.memories.filter((m) => !isMemorySealed(m));
              const sealedCount = state.memories.length - unlocked.length;
              const latest = unlocked[0];
              return (
                <div
                  className="rounded-2xl p-4 space-y-2"
                  style={{
                    backgroundColor: 'var(--pastel-lavender-soft)',
                    border: '1px solid var(--md-outline-variant)',
                  }}
                >
                  <div
                    className="text-xs font-bold flex items-center gap-1.5 tabular-nums"
                    style={{ color: 'var(--pastel-lavender)' }}
                  >
                    <span>{toFa(unlocked.length)} خاطره باز</span>
                    {sealedCount > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{toFa(sealedCount)} کپسول زمان مهروموم 🔒</span>
                      </>
                    )}
                  </div>
                  {latest ? (
                    <p className="text-xs sm:text-sm leading-6 line-clamp-2 font-medium">
                      <span className="ml-1">{latest.emoji}</span>
                      <span>«{latest.text}»</span>
                    </p>
                  ) : (
                    <p
                      className="text-xs leading-6"
                      style={{ color: 'var(--md-on-surface-variant)' }}
                    >
                      یادداشت‌های قدردانی، لحظه‌های قشنگ یا کپسول زمان برای سالگرد بعدی‌تان را در
                      این شیشه بیندازید.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenGratitudeJar('jar')}
              className="m3-btn-primary flex-1 text-xs !min-h-[42px]"
              style={{ backgroundColor: 'var(--pastel-lavender)', color: '#FFFFFF' }}
            >
              <span>یه خاطره شانسی ✨</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenGratitudeJar('add')}
              className="m3-btn-tonal text-xs !min-h-[42px] px-3.5"
            >
              <Plus className="w-4 h-4" />
              <span>یادداشت جدید</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
