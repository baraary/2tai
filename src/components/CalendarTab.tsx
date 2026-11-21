import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Pin,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { CoupleEvent } from '../types/app';
import {
  doesEventMatchDate,
  formatJalaliFull,
  getJalaliMonthDays,
  getNextOccurrenceInfo,
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  jalaliToGregorian,
  makeDateKey,
  parseDateKey,
  toFa,
} from '../utils/jalali';

interface CalendarTabProps {
  store: CoupleStore;
  selectedDateKey: string;
  onSelectDateKey: (key: string) => void;
  onOpenEventModal: (ev?: CoupleEvent, defaultDateKey?: string) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  store,
  selectedDateKey,
  onSelectDateKey,
  onOpenEventModal,
}) => {
  const { state, todayJalali } = store;
  const [todayY, todayM, todayD] = todayJalali;
  const todayKey = makeDateKey(todayY, todayM, todayD);

  const [viewYear, setViewYear] = useState(todayY);
  const [viewMonth, setViewMonth] = useState(todayM);
  const [searchQuery, setSearchQuery] = useState('');

  const daysInMonth = getJalaliMonthDays(viewYear, viewMonth);
  const startOffset = useMemo(() => {
    const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, 1);
    const first = new Date(gy, gm - 1, gd);
    return (first.getDay() + 1) % 7;
  }, [viewYear, viewMonth]);

  const changeMonth = (delta: number) => {
    let nextM = viewMonth + delta;
    let nextY = viewYear;
    if (nextM > 12) {
      nextM = 1;
      nextY++;
    } else if (nextM < 1) {
      nextM = 12;
      nextY--;
    }
    setViewYear(nextY);
    setViewMonth(nextM);
    onSelectDateKey(makeDateKey(nextY, nextM, 1));
  };

  const goToToday = () => {
    setViewYear(todayY);
    setViewMonth(todayM);
    onSelectDateKey(todayKey);
  };

  const [selY, selM, selD] = parseDateKey(selectedDateKey) || todayJalali;
  const selectedDayEvents = useMemo(
    () => state.events.filter((e) => doesEventMatchDate(e, selY, selM, selD)),
    [state.events, selY, selM, selD]
  );

  const allFilteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...state.events]
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .filter((e) => {
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.note || '').toLowerCase().includes(q)
        );
      });
  }, [state.events, searchQuery]);

  const renderEventRow = (ev: CoupleEvent, showFullDate = false) => {
    const info = getNextOccurrenceInfo(ev);
    return (
      <div
        key={ev.id}
        className="flex items-center justify-between gap-2 p-3 rounded-2xl"
        style={{ backgroundColor: 'var(--md-surface-low)' }}
      >
        <button
          type="button"
          onClick={() => onOpenEventModal(ev)}
          className="flex-1 min-w-0 min-h-[44px] text-right cursor-pointer"
        >
          <div className="text-sm font-bold truncate">{ev.title}</div>
          <div
            className="text-xs flex items-center gap-1.5 flex-wrap mt-0.5 tabular-nums"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            {showFullDate && <span>{formatJalaliFull(ev.dateKey)}</span>}
            {showFullDate && <span aria-hidden="true">·</span>}
            <span>{ev.category}</span>
            {ev.repeatYearly && (
              <>
                <span aria-hidden="true">·</span>
                <span>تکرار سالانه</span>
              </>
            )}
            {info.yearsElapsed > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>سال {toFa(info.yearsElapsed)}ام</span>
              </>
            )}
            {info.isPast && (
              <>
                <span aria-hidden="true">·</span>
                <span>گذشته</span>
              </>
            )}
          </div>
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => store.toggleEventPin(ev.id)}
            className="m3-icon-btn"
            style={{
              color: ev.pinned ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
              backgroundColor: ev.pinned ? 'var(--md-primary-container)' : 'transparent',
            }}
            aria-label={ev.pinned ? 'برداشتن پین از صفحه خانه' : 'پین کردن در صفحه خانه'}
            title="پین در خانه"
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onOpenEventModal(ev)}
            className="m3-icon-btn"
            aria-label={`ویرایش ${ev.title}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => store.deleteEvent(ev.id)}
            className="m3-icon-btn"
            style={{ color: 'var(--md-danger)' }}
            aria-label={`حذف ${ev.title}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-black">تقویم شمسی و مناسبت‌ها</h1>
        <button
          type="button"
          onClick={() => onOpenEventModal(undefined, selectedDateKey)}
          className="m3-btn-primary text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>رویداد جدید</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Calendar Card */}
        <section className="m3-surface-card rounded-3xl p-4 md:p-5 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="m3-icon-btn"
                aria-label="ماه قبل"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-base font-extrabold px-2 tabular-nums">
                {JALALI_MONTHS[viewMonth - 1]} {toFa(viewYear)}
              </h2>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="m3-icon-btn"
                aria-label="ماه بعد"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={goToToday}
              className="px-3.5 min-h-[40px] rounded-xl text-xs font-bold cursor-pointer"
              style={{
                backgroundColor: 'var(--md-primary-container)',
                color: 'var(--md-on-primary-container)',
              }}
            >
              امروز
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {JALALI_WEEKDAYS.map((wd, i) => (
              <div
                key={wd}
                className="text-xs font-bold py-1.5"
                style={{
                  color: i === 6 ? 'var(--md-danger)' : 'var(--md-on-surface-variant)',
                }}
              >
                {wd}
              </div>
            ))}

            {Array.from({ length: startOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} aria-hidden="true" />
            ))}

            {Array.from({ length: daysInMonth }, (_, idx) => {
              const d = idx + 1;
              const key = makeDateKey(viewYear, viewMonth, d);
              const isToday = key === todayKey;
              const isSelected = key === selectedDateKey;
              const isFriday = (startOffset + d - 1) % 7 === 6;
              const dayEvs = state.events.filter((e) => doesEventMatchDate(e, viewYear, viewMonth, d));

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectDateKey(key)}
                  className="min-h-[44px] rounded-2xl flex flex-col items-center justify-center gap-0.5 text-sm font-bold tabular-nums transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--md-primary)'
                      : isToday
                        ? 'var(--md-primary-container)'
                        : 'transparent',
                    color: isSelected
                      ? 'var(--md-on-primary)'
                      : isFriday
                        ? 'var(--md-danger)'
                        : isToday
                          ? 'var(--md-on-primary-container)'
                          : 'var(--md-on-surface)',
                    border:
                      isToday && !isSelected
                        ? '1.5px solid var(--md-primary)'
                        : '1.5px solid transparent',
                  }}
                  aria-label={`${toFa(d)} ${JALALI_MONTHS[viewMonth - 1]} ${toFa(viewYear)}${dayEvs.length ? ` (${toFa(dayEvs.length)} رویداد)` : ''}`}
                  aria-pressed={isSelected}
                >
                  <span>{toFa(d)}</span>
                  <span className="flex items-center gap-0.5 h-1.5">
                    {dayEvs.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: isSelected ? '#FFFFFF' : 'var(--md-primary)',
                        }}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Day + Search All Events */}
        <div className="lg:col-span-5 space-y-5">
          <section className="m3-surface-card rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold tabular-nums">
                رویدادهای {toFa(selD)} {JALALI_MONTHS[selM - 1]} {toFa(selY)}
              </h2>
              <button
                type="button"
                onClick={() => onOpenEventModal(undefined, selectedDateKey)}
                className="text-xs font-bold px-2.5 py-1.5 rounded-xl cursor-pointer"
                style={{ color: 'var(--md-primary)' }}
              >
                + افزودن در این روز
              </button>
            </div>
            {selectedDayEvents.length === 0 ? (
              <p
                className="text-xs py-5 text-center rounded-2xl"
                style={{
                  backgroundColor: 'var(--md-surface-low)',
                  color: 'var(--md-on-surface-variant)',
                }}
              >
                رویدادی در این روز ثبت نشده است.
              </p>
            ) : (
              <div className="space-y-2">{selectedDayEvents.map((ev) => renderEventRow(ev))}</div>
            )}
          </section>

          <section className="m3-surface-card rounded-3xl p-5 space-y-3">
            <h2 className="text-sm font-extrabold">همه مناسبت‌ها ({toFa(state.events.length)})</h2>
            <div className="relative">
              <label htmlFor="cal-search" className="sr-only">
                جستجو در رویدادها
              </label>
              <Search
                className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--md-on-surface-variant)' }}
              />
              <input
                id="cal-search"
                type="search"
                className="m3-input pr-10"
                placeholder="جستجو در عنوان یا دسته..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {allFilteredEvents.length === 0 ? (
              <p
                className="text-xs py-5 text-center rounded-2xl"
                style={{
                  backgroundColor: 'var(--md-surface-low)',
                  color: 'var(--md-on-surface-variant)',
                }}
              >
                رویدادی یافت نشد.
              </p>
            ) : (
              <div className="space-y-2">
                {allFilteredEvents.map((ev) => renderEventRow(ev, true))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
