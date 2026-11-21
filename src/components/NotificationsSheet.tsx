import React, { useState } from 'react';
import { Bell, BellRing, CheckCircle2 } from 'lucide-react';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { SmartNotification, TabId } from '../types/app';
import { dispatchSystemNotification } from '../utils/notifications';
import { BottomSheet } from './BottomSheet';

interface NotificationsSheetProps {
  open: boolean;
  onClose: () => void;
  store: CoupleStore;
  alerts: SmartNotification[];
  onNavigate: (tab: TabId) => void;
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({
  open,
  onClose,
  store,
  alerts,
  onNavigate,
}) => {
  const { state } = store;
  const [permState, setPermState] = useState<string>(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      store.showToast('مرورگر شما از اعلان سیستمی پشتیبانی نمی‌کند');
      return;
    }
    const result = await Notification.requestPermission();
    setPermState(result);
    if (result === 'granted') {
      const sample = alerts[0]?.title || 'اعلان‌های هوشمند دوتایی با موفقیت فعال شد!';
      await dispatchSystemNotification('دوتایی', sample);
      store.showToast('اعلان سیستمی فعال شد');
    } else {
      store.showToast('مجوز نوتیفیکیشن تایید نشد');
    }
  };

  const handleSendTest = async () => {
    const sample = alerts[0]?.title || 'فضای دوتایی آماده یادآوری رویدادها و انقضای انبار است!';
    const ok = await dispatchSystemNotification('یادآور دوتایی', sample);
    if (ok) store.showToast('اعلان آزمایشی ارسال شد');
    else store.showToast('ابتدا مجوز اعلان مرورگر را فعال کنید');
  };

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
        <label htmlFor="nf-events" className="flex items-center justify-between gap-2 text-sm font-semibold cursor-pointer py-1">
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
        <label htmlFor="nf-expiry" className="flex items-center justify-between gap-2 text-sm font-semibold cursor-pointer py-1">
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
        <label htmlFor="nf-tasks" className="flex items-center justify-between gap-2 text-sm font-semibold cursor-pointer py-1">
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
          <span className="text-xs font-semibold" style={{ color: 'var(--md-on-surface-variant)' }}>
            {permState === 'granted'
              ? 'فعال'
              : permState === 'denied'
                ? 'مسدود در مرورگر'
                : permState === 'unsupported'
                  ? 'پشتیبانی نمی‌شود'
                  : 'آماده فعال‌سازی'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleRequestPermission()}
            className="m3-btn-primary flex-1 text-xs"
          >
            فعالسازی اعلان سیستمی
          </button>
          {permState === 'granted' && (
            <button
              type="button"
              onClick={() => void handleSendTest()}
              className="m3-btn-tonal text-xs"
            >
              تست اعلان
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
