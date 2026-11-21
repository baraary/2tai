import React from 'react';
import {
  Bell,
  Cloud,
  CloudOff,
  Moon,
  RefreshCw,
  Search,
  Settings,
  Sun,
} from 'lucide-react';
import type { PartnerId, SyncStateKind, TabId, ThemeMode } from '../types/app';
import { toFa } from '../utils/jalali';
import { PartnerAvatar } from './PartnerAvatar';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onSelectTab: (tab: TabId) => void;
  partners: { p1: string; p2: string };
  partnerAvatars: { p1: string; p2: string };
  myAccount: PartnerId;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  syncKind: SyncStateKind;
  syncLabel: string;
  hasCloudSync: boolean;
  onManualSync: () => void;
  notifCount: number;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectTab,
  partners,
  partnerAvatars,
  myAccount,
  themeMode,
  onToggleTheme,
  syncKind,
  syncLabel,
  hasCloudSync,
  onManualSync,
  notifCount,
  onOpenSearch,
  onOpenNotifications,
  onOpenSettings,
}) => {
  const isDark =
    themeMode === 'dark' ||
    themeMode === 'amoled' ||
    (themeMode === 'auto' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'var(--md-header-bg)',
        borderColor: 'var(--md-outline-variant)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-3">
        {/* Brand Zone with Overlapping Partner Avatars */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer text-right"
          aria-label="صفحه اصلی دوتایی"
        >
          <div className="flex items-center -space-x-2 space-x-reverse shrink-0">
            <PartnerAvatar
              partner="p1"
              name={partners.p1}
              avatar={partnerAvatars.p1}
              size="sm"
              className="ring-2 ring-[var(--md-card)]"
            />
            <PartnerAvatar
              partner="p2"
              name={partners.p2}
              avatar={partnerAvatars.p2}
              size="sm"
              className="ring-2 ring-[var(--md-card)]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight leading-none whitespace-nowrap">
              دوتایی
            </span>
            <span
              className="text-[11px] font-semibold mt-0.5 whitespace-nowrap"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              {partners.p1} و {partners.p2}
            </span>
          </div>
        </button>

        {/* Actions Zone */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            className="m3-icon-btn"
            aria-label="جستجوی سراسری (Ctrl+K)"
            title="جستجوی سراسری (Ctrl+K)"
          >
            <Search className="w-5 h-5" />
          </button>

          {hasCloudSync && (
            <button
              type="button"
              onClick={onManualSync}
              className="m3-icon-btn"
              title={syncLabel}
              aria-label={`همگام‌سازی ابری: ${syncLabel}`}
            >
              {syncKind === 'syncing' ? (
                <RefreshCw className="w-4 h-4 animate-spin" style={{ color: 'var(--md-primary)' }} />
              ) : syncKind === 'offline' || syncKind === 'error' ? (
                <CloudOff className="w-4 h-4" style={{ color: 'var(--md-danger)' }} />
              ) : (
                <Cloud className="w-4 h-4" style={{ color: 'var(--md-success)' }} />
              )}
            </button>
          )}

          <PWAInstallButton compact />

          <button
            type="button"
            onClick={onToggleTheme}
            className="m3-icon-btn"
            aria-label={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
            title={isDark ? 'حالت روشن' : 'حالت تاریک'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            className="m3-icon-btn relative"
            aria-label={`اعلان‌ها (${toFa(notifCount)} مورد)`}
            title="اعلان‌ها و یادآورها"
          >
            <Bell className="w-5 h-5" />
            {notifCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums"
                style={{
                  backgroundColor: 'var(--md-danger)',
                  color: '#FFFFFF',
                }}
              >
                {toFa(notifCount > 9 ? '9+' : notifCount)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="m3-icon-btn"
            aria-label={`تنظیمات (${partners[myAccount]})`}
            title={`تنظیمات — اکانت ${partners[myAccount]}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
