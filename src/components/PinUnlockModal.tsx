import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { decryptInviteCode, type InvitePayload } from '../utils/cryptoAndInvite';
import { BottomSheet } from './BottomSheet';

interface PinUnlockModalProps {
  rawCode: string | null;
  onCancel: () => void;
  onUnlocked: (payload: InvitePayload) => void;
}

export const PinUnlockModal: React.FC<PinUnlockModalProps> = ({
  rawCode,
  onCancel,
  onUnlocked,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawCode || !pin.trim()) return;
    setLoading(true);
    setError('');
    const payload = await decryptInviteCode(rawCode, pin);
    setLoading(false);
    if (!payload) {
      setError('رمز واردشده اشتباه است؛ دوباره بررسی کنید.');
      return;
    }
    setPin('');
    onUnlocked(payload);
  };

  return (
    <BottomSheet
      open={Boolean(rawCode)}
      onClose={onCancel}
      title="باز کردن لینک دعوت رمزنگاری‌شده"
      subtitle="رمزی را که همسرتان برایتان ارسال کرده وارد کنید"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="unlock-pin-input"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            رمز عبور لینک
          </label>
          <div className="relative">
            <KeyRound
              className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--md-on-surface-variant)' }}
            />
            <input
              id="unlock-pin-input"
              type="password"
              inputMode="numeric"
              className="m3-input pr-10"
              placeholder="رمز کوتاه لینک..."
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
              required
            />
          </div>
          {error && (
            <p className="text-xs font-semibold" style={{ color: 'var(--md-danger)' }}>
              {error}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" disabled={loading} className="m3-btn-primary flex-1">
            {loading ? 'در حال رمزگشایی...' : 'اتصال به فضای دوتایی'}
          </button>
          <button type="button" onClick={onCancel} className="m3-btn-tonal">
            انصراف
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
