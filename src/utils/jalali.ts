import type { CoupleEvent, TaskFrequency } from '../types/app';

export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export const JALALI_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toFa(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '';
  return String(num).replace(/[0-9]/g, (w) => FA_DIGITS[Number(w)]);
}

export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  let adjGy = gy - (gy <= 1600 ? 621 : 1600);
  const gy2 = gm > 2 ? adjGy + 1 : adjGy;
  let days =
    365 * adjGy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    gdm[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy <= 979 ? 621 : 1600;
  let adjJy = jy - (jy <= 979 ? 0 : 979);
  let days =
    365 * adjJy +
    Math.floor(adjJy / 33) * 8 +
    Math.floor(((adjJy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const salA = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  for (gm = 0; gm < 13; gm++) {
    const v = salA[gm];
    if (gd <= v) break;
    gd -= v;
  }
  return [gy, gm, gd];
}

/**
 * Unified leap-year check strictly consistent with jalaliToGregorian/gregorianToJalali
 * and the official Iranian solar calendar (1403 = leap [30 Esfand], 1404 = non-leap [29 Esfand], 1408 = leap).
 */
export function isJalaliLeap(jy: number): boolean {
  const [g1y, g1m, g1d] = jalaliToGregorian(jy, 1, 1);
  const [g2y, g2m, g2d] = jalaliToGregorian(jy + 1, 1, 1);
  const diffDays = Math.round(
    (Date.UTC(g2y, g2m - 1, g2d) - Date.UTC(g1y, g1m - 1, g1d)) / 86400000
  );
  return diffDays === 366;
}

export function getJalaliMonthDays(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeap(jy) ? 30 : 29;
}

export function makeDateKey(jy: number, jm: number, jd: number): string {
  const safeM = Math.min(12, Math.max(1, Math.trunc(jm) || 1));
  const safeY = Math.max(1200, Math.min(1600, Math.trunc(jy) || 1404));
  const safeD = Math.min(getJalaliMonthDays(safeY, safeM), Math.max(1, Math.trunc(jd) || 1));
  return `${safeY}-${String(safeM).padStart(2, '0')}-${String(safeD).padStart(2, '0')}`;
}

export function parseDateKey(dateKey: string | null | undefined): [number, number, number] | null {
  if (!dateKey || typeof dateKey !== 'string') return null;
  const parts = dateKey.split('-').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [y, m, d] = parts;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return [y, m, d];
}

export function getTodayJalali(now: Date = new Date()): [number, number, number] {
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function getTodayJalaliKey(now: Date = new Date()): string {
  const [y, m, d] = getTodayJalali(now);
  return makeDateKey(y, m, d);
}

export function formatJalaliFull(dateKey: string): string {
  const parsed = parseDateKey(dateKey);
  if (!parsed) return dateKey;
  const [y, m, d] = parsed;
  return `${toFa(d)} ${JALALI_MONTHS[m - 1]} ${toFa(y)}`;
}

export function daysBetweenJalaliKeys(fromKey: string, toKey: string): number | null {
  const p1 = parseDateKey(fromKey);
  const p2 = parseDateKey(toKey);
  if (!p1 || !p2) return null;
  const [g1y, g1m, g1d] = jalaliToGregorian(p1[0], p1[1], Math.min(p1[2], getJalaliMonthDays(p1[0], p1[1])));
  const [g2y, g2m, g2d] = jalaliToGregorian(p2[0], p2[1], Math.min(p2[2], getJalaliMonthDays(p2[0], p2[1])));
  return Math.round((Date.UTC(g2y, g2m - 1, g2d) - Date.UTC(g1y, g1m - 1, g1d)) / 86400000);
}

export function daysBetweenJalaliAndToday(dateKey: string | null | undefined, now: Date = new Date()): number | null {
  if (!dateKey) return null;
  return daysBetweenJalaliKeys(getTodayJalaliKey(now), dateKey);
}

export interface NextOccurrenceInfo {
  targetDate: Date;
  targetJalaliYear: number;
  targetJalaliMonth: number;
  targetJalaliDay: number;
  origY: number;
  origM: number;
  origD: number;
  yearsElapsed: number;
  isToday: boolean;
  isPast: boolean;
  diffMs: number;
  calendarDaysRemaining: number;
}

/**
 * Smart Next Occurrence calculator:
 * - Honors `ev.repeatYearly` (one-time past events stay marked `isPast: true` instead of rolling forward!).
 * - Handles Esfand 30th cleanly on non-leap years (clamps to Esfand 29th AND sets `isToday: true`).
 */
export function getNextOccurrenceInfo(ev: CoupleEvent, now: Date = new Date()): NextOccurrenceInfo {
  const [curY, curM, curD] = getTodayJalali(now);
  const parsed = parseDateKey(ev.dateKey) || [curY, curM, curD];
  const [origY, origM, origD] = parsed;

  let targetHour = 9;
  let targetMin = 0;
  if (ev.time && ev.time.includes(':')) {
    const [h, m] = ev.time.split(':').map(Number);
    if (Number.isFinite(h)) targetHour = Math.min(23, Math.max(0, h));
    if (Number.isFinite(m)) targetMin = Math.min(59, Math.max(0, m));
  }

  const safeOrigD = Math.min(origD, getJalaliMonthDays(origY, origM));
  const [gOrigY, gOrigM, gOrigD] = jalaliToGregorian(origY, origM, safeOrigD);
  let targetJalaliYear = origY;
  let targetJalaliDay = safeOrigD;
  let targetDate = new Date(gOrigY, gOrigM - 1, gOrigD, targetHour, targetMin, 0);
  const endOfOrigDay = new Date(gOrigY, gOrigM - 1, gOrigD, 23, 59, 59, 999);

  let isPast = false;

  if (endOfOrigDay < now) {
    if (ev.repeatYearly) {
      targetJalaliYear = curY;
      let clampedD = Math.min(origD, getJalaliMonthDays(targetJalaliYear, origM));
      let [gY, gM, gD] = jalaliToGregorian(targetJalaliYear, origM, clampedD);
      const endOfThisYearDay = new Date(gY, gM - 1, gD, 23, 59, 59, 999);

      if (endOfThisYearDay < now) {
        targetJalaliYear = curY + 1;
        clampedD = Math.min(origD, getJalaliMonthDays(targetJalaliYear, origM));
        [gY, gM, gD] = jalaliToGregorian(targetJalaliYear, origM, clampedD);
      }

      targetJalaliDay = clampedD;
      targetDate = new Date(gY, gM - 1, gD, targetHour, targetMin, 0);
    } else {
      isPast = true;
    }
  }

  const isToday =
    !isPast &&
    curY === targetJalaliYear &&
    curM === origM &&
    curD === targetJalaliDay;

  const yearsElapsed =
    ev.repeatYearly && targetJalaliYear > origY ? targetJalaliYear - origY : 0;

  const rawDiffMs = targetDate.getTime() - now.getTime();
  const diffMs = Math.max(0, rawDiffMs);

  const todayKey = makeDateKey(curY, curM, curD);
  const targetKey = makeDateKey(targetJalaliYear, origM, targetJalaliDay);
  const calendarDaysRemaining = daysBetweenJalaliKeys(todayKey, targetKey) ?? 0;

  return {
    targetDate,
    targetJalaliYear,
    targetJalaliMonth: origM,
    targetJalaliDay,
    origY,
    origM,
    origD,
    yearsElapsed,
    isToday,
    isPast,
    diffMs,
    calendarDaysRemaining,
  };
}

/**
 * Matches an event to a Jalali calendar cell:
 * - Exact match on original date.
 * - Yearly repeat only matches `y >= ey`, and clamps Esfand 30th to Esfand 29th on non-leap years.
 */
export function doesEventMatchDate(ev: CoupleEvent, y: number, m: number, d: number): boolean {
  const parsed = parseDateKey(ev.dateKey);
  if (!parsed) return false;
  const [ey, em, ed] = parsed;
  if (ey === y && em === m && ed === d) return true;
  if (ev.repeatYearly && y >= ey && em === m) {
    const clampedD = Math.min(ed, getJalaliMonthDays(y, m));
    return clampedD === d;
  }
  return false;
}

export function formatRelativeDaysFa(days: number): string {
  if (days === 0) return 'امروز';
  if (days === 1) return 'فردا';
  if (days === -1) return 'دیروز';
  if (days > 1) return `${toFa(days)} روز دیگر`;
  return `${toFa(Math.abs(days))} روز پیش`;
}

/**
 * Checks whether a completed recurring task should automatically reset based on today's Jalali date.
 */
export function shouldResetRecurringTask(
  freq: TaskFrequency,
  lastCompletedDate: string | null | undefined,
  todayKey: string
): boolean {
  if (freq === 'یک‌بار' || !lastCompletedDate) return false;
  const elapsed = daysBetweenJalaliKeys(lastCompletedDate, todayKey);
  if (elapsed === null || elapsed <= 0) return false;
  if (freq === 'روزانه') return elapsed >= 1;
  if (freq === 'هفتگی') return elapsed >= 7;
  if (freq === 'ماهانه') {
    const pLast = parseDateKey(lastCompletedDate);
    const pNow = parseDateKey(todayKey);
    if (!pLast || !pNow) return elapsed >= 30;
    return pNow[0] > pLast[0] || pNow[1] > pLast[1] || elapsed >= 30;
  }
  return false;
}
