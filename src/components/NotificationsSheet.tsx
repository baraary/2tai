import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Bell, BellRing, CheckCircle2, RefreshCw, Smartphone } from 'lucide-react';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { SmartNotification, TabId } from '../types/app';
import {
  dispatchSystemNotification,
  requestSystemNotificationPermission,
  type NotificationPermissionResult,
} from '../utils/notifications';
import { BottomSheet } from './BottomSheet';

interface NotificationsSheetProps {
  open: boolean;
  onClose: () => void;
  store: CoupleStore;
  alerts: SmartNotification[];
  onNavigate: (tab: TabId) => void;
}

function readCurrentPermission(): NotificationPermissionResult {
  if (typeof window === 'undefined') return 'unsupported';
  if (!window.isSecureContext) return 'insecure';
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({
  open,
  onClose,
  store,
  alerts,
  onNavigate,
}) => {
  const { state } = store;
  const [permState, setPermState] = useState<NotificationPermissionResult>(() =>
    readCurrentPermission()
  );

  const envInfo = useMemo(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return { isIOS: false, isStandalone: false, isInAppBrowser: false, isInIframe: false };
    }
    const ua = navigator.userAgent || '';
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    const isInAppBrowser = /Instagram|FBAN|FBAV|Telegram|WhatsApp|Line|Snapchat|Twitter|LinkedIn/i.test(
      ua
    );
    let isInIframe = false;
    try {
      isInIframe = window.self !== window.top;
    } catch {
      isInIframe = true;
    }
    return { isIOS, isStandalone, isInAppBrowser, isInIframe };
  }, []);

  const refreshPermission = useCallback(() => {
    setPermState(readCurrentPermission());
  }, []);

  // Re-check live permission whenever sheet opens or user returns from browser/OS settings
  useEffect(() => {
    if (!open) return;
    refreshPermission();
    const onFocus = () => refreshPermission();
    const onVis = () => {
      if (document.visibilityState === 'visible') refreshPermission();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [open, refreshPermission]);

  const handleRequestPermission = async () => {
    if (envInfo.isInAppBrowser) {
      store.showToast('لطفاً سایت را در مرورگر Chrome یا Safari باز کنید');
      return;
    }
    if (envInfo.isIOS && !envInfo.isStandalone) {
      store.showToast('در آیفون ابتدا از منوی Share گزینه Add to Home Screen را بزنید');
      return;
    }
    if (permState === 'denied') {
      store.showToast('مجوز اعلان در تنظیمات مرورگر مسدود شده؛ راهنمای زیر را انجام دهید');
      return;
    }

    const result = await requestSystemNotificationPermission();
    setPermState(result);

    if (result === 'granted') {
      const sample = alerts[0]?.title || 'اعلان‌های هوشمند دوتایی با موفقیت فعال شد!';
      await dispatchSystemNotification('دوتایی', sample);
      store.showToast('اعلان سیستمی با موفقیت فعال شد');
    } else if (result === 'denied') {
      store.showToast('مرورگر مجوز اعلان را مسدود کرده است (راهنمای باز کردن زیر را ببینید)');
    } else if (result === 'default') {
      store.showToast('پنجره مجوز بسته شد؛ دوباره بزنید و Allow را انتخاب کنید');
    } else if (result === 'insecure') {
      store.showToast('اعلان سیستمی فقط روی آدرس امن HTTPS فعال می‌شود');
    } else {
      store.showToast('این مرورگر از اعلان سیستمی پشتیبانی نمی‌کند');
    }
  };

  const handleSendTest = async () => {
    const sample = alerts[0]?.title || 'فضای دوتایی آماده یادآوری رویدادها و انقضای انبار است!';
    const ok = await dispatchSystemNotification('یادآور دوتایی', sample);
    if (ok) store.showToast('اعلان آزمایشی ارسال شد');
    else store.showToast('ابتدا مجوز اعلان مرورگر را فعال کنید');
  };

  const statusText =
    permState === 'granted'
      ? 'فعال ✓'
      : envInfo.isIOS && !envInfo.isStandalone
        ? 'نیاز به نصب روی صفحه اصلی'
        : envInfo.isInAppBrowser
          ? 'مرورگر داخلی محدود است'
          : permState === 'denied'
            ? 'مسدود در مرورگر'
            : permState === 'unsupported'
              ? 'پشتیبانی نمی‌شود'
              : permState === 'insecure'
                ? 'نیاز به HTTPS'
                : 'آماده فعال‌سازی';

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="اعلان‌ها و یادآورهای هوشمند"
      subtitle="یادآوری رویدادهای نزدیک، انقضای انبار و کارهای فوری"
    >
      {/* Active Alerts List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold" style={{ color: 'var(--md-on-surface-variant)' }}>
          هشدارهای فعال ({alerts.length})
        </h3>
        {alerts.length === 0 ? (
          <div
            className="p-5 rounded-2xl text-center text-sm flex flex-col items-center gap-2"
            style={{
              backgroundColor: 'var(--md-surface-low)',
              color: 'var(--md-on-surface-variant)',
            }}
          >
            <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--md-success)' }} />
            <span>همه‌چیز مرتب است و هشدار فعالی وجود ندارد.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate(a.tab);
                }}
                className="w-full p-3.5 rounded-2xl text-right flex items-center justify-between gap-3 cursor-pointer"
                style={{
                  backgroundColor:
                    a.priority === 'high'
                      ? 'var(--md-danger-container)'
                      : 'var(--md-warning-container)',
                }}
              >
                <div className="min-w-0">
                  <div
                    className="text-sm font-bold"
                    style={{
                      color: a.priority === 'high' ? 'var(--md-danger)' : 'var(--md-warning)',
                    }}
                  >
                    {a.title}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--md-on-surface-variant)' }}
                  >
                    {a.sub}
                  </div>
                </div>
                <BellRing
                  className="w-4 h-4 shrink-0"
                  style={{
                    color: a.priority === 'high' ? 'var(--md-danger)' : 'var(--md-warning)',
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preferences */}
      <div
        className="p-4 rounded-2xl space-y-2.5"
        style={{ backgroundColor: 'var(--md-surface-low)' }}
      >
        <h3 className="text-xs font-bold" style={{ color: 'var(--md-on-surface-variant)' }}>
          تنظیمات یادآورها
        </h3>
        <label
          htmlFor="nf-events"
          className="flex items-center justify-between gap-2 text-sm font-semibold cursor-pointer py-1"
        >
          <span>رویدادها و سالگردهای ۷ روز آینده</span>
          <input
            id="nf-events"
            type="checkbox"
            checked={state.notifPrefs.events}
            onChange={(e) =>
              store.saveNotifPrefs({ ...state.notifPrefs, events: e.target.checked })
            }
          />
        </label>
        <label
          htmlFor="nf-expiry"
          className="flex items-center justify-between gap-2 text-sm font-semibold cursor-pointer py-1"
        >
          <span>انقضا و اتمام کالاهای انبار خانه</span>
          <input
            id="nf-expiry"
            type="checkbox"
            checked={state.notifPrefs.expiry}
            onChange={(e) =>
              store.saveNotifPrefs({ ...state.notifPrefs, expiry: e.target.checked })
            }
          />
        </label>
        <label
          htmlFor="nf-tasks"
          className="flex items-center justify-between gap-2 text-sm font-semibold cursor-pointer py-1"
        >
          <span>کارهای فوری خانه</span>
          <input
            id="nf-tasks"
            type="checkbox"
            checked={state.notifPrefs.tasks}
            onChange={(e) =>
              store.saveNotifPrefs({ ...state.notifPrefs, tasks: e.target.checked })
            }
          />
        </label>
      </div>

      {/* Browser / PWA System Notifications */}
      <div
        className="p-4 rounded-2xl space-y-3"
        style={{ backgroundColor: 'var(--md-surface-low)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Bell className="w-4 h-4" style={{ color: 'var(--md-primary)' }} />
            <span>اعلان سیستمی دستگاه</span>
          </span>
          <span
            className="text-xs font-bold"
            style={{
              color:
                permState === 'granted'
                  ? 'var(--md-success)'
                  : permState === 'denied'
                    ? 'var(--md-danger)'
                    : 'var(--md-on-surface-variant)',
            }}
          >
            {statusText}
          </span>
        </div>

        {/* Platform-specific mobile troubleshooting guidance */}
        {envInfo.isInAppBrowser && (
          <div
            className="rounded-xl p-3 text-xs leading-6 flex items-start gap-2"
            style={{
              backgroundColor: 'var(--pastel-amber-soft)',
              border: '1px solid var(--md-outline-variant)',
            }}
          >
            <Smartphone className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--pastel-amber)' }} />
            <div>
              شما صفحه را داخل مرورگر داخلی (تلگرام / اینستاگرام / واتساپ) باز کرده‌اید که اجازه
              نوتیفیکیشن نمی‌دهد. از منوی سه‌نقطه بالا گزینه <strong>Open in Chrome / Safari</strong>{' '}
              را بزنید.
            </div>
          </div>
        )}

        {!envInfo.isInAppBrowser && envInfo.isIOS && !envInfo.isStandalone && (
          <div
            className="rounded-xl p-3 text-xs leading-6 flex items-start gap-2"
            style={{
              backgroundColor: 'var(--pastel-sky-soft)',
              border: '1px solid var(--md-outline-variant)',
            }}
          >
            <Smartphone className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--pastel-sky)' }} />
            <div>
              <strong>راهنمای آیفون (iOS):</strong> در آیفون اعلان‌ها فقط پس از نصب روی صفحه اصلی
              کار می‌کنند. دکمه <strong>Share</strong> پایین سافاری را بزنید ←{' '}
              <strong>Add to Home Screen</strong> ← سپس اپ را از آیکون روی صفحه باز کرده و دوباره
              دکمه فعال‌سازی را بزنید.
            </div>
          </div>
        )}

        {!envInfo.isInAppBrowser && permState === 'denied' && (
          <div
            className="rounded-xl p-3 text-xs leading-6 space-y-1.5"
            style={{
              backgroundColor: 'var(--md-danger-container)',
              border: '1px solid var(--md-outline-variant)',
            }}
          >
            <div className="font-extrabold flex items-center gap-1.5" style={{ color: 'var(--md-danger)' }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>مرورگر قبلاً اعلان این سایت را مسدود کرده است</span>
            </div>
            <p style={{ color: 'var(--md-on-surface)' }}>
              وقتی اعلان مسدود باشد، مرورگر دیگر پنجره تایید نشان نمی‌دهد. برای باز کردن آن:
            </p>
            <ul className="list-disc pr-4 space-y-1" style={{ color: 'var(--md-on-surface)' }}>
              <li>
                <strong>در مرورگر گوشی (Chrome):</strong> روی آیکون کنار آدرس سایت (بالا سمت چپ/راست)
                بزنید ← <strong>Permissions / مجوزها</strong> ← <strong>Notifications</strong> را
                روی <strong>Allow</strong> بگذارید.
              </li>
              <li>
                <strong>اگر اپ نصب‌شده (PWA) است:</strong> انگشت را روی آیکون «دوتایی» نگه دارید ←{' '}
                <strong>App info</strong> ← <strong>Notifications</strong> را روشن کنید.
              </li>
            </ul>
          </div>
        )}

        {envInfo.isInIframe && permState !== 'granted' && (
          <p className="text-[11px] leading-5" style={{ color: 'var(--md-on-surface-variant)' }}>
            نکته: در حالت پیش‌نمایش داخل کادر (iframe) مرورگر ممکن است پنجره اعلان را نمایش ندهد؛
            مستقیماً از آدرس اصلی سایت روی گوشی فعال کنید.
          </p>
        )}

        <div className="flex items-center gap-2">
          {permState !== 'granted' ? (
            <>
              <button
                type="button"
                onClick={() => void handleRequestPermission()}
                className="m3-btn-primary flex-1 text-xs"
              >
                {permState === 'denied' ? 'تلاش مجدد فعال‌سازی' : 'فعالسازی اعلان سیستمی'}
              </button>
              {permState === 'denied' && (
                <button
                  type="button"
                  onClick={() => {
                    refreshPermission();
                    store.showToast('وضعیت مجوز بررسی شد');
                  }}
                  className="m3-btn-tonal text-xs px-3"
                  aria-label="بررسی مجدد مجوز"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>بررسی مجدد</span>
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => void handleSendTest()}
              className="m3-btn-primary flex-1 text-xs"
            >
              <BellRing className="w-4 h-4" />
              <span>ارسال اعلان آزمایشی</span>
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
