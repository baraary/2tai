import React from 'react';
import type { PartnerId } from '../types/app';

export interface AvatarOption {
  id: string;
  label: string;
  emoji?: string;
}

export const PARTNER_AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'initial', label: 'حرف اول اسم' },
  { id: '🦊', label: 'روباه', emoji: '🦊' },
  { id: '🐻', label: 'خرس مهربان', emoji: '🐻' },
  { id: '🐱', label: 'گربه', emoji: '🐱' },
  { id: '🐰', label: 'خرگوش', emoji: '🐰' },
  { id: '🐼', label: 'پاندا', emoji: '🐼' },
  { id: '🐨', label: 'کوالا', emoji: '🐨' },
  { id: '🦋', label: 'پروانه', emoji: '🦋' },
  { id: '🌸', label: 'شکوفه', emoji: '🌸' },
  { id: '🌷', label: 'لاله', emoji: '🌷' },
  { id: '🌙', label: 'ماه', emoji: '🌙' },
  { id: '☀️', label: 'خورشید', emoji: '☀️' },
  { id: '🍓', label: 'توت‌فرنگی', emoji: '🍓' },
  { id: '🥑', label: 'آووکادو', emoji: '🥑' },
  { id: '☕', label: 'قهوه', emoji: '☕' },
  { id: '🎧', label: 'موزیک', emoji: '🎧' },
  { id: '🌿', label: 'برگ', emoji: '🌿' },
  { id: '👑', label: 'تاج', emoji: '👑' },
];

interface PartnerAvatarProps {
  partner: PartnerId;
  name: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PartnerAvatarProps['size']>, string> = {
  xs: 'w-5 h-5 text-[10px] rounded-full',
  sm: 'w-7 h-7 text-xs rounded-full',
  md: 'w-9 h-9 text-sm rounded-2xl',
  lg: 'w-11 h-11 text-lg rounded-2xl',
};

export const PartnerAvatar: React.FC<PartnerAvatarProps> = ({
  partner,
  name,
  avatar = 'initial',
  size = 'md',
  className = '',
}) => {
  const isEmoji = avatar && avatar !== 'initial';
  const initialChar = (name || (partner === 'p1' ? 'ا' : 'د')).trim().charAt(0) || 'د';

  const bgVar = partner === 'p1' ? 'var(--pastel-sky-soft)' : 'var(--pastel-rose-soft)';
  const fgVar = partner === 'p1' ? 'var(--pastel-sky)' : 'var(--pastel-rose)';

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 font-black select-none ${SIZE_CLASSES[size]} ${className}`}
      style={{
        backgroundColor: bgVar,
        color: fgVar,
        border: '1px solid var(--md-outline-variant)',
      }}
      title={name}
      aria-hidden="true"
    >
      {isEmoji ? avatar : initialChar}
    </span>
  );
};
