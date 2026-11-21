import React, { useState } from 'react';
import { Download, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BottomSheet } from './BottomSheet';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={
          compact
            ? 'm3-icon-btn'
            : 'm3-btn-primary w-full'
        }
        style={compact ? { color: 'var(--md-primary)' } : undefined}
        aria-label="نصب اپلیکیشن دوتایی"
        title="نصب روی صفحه اصلی"
      >
        <Download className="w-5 h-5" />
        {!compact && <span>نصب اپلیکیشن روی گوشی</span>}
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={compact ? 'm3-icon-btn' : 'm3-btn-tonal w-full'}
          style={compact ? { color: 'var(--md-primary)' } : undefined}
          aria-label="راهنمای نصب در آیفون"
          title="نصب در آیفون"
        >
          <Download className="w-5 h-5" />
          {!compact && <span>نصب روی آیفون (Safari)</span>}
        </button>

        <BottomSheet
          open={showIOSGuide}
          onClose={() => setShowIOSGuide(false)}
          title="نصب دوتایی روی آیفون و آیپد"
          subtitle="برای تجربه تمام‌صفحه و آفلاین مانند اپلیکیشن بومی"
        >
          <div className="space-y-3 text-sm leading-7">
            <p className="flex items-start gap-2">
              <span className="font-bold" style={{ color: 'var(--md-primary)' }}>
                ۱.
              </span>
              <span>
                در نوار پایین مرورگر Safari دکمه{' '}
                <strong className="inline-flex items-center gap-1">
                  Share <Share className="w-3.5 h-3.5" />
                </strong>{' '}
                را لمس کنید.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold" style={{ color: 'var(--md-primary)' }}>
                ۲.
              </span>
              <span>
                صفحه را کمی بالا بکشید و گزینه <strong>Add to Home Screen</strong> را انتخاب کنید.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold" style={{ color: 'var(--md-primary)' }}>
                ۳.
              </span>
              <span>
                روی <strong>Add</strong> بزنید تا آیکون دوتایی روی صفحه اصلی گوشی اضافه شود.
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowIOSGuide(false)}
            className="m3-btn-primary w-full mt-2"
          >
            متوجه شدم
          </button>
        </BottomSheet>
      </>
    );
  }

  return null;
};
