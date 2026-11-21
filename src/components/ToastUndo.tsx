import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { ToastState } from '../hooks/useCoupleStore';

interface ToastUndoProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

export const ToastUndo: React.FC<ToastUndoProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 sm:bottom-24 inset-x-4 z-50 flex justify-center pointer-events-none"
    >
      <div
        className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl max-w-md w-full sm:w-auto"
        style={{
          backgroundColor: 'var(--md-on-surface)',
          color: 'var(--md-surface)',
          boxShadow: 'var(--md-shadow-2)',
        }}
      >
        <span className="text-sm font-medium">{toast.message}</span>
        {toast.undo && (
          <button
            type="button"
            onClick={() => {
              toast.undo?.restore();
              onDismiss();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
            style={{
              backgroundColor: 'var(--md-primary)',
              color: 'var(--md-on-primary)',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{toast.undo.label}</span>
          </button>
        )}
      </div>
    </div>
  );
};
