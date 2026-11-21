import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  preventBackdropClose?: boolean;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title,
  subtitle,
  preventBackdropClose = false,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventBackdropClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, preventBackdropClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-xs p-0 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget && !preventBackdropClose) {
          onClose();
        }
      }}
    >
      <div
        className="w-full md:max-w-lg max-h-[90dvh] flex flex-col rounded-t-3xl md:rounded-3xl overflow-hidden"
        style={{
          backgroundColor: 'var(--md-card)',
          color: 'var(--md-on-surface)',
          border: '1px solid var(--md-outline-variant)',
          boxShadow: 'var(--md-shadow-2)',
        }}
      >
        <div className="md:hidden flex justify-center pt-2.5 pb-1">
          <span
            className="w-10 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--md-outline-variant)' }}
            aria-hidden="true"
          />
        </div>
        <div
          className="flex items-center justify-between gap-3 px-5 py-3.5 border-b"
          style={{ borderColor: 'var(--md-outline-variant)' }}
        >
          <div className="min-w-0">
            <h2 className="text-base font-extrabold truncate">{title}</h2>
            {subtitle && (
              <p className="text-xs truncate" style={{ color: 'var(--md-on-surface-variant)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {!preventBackdropClose && (
            <button
              type="button"
              onClick={onClose}
              className="m3-icon-btn shrink-0"
              aria-label="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="overflow-y-auto px-5 py-4 pb-6 space-y-4">{children}</div>
      </div>
    </div>
  );
};
