import type { AppState, SmartNotification } from '../types/app';
import {
  daysBetweenJalaliAndToday,
  formatRelativeDaysFa,
  getNextOccurrenceInfo,
  getTodayJalaliKey,
  JALALI_MONTHS,
  toFa,
} from './jalali';

const LAST_NOTIF_DAY_KEY = 'dotaee_last_daily_notif_day';

export function generateSmartNotifications(state: AppState, now: Date = new Date()): SmartNotification[] {
  const alerts: SmartNotification[] = [];
  const prefs = state.notifPrefs || { events: true, expiry: true, tasks: true };

  if (prefs.events) {
    for (const ev of state.events) {
      const info = getNextOccurrenceInfo(ev, now);
      if (info.isPast) continue;
      if (info.isToday) {
        alerts.push({
          id: `ev-${ev.id}`,
          type: 'event',
          priority: 'high',
          title: `امروز: ${ev.title}`,
          sub: 'مناسبت ثبت‌شده در تقویم دوتایی',
          tab: 'calendar',
        });
      } else if (info.calendarDaysRemaining >= 1 && info.calendarDaysRemaining <= 7) {
        alerts.push({
          id: `ev-${ev.id}`,
          type: 'event',
          priority: info.calendarDaysRemaining <= 2 ? 'high' : 'med',
          title: `${formatRelativeDaysFa(info.calendarDaysRemaining)}: ${ev.title}`,
          sub: `موعد: ${toFa(info.targetJalaliDay)} ${JALALI_MONTHS[info.targetJalaliMonth - 1]}`,
          tab: 'calendar',
        });
      }
    }
  }

  if (prefs.expiry) {
    for (const p of state.pantry) {
      if (p.expiryDate) {
        const rem = daysBetweenJalaliAndToday(p.expiryDate, now);
        if (rem !== null && rem <= 7) {
          alerts.push({
            id: `exp-${p.id}`,
            type: 'expiry',
            priority: rem <= 1 ? 'high' : 'med',
            title:
              rem < 0
                ? `انقضای «${p.title}» گذشته است`
                : rem === 0
                  ? `«${p.title}» امروز منقضی می‌شود`
                  : `«${p.title}» ${formatRelativeDaysFa(rem)} منقضی می‌شود`,
            sub: 'اولویت مصرف از انبار خانه',
            tab: 'market',
          });
        }
      }
      if (p.status === 'empty') {
        alerts.push({
          id: `empty-${p.id}`,
          type: 'expiry',
          priority: 'high',
          title: `«${p.title}» در انبار تمام شده است`,
          sub: 'پیشنهاد انتقال به لیست خرید',
          tab: 'market',
        });
      }
    }
  }

  if (prefs.tasks) {
    for (const t of state.tasks) {
      if (!t.done && t.priority === 'high') {
        const assigneeLabel =
          t.assignee === 'both' ? 'دوتایی' : state.partners[t.assignee] || 'مشترک';
        alerts.push({
          id: `task-${t.id}`,
          type: 'task',
          priority: 'high',
          title: `کار فوری: ${t.title}`,
          sub: `مسئول: ${assigneeLabel}`,
          tab: 'tasks',
        });
      }
    }
  }

  return alerts;
}

export type NotificationPermissionResult =
  | NotificationPermission
  | 'unsupported'
  | 'insecure';

/**
 * Safely requests browser Notification permission across modern Promise-based
 * and legacy callback-based mobile WebViews.
 */
export async function requestSystemNotificationPermission(): Promise<NotificationPermissionResult> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (!window.isSecureContext) {
    return 'insecure';
  }
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }

  try {
    const maybePromise = Notification.requestPermission((cbResult) => cbResult);
    if (maybePromise && typeof maybePromise.then === 'function') {
      return await maybePromise;
    }
    return Notification.permission;
  } catch {
    return Notification.permission || 'denied';
  }
}

/**
 * Dispatches a real system notification via ServiceWorkerRegistration.showNotification()
 * (required on Android Chrome PWAs where `new Notification()` throws Illegal constructor),
 * with timeout protection and safe fallback to `new Notification()` on desktop browsers.
 */
export async function dispatchSystemNotification(title: string, body: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await Promise.race<ServiceWorkerRegistration | null>([
        navigator.serviceWorker.ready.catch(() => null),
        new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 1500)),
      ]);
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, {
          body,
          icon: './pwa-192x192.png',
          badge: './pwa-192x192.png',
          dir: 'rtl',
          lang: 'fa-IR',
          tag: 'dotaee-smart-alert',
        });
        return true;
      }
    }
    new Notification(title, { body, icon: './pwa-192x192.png', dir: 'rtl', lang: 'fa-IR' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Fires at most one daily digest system notification when high-priority alerts exist.
 */
export async function maybeSendDailyReminder(state: AppState): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const todayKey = getTodayJalaliKey();
  try {
    if (localStorage.getItem(LAST_NOTIF_DAY_KEY) === todayKey) return;
  } catch {
    return;
  }

  const alerts = generateSmartNotifications(state);
  const urgent = alerts.filter((a) => a.priority === 'high');
  if (urgent.length === 0) return;

  const body =
    urgent.length === 1
      ? urgent[0].title
      : `${urgent[0].title} و ${toFa(urgent.length - 1)} یادآوری مهم دیگر`;

  const sent = await dispatchSystemNotification('یادآور دوتایی', body);
  if (sent) {
    try {
      localStorage.setItem(LAST_NOTIF_DAY_KEY, todayKey);
    } catch {
      // ignore
    }
  }
}
