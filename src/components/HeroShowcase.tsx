import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Layers, PartyPopper, Plus, SlidersHorizontal } from 'lucide-react';
import { CategoryIcon, HeroArtwork } from '../data/assets';
import type { CategoryItem, CoupleEvent, HeroDisplayMode } from '../types/app';
import { launchPastelConfetti, triggerHaptic } from '../utils/celebration';
import { getNextOccurrenceInfo, JALALI_MONTHS, toFa } from '../utils/jalali';
import { playSound } from '../utils/soundEffects';

interface HeroShowcaseProps {
  events: CoupleEvent[];
  eventCategories: CategoryItem[];
  displayMode: HeroDisplayMode;
  onToggleDisplayMode: () => void;
  onEditEvent: (ev: CoupleEvent) => void;
  onAddFirstEvent: () => void;
  isModalOpen: boolean;
  soundEnabled?: boolean;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  events,
  eventCategories,
  displayMode,
  onToggleDisplayMode,
  onEditEvent,
  onAddFirstEvent,
  isModalOpen,
  soundEnabled = true,
}) => {
  const [now, setNow] = useState(() => new Date());
  const [slideIdx, setSlideIdx] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);
  const celebratedRef = useRef(false);

  // Isolated 30-second countdown tick
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const heroEvents = useMemo(() => {
    if (events.length === 0) return [];
    const pinned = events.filter((e) => e.pinned);
    const seedList = pinned.length > 0 ? pinned : [events[0]];
    const byId = new Map<string, CoupleEvent>();

    for (const pe of seedList) {
      byId.set(pe.id, pe);
      const [py, pm, pd] = pe.dateKey.split('-').map(Number);
      for (const other of events) {
        if (byId.has(other.id)) continue;
        const [oy, om, od] = other.dateKey.split('-').map(Number);
        if (om === pm && od === pd && (oy === py || pe.repeatYearly || other.repeatYearly)) {
          byId.set(other.id, other);
        }
      }
    }

    return Array.from(byId.values()).sort((a, b) => {
      const ia = getNextOccurrenceInfo(a, now);
      const ib = getNextOccurrenceInfo(b, now);
      if (ia.isPast !== ib.isPast) return ia.isPast ? 1 : -1;
      return ia.diffMs - ib.diffMs;
    });
  }, [events, now]);

  const safeIdx = heroEvents.length > 0 ? slideIdx % heroEvents.length : 0;

  useEffect(() => {
    if (displayMode !== 'slider' || heroEvents.length <= 1 || isModalOpen) return;
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % heroEvents.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [displayMode, heroEvents.length, isModalOpen]);

  // Trigger pastel celebration confetti once per session when a special event is today!
  useEffect(() => {
    if (celebratedRef.current || heroEvents.length === 0) return;
    const hasToday = heroEvents.some((ev) => getNextOccurrenceInfo(ev, now).isToday);
    if (hasToday) {
      celebratedRef.current = true;
      const timer = window.setTimeout(() => {
        launchPastelConfetti('celebration');
        triggerHaptic('celebrate');
      }, 450);
      return () => window.clearTimeout(timer);
    }
  }, [heroEvents, now]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    swipedRef.current = false;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0 || heroEvents.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      swipedRef.current = true;
      setSlideIdx((prev) => (prev + (dx > 0 ? 1 : -1) + heroEvents.length) % heroEvents.length);
    }
  };

  if (heroEvents.length === 0) {
    return (
      <section className="m3-hero-gradient rounded-3xl p-6 relative overflow-hidden text-white shadow-sm">
        {/* Soft Studio Light Halo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -left-10 w-44 h-44 rounded-full bg-white/20 blur-2xl"
        />
        <div className="relative flex items-center justify-between gap-5">
          <div className="space-y-2 min-w-0">
            <p className="text-xs font-bold text-white/85">شمارش معکوس مناسبت‌ها</p>
            <h2 className="text-xl md:text-2xl font-black leading-snug text-white">
              هنوز مناسبت ویژه‌ای ثبت نشده
            </h2>
            <p className="text-sm text-white/90">
              سالگرد آشنایی، تولد یا سفر بعدی را ثبت کنید تا کارت‌پستال شمارشگر زنده فعال شود.
            </p>
            <button
              type="button"
              onClick={onAddFirstEvent}
              className="mt-2 min-h-[44px] px-4 py-2 rounded-2xl text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer transition-transform active:scale-95 bg-white text-slate-900 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت اولین رویداد</span>
            </button>
          </div>
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 hidden sm:block drop-shadow-[0_8px_18px_rgba(15,23,42,0.12)]">
            <HeroArtwork artKey="rings" />
          </div>
        </div>
      </section>
    );
  }

  const renderCard = (ev: CoupleEvent, idx: number, isSlider: boolean) => {
    const info = getNextOccurrenceInfo(ev, now);
    const catObj = eventCategories.find((c) => c.name === ev.category);
    const artKey = ev.heroArt || catObj?.heroArt || 'hearts';

    const totalMins = Math.floor(info.diffMs / 60000);
    const days = Math.floor(totalMins / (60 * 24));
    const hours = Math.floor((totalMins % (60 * 24)) / 60);
    const mins = totalMins % 60;

    const dateLine = `${toFa(info.targetJalaliDay)} ${JALALI_MONTHS[info.targetJalaliMonth - 1]} ${toFa(info.targetJalaliYear)}${ev.time ? ` · ساعت ${toFa(ev.time)}` : ''}`;

    return (
      <article
        key={ev.id}
        onTouchStart={isSlider ? handleTouchStart : undefined}
        onTouchEnd={isSlider ? handleTouchEnd : undefined}
        className="m3-hero-gradient rounded-3xl p-5 md:p-6 relative overflow-hidden text-white"
        style={{ boxShadow: 'var(--md-shadow-2)' }}
      >
        {/* Ambient Soft Light Halos */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-14 -left-12 w-48 h-48 rounded-full bg-white/20 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-12 w-44 h-44 rounded-full bg-white/15 blur-2xl"
        />

        <div className="relative flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (swipedRef.current) return;
              onEditEvent(ev);
            }}
            className="flex-1 min-w-0 text-right space-y-2 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white/90">
              <CategoryIcon name={catObj?.icon || 'heart'} className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{ev.category}</span>
              {info.yearsElapsed > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>سال {toFa(info.yearsElapsed)}ام</span>
                </>
              )}
              {info.isPast && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>برگزار شده</span>
                </>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-black leading-snug truncate text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
              {ev.title}
            </h2>
            <p className="text-xs md:text-sm tabular-nums text-white/90 font-medium">
              {info.isToday ? `امروز است! ✨ · ${dateLine}` : dateLine}
            </p>

            {!info.isPast ? (
              <div className="flex items-center gap-2 pt-2 tabular-nums" dir="ltr">
                <div className="rounded-2xl px-3.5 py-2 text-center min-w-[62px] bg-white/22 backdrop-blur-md border border-white/30">
                  <div className="text-lg md:text-xl font-black leading-none text-white">
                    {toFa(String(days).padStart(2, '0'))}
                  </div>
                  <div className="text-[11px] mt-1 text-white/90 font-semibold">روز</div>
                </div>
                <span className="font-bold text-white/75">:</span>
                <div className="rounded-2xl px-3.5 py-2 text-center min-w-[62px] bg-white/22 backdrop-blur-md border border-white/30">
                  <div className="text-lg md:text-xl font-black leading-none text-white">
                    {toFa(String(hours).padStart(2, '0'))}
                  </div>
                  <div className="text-[11px] mt-1 text-white/90 font-semibold">ساعت</div>
                </div>
                <span className="font-bold text-white/75">:</span>
                <div className="rounded-2xl px-3.5 py-2 text-center min-w-[62px] bg-white/22 backdrop-blur-md border border-white/30">
                  <div className="text-lg md:text-xl font-black leading-none text-white">
                    {toFa(String(mins).padStart(2, '0'))}
                  </div>
                  <div className="text-[11px] mt-1 text-white/90 font-semibold">دقیقه</div>
                </div>
              </div>
            ) : (
              <p className="text-xs pt-1 text-white/85">
                برای تبدیل به تکرار سالانه یا تغییر تاریخ لمس کنید
              </p>
            )}
          </button>

          {/* Borderless Large Pastel Artwork */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 drop-shadow-[0_8px_18px_rgba(15,23,42,0.12)]">
              <HeroArtwork artKey={artKey} />
            </div>
            {info.isToday && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  launchPastelConfetti('celebration');
                  triggerHaptic('celebrate');
                  playSound('celebrate', soundEnabled);
                }}
                className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer transition-transform active:scale-95 bg-white text-slate-900 shadow-sm"
              >
                <PartyPopper className="w-3.5 h-3.5" />
                <span>جشن بگیر!</span>
              </button>
            )}
          </div>
        </div>

        {isSlider && heroEvents.length > 1 && (
          <div className="relative mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {heroEvents.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSlideIdx(i)}
                  className="h-1.5 rounded-full transition-all cursor-pointer"
                  style={{
                    width: i === idx ? '22px' : '7px',
                    backgroundColor: i === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.42)',
                  }}
                  aria-label={`نمایش رویداد ${item.title}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setSlideIdx((prev) => (prev - 1 + heroEvents.length) % heroEvents.length)
                }
                className="w-9 h-9 rounded-xl inline-flex items-center justify-center bg-white/15 hover:bg-white/25 text-white cursor-pointer transition-colors"
                aria-label="رویداد قبلی"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSlideIdx((prev) => (prev + 1) % heroEvents.length)}
                className="w-9 h-9 rounded-xl inline-flex items-center justify-center bg-white/15 hover:bg-white/25 text-white cursor-pointer transition-colors"
                aria-label="رویداد بعدی"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </article>
    );
  };

  return (
    <section className="space-y-3" aria-label="شمارش معکوس رویدادهای مهم">
      {heroEvents.length > 1 && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {heroEvents.map((ev, i) => {
              const active = displayMode === 'slider' && i === safeIdx;
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => (displayMode === 'slider' ? setSlideIdx(i) : onEditEvent(ev))}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: active
                      ? 'var(--md-primary-container)'
                      : 'var(--md-card)',
                    color: active ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
                    border: active
                      ? '1px solid transparent'
                      : '1px solid var(--md-outline-variant)',
                  }}
                >
                  {ev.title}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onToggleDisplayMode}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
            style={{
              backgroundColor: 'var(--md-card)',
              color: 'var(--md-on-surface-variant)',
              border: '1px solid var(--md-outline-variant)',
            }}
          >
            {displayMode === 'slider' ? (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>نمایش زیر هم</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>اسلایدشو</span>
              </>
            )}
          </button>
        </div>
      )}

      {displayMode === 'stack' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {heroEvents.map((ev, i) => renderCard(ev, i, false))}
        </div>
      ) : (
        renderCard(heroEvents[safeIdx], safeIdx, true)
      )}
    </section>
  );
};
