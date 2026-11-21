import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Cloud,
  Copy,
  Download,
  ExternalLink,
  HelpCircle,
  KeyRound,
  LogOut,
  RefreshCw,
  Share2,
  ShieldCheck,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { DarkStylePref, PartnerId, ThemeMode } from '../types/app';
import { createMagicInviteUrl } from '../utils/cryptoAndInvite';
import { exportSafeBackupJson } from '../utils/storageAndValidation';
import { PALETTES } from '../utils/themeEngine';
import { BottomSheet } from './BottomSheet';
import { PARTNER_AVATAR_OPTIONS, PartnerAvatar } from './PartnerAvatar';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  store: CoupleStore;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({ open, onClose, store }) => {
  const { state } = store;
  const [p1, setP1] = useState(state.partners.p1);
  const [p2, setP2] = useState(state.partners.p2);
  const [gistToken, setGistToken] = useState(state.syncConfig.gistToken);
  const [gistId, setGistId] = useState(state.syncConfig.gistId);

  const [inviteTarget, setInviteTarget] = useState<PartnerId>(
    state.myAccount === 'p1' ? 'p2' : 'p1'
  );
  const [invitePin, setInvitePin] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [buildingLink, setBuildingLink] = useState(false);
  const [showTokenGuide, setShowTokenGuide] = useState(!state.syncConfig.gistToken);
  const [avatarEditor, setAvatarEditor] = useState<PartnerId>(state.myAccount);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setP1(state.partners.p1);
    setP2(state.partners.p2);
    setGistToken(state.syncConfig.gistToken);
    setGistId(state.syncConfig.gistId);
    setInviteTarget(state.myAccount === 'p1' ? 'p2' : 'p1');
    setGeneratedLink('');
  }, [open, state.partners.p1, state.partners.p2, state.syncConfig.gistToken, state.syncConfig.gistId, state.myAccount]);

  const handleSaveProfileAndCloud = (e: React.FormEvent) => {
    e.preventDefault();
    store.saveSettings({ p1, p2, gistToken, gistId });
    onClose();
  };

  const handleBuildInvite = async (mode: 'copy' | 'share') => {
    const token = gistToken.trim() || state.syncConfig.gistToken;
    if (!token) {
      store.showToast('ابتدا توکن گیت‌هاب را وارد کنید');
      return;
    }

    setBuildingLink(true);
    try {
      // Save credentials first and ensure Gist exists (merges remote first, never overwrites!)
      store.saveSettings({ p1, p2, gistToken: token, gistId });
      const ok = await store.pushToCloud(true);
      const activeGistId = gistId.trim() || store.state.syncConfig.gistId;
      if (!ok && !activeGistId) {
        store.showToast('خطا در اتصال به گیت‌هاب؛ توکن را بررسی کنید');
        return;
      }

      const link = await createMagicInviteUrl(
        {
          t: token,
          g: activeGistId,
          a: inviteTarget,
          p1: p1.trim() || state.partners.p1,
          p2: p2.trim() || state.partners.p2,
          pal: state.palette,
        },
        invitePin
      );
      setGeneratedLink(link);

      const targetName =
        inviteTarget === 'p1' ? p1.trim() || state.partners.p1 : p2.trim() || state.partners.p2;

      if (mode === 'share' && navigator.share) {
        try {
          await navigator.share({
            title: 'دعوت به اپلیکیشن دوتایی',
            text: `${targetName} عزیز، با باز کردن این لینک مستقیم به فضای دوتایی ما وصل می‌شوی${invitePin.trim() ? ' (رمز عبور را جداگانه برایت می‌فرستم)' : ''}:`,
            url: link,
          });
          return;
        } catch {
          // fallback to copy
        }
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        store.showToast(
          invitePin.trim()
            ? `لینک رمزنگاری‌شده برای ${targetName} کپی شد`
            : `لینک اختصاصی ${targetName} کپی شد`
        );
      } else {
        store.showToast('لینک ساخته شد؛ از کادر پایین کپی کنید');
      }
    } finally {
      setBuildingLink(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = typeof ev.target?.result === 'string' ? ev.target.result : '';
      if (store.importBackup(content)) {
        onClose();
      }
    };
    reader.readAsText(file);
    // Reset input so re-importing the same file always triggers onChange
    e.target.value = '';
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="تنظیمات، ظاهر و همگام‌سازی"
      subtitle={`اکانت فعال این گوشی: ${state.partners[state.myAccount]}`}
    >
      {/* Device Account Switcher (Local-only) */}
      <section
        className="p-4 rounded-2xl space-y-2.5"
        style={{ backgroundColor: 'var(--md-surface-low)' }}
      >
        <h3 className="text-xs font-bold" style={{ color: 'var(--md-on-surface-variant)' }}>
          این گوشی متعلق به کدام اکانت است؟
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(['p1', 'p2'] as const).map((acc) => {
            const active = state.myAccount === acc;
            return (
              <button
                key={acc}
                type="button"
                onClick={() => store.switchDeviceAccount(acc)}
                className={active ? 'm3-btn-primary text-xs' : 'm3-btn-tonal text-xs'}
              >
                <PartnerAvatar
                  partner={acc}
                  name={state.partners[acc]}
                  avatar={state.partnerAvatars[acc]}
                  size="xs"
                />
                <span>اکانت {state.partners[acc]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Studio Pastel Theme Mode & 16 Curated Pastel Palettes */}
      <section
        className="p-4 rounded-2xl space-y-3"
        style={{ backgroundColor: 'var(--md-surface-low)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold" style={{ color: 'var(--md-on-surface-variant)' }}>
            تم و ۲۴ پالت پاستلی استودیویی
          </h3>
          <span className="text-[11px] font-bold" style={{ color: 'var(--md-primary)' }}>
            {PALETTES.find((p) => p.id === state.palette)?.name}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {(
            [
              { id: 'auto', label: 'خودکار' },
              { id: 'light', label: 'روشن' },
              { id: 'dark', label: 'تاریک' },
              { id: 'amoled', label: 'AMOLED' },
            ] as { id: ThemeMode; label: string }[]
          ).map((m) => {
            const active = state.themeMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => store.setThemeMode(m.id)}
                className="min-h-[40px] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                style={{
                  backgroundColor: active ? 'var(--md-primary)' : 'var(--md-card)',
                  color: active ? 'var(--md-on-primary)' : 'var(--md-on-surface)',
                  border: '1px solid var(--md-outline-variant)',
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span style={{ color: 'var(--md-on-surface-variant)' }}>حالت دکمه سریع تاریک در هدر:</span>
          <div className="flex items-center gap-1">
            {(['dark', 'amoled'] as DarkStylePref[]).map((pref) => (
              <button
                key={pref}
                type="button"
                onClick={() => store.setDarkStylePref(pref)}
                className="px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                style={{
                  backgroundColor:
                    state.darkStylePref === pref ? 'var(--md-primary-container)' : 'transparent',
                  color:
                    state.darkStylePref === pref
                      ? 'var(--md-on-primary-container)'
                      : 'var(--md-on-surface-variant)',
                }}
              >
                {pref === 'amoled' ? 'سیاه AMOLED' : 'تاریک نرم'}
              </button>
            ))}
          </div>
        </div>

        {/* 24 Curated Dual-Tone Pastel Circles (3 rows of 8) */}
        <div className="grid grid-cols-8 gap-2 pt-1">
          {PALETTES.map((pal) => {
            const active = state.palette === pal.id;
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => store.setPalette(pal.id)}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90 mx-auto"
                style={{
                  background: `linear-gradient(135deg, ${pal.heroStart} 0%, ${pal.heroEnd} 100%)`,
                  boxShadow: active ? `0 0 0 2.5px var(--md-card), 0 0 0 4.5px ${pal.seed}` : 'none',
                }}
                title={pal.name}
                aria-label={`پالت رنگی ${pal.name}`}
                aria-pressed={active}
              >
                {active && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
              </button>
            );
          })}
        </div>

        {/* Subtle Sound Effects Toggle */}
        <div
          className="pt-2.5 mt-1 border-t flex items-center justify-between gap-3"
          style={{ borderColor: 'var(--md-outline-variant)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {state.soundEnabled ? (
              <Volume2 className="w-4 h-4 shrink-0" style={{ color: 'var(--md-primary)' }} />
            ) : (
              <VolumeX className="w-4 h-4 shrink-0" style={{ color: 'var(--md-on-surface-variant)' }} />
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold">صدای لطیف افکت‌ها</div>
              <div className="text-[11px]" style={{ color: 'var(--md-on-surface-variant)' }}>
                صدای نرم تیک‌زدن، تلنگر عاشقانه و شیشه خاطرات
              </div>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={state.soundEnabled}
            onClick={() => store.setSoundEnabled(!state.soundEnabled)}
            className="w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 flex items-center"
            style={{
              backgroundColor: state.soundEnabled ? 'var(--md-primary)' : 'var(--md-outline)',
              justifyContent: state.soundEnabled ? 'flex-start' : 'flex-end',
            }}
            aria-label="فعال یا غیرفعال کردن صدای افکت‌ها"
          >
            <span className="w-6 h-6 rounded-full bg-white shadow-sm block" />
          </button>
        </div>
      </section>

      {/* Partner Names & GitHub Gist Cloud Sync Form */}
      <form onSubmit={handleSaveProfileAndCloud} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="set-p1"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              نام نفر اول
            </label>
            <input
              id="set-p1"
              type="text"
              className="m3-input"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="set-p2"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              نام نفر دوم
            </label>
            <input
              id="set-p2"
              type="text"
              className="m3-input"
              value={p2}
              onChange={(e) => setP2(e.target.value)}
            />
          </div>
        </div>

        {/* Partner Avatar Picker */}
        <div
          className="p-4 rounded-2xl space-y-3"
          style={{ backgroundColor: 'var(--md-surface-low)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold" style={{ color: 'var(--md-on-surface-variant)' }}>
              آواتار اختصاصی زوجین
            </h3>
            <div className="flex items-center gap-1">
              {(['p1', 'p2'] as const).map((acc) => {
                const selected = avatarEditor === acc;
                const displayName = acc === 'p1' ? p1.trim() || state.partners.p1 : p2.trim() || state.partners.p2;
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => setAvatarEditor(acc)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    style={{
                      backgroundColor: selected ? 'var(--md-card)' : 'transparent',
                      color: selected ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
                      border: selected ? '1px solid var(--md-outline-variant)' : '1px solid transparent',
                    }}
                  >
                    <PartnerAvatar
                      partner={acc}
                      name={displayName}
                      avatar={state.partnerAvatars[acc]}
                      size="xs"
                    />
                    <span>{displayName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
            {PARTNER_AVATAR_OPTIONS.map((opt) => {
              const currentVal = state.partnerAvatars[avatarEditor] || 'initial';
              const active = currentVal === opt.id;
              const targetName =
                avatarEditor === 'p1'
                  ? p1.trim() || state.partners.p1
                  : p2.trim() || state.partners.p2;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => store.setPartnerAvatar(avatarEditor, opt.id)}
                  className="h-10 rounded-xl flex items-center justify-center text-base font-black cursor-pointer transition-transform active:scale-90"
                  style={{
                    backgroundColor: active ? 'var(--md-primary-container)' : 'var(--md-card)',
                    color: active ? 'var(--md-on-primary-container)' : 'var(--md-on-surface)',
                    border: active
                      ? '1.5px solid var(--md-primary)'
                      : '1px solid var(--md-outline-variant)',
                  }}
                  title={opt.label}
                  aria-label={`انتخاب آواتار ${opt.label} برای ${targetName}`}
                  aria-pressed={active}
                >
                  {opt.emoji || targetName.charAt(0) || 'د'}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="p-4 rounded-2xl space-y-3"
          style={{ backgroundColor: 'var(--md-surface-low)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold flex items-center gap-1.5">
              <Cloud className="w-4 h-4" style={{ color: 'var(--md-primary)' }} />
              <span>همگام‌سازی ابری هوشمند (GitHub Gist)</span>
            </h3>
            <span className="text-[11px] font-semibold" style={{ color: 'var(--md-on-surface-variant)' }}>
              {store.syncLabel}
            </span>
          </div>

          {/* Interactive 1-minute GitHub Token & Gist ID Guide */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: 'var(--md-card)',
              border: '1px solid var(--md-outline-variant)',
            }}
          >
            <button
              type="button"
              onClick={() => setShowTokenGuide((v) => !v)}
              className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-xs font-bold cursor-pointer"
              style={{ color: 'var(--md-primary)' }}
              aria-expanded={showTokenGuide}
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>چطور GitHub Token و Gist ID بسازم؟ (راهنمای ۱ دقیقه‌ای)</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                  showTokenGuide ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showTokenGuide && (
              <div
                className="px-3 pb-3 pt-1 space-y-2.5 text-xs leading-6 border-t"
                style={{
                  borderColor: 'var(--md-outline-variant)',
                  color: 'var(--md-on-surface-variant)',
                }}
              >
                <a
                  href="https://github.com/settings/tokens/new?scopes=gist&description=2tai-couple-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="m3-btn-primary w-full text-xs !min-h-[40px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>باز کردن مستقیم صفحه ساخت توکن در گیت‌هاب</span>
                </a>

                <ol className="space-y-1.5 list-decimal list-inside">
                  <li>
                    روی دکمه بالا بزنید و وارد اکانت رایگان گیت‌هاب خود شوید (تیک دسترسی{' '}
                    <strong style={{ color: 'var(--md-on-surface)' }}>gist</strong> از قبل برای شما
                    انتخاب شده است).
                  </li>
                  <li>
                    در بخش <strong style={{ color: 'var(--md-on-surface)' }}>Expiration</strong>{' '}
                    گزینه <strong style={{ color: 'var(--md-on-surface)' }}>No expiration</strong>{' '}
                    (یا ۱ سال) را انتخاب کنید.
                  </li>
                  <li>
                    پایین صفحه روی دکمه سبز{' '}
                    <strong style={{ color: 'var(--md-on-surface)' }}>Generate token</strong> بزنید
                    و کد ساخته‌شده (شروع با <code dir="ltr">ghp_</code>) را کپی و در کادر زیر وارد
                    کنید.
                  </li>
                </ol>

                <div
                  className="p-2.5 rounded-xl text-[11px] font-semibold leading-5"
                  style={{
                    backgroundColor: 'var(--md-primary-container)',
                    color: 'var(--md-on-primary-container)',
                  }}
                >
                  نکته مهم درباره Gist ID: اصلاً لازم نیست خودتان Gist ID بسازید! کادر Gist ID را
                  خالی بگذارید و «ذخیره تنظیمات» را بزنید؛ دوتایی خودش یک فایل کاملاً خصوصی در
                  گیت‌هاب می‌سازد و Gist ID را خودکار ثبت می‌کند. برای گوشی همسرتان هم فقط از «لینک
                  دعوت ایمن» پایین استفاده کنید.
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="set-gist-token" className="text-xs font-semibold block" style={{ color: 'var(--md-on-surface-variant)' }}>
              GitHub Personal Access Token (با دسترسی gist)
            </label>
            <input
              id="set-gist-token"
              type="password"
              dir="ltr"
              autoComplete="off"
              className="m3-input text-left"
              placeholder="ghp_... یا github_pat_..."
              value={gistToken}
              onChange={(e) => setGistToken(e.target.value)}
            />

            <label htmlFor="set-gist-id" className="text-xs font-semibold block pt-1" style={{ color: 'var(--md-on-surface-variant)' }}>
              Gist ID (خالی بگذارید تا خودکار ساخته شود)
            </label>
            <input
              id="set-gist-id"
              type="text"
              dir="ltr"
              autoComplete="off"
              className="m3-input text-left"
              placeholder="خالی بگذارید — ساخت خودکار"
              value={gistId}
              onChange={(e) => setGistId(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => void store.pushToCloud(false)}
              className="m3-btn-tonal flex-1 text-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ادغام و ارسال</span>
            </button>
            <button
              type="button"
              onClick={() => void store.pullFromCloud(false, true)}
              className="m3-btn-tonal flex-1 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>دریافت از ابر</span>
            </button>
            {state.syncConfig.gistToken && (
              <button
                type="button"
                onClick={() => {
                  void store.disconnectCloud();
                  setGistToken('');
                  setGistId('');
                }}
                className="m3-icon-btn"
                style={{ color: 'var(--md-danger)' }}
                aria-label="قطع اتصال و پاک کردن کامل توکن"
                title="پاک کردن کامل توکن"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <button type="submit" className="m3-btn-primary w-full">
          ذخیره تنظیمات
        </button>
      </form>

      {/* Secure PIN-Encrypted Magic Invite Link */}
      <section
        className="p-4 rounded-2xl space-y-3"
        style={{ backgroundColor: 'var(--md-surface-low)' }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--md-primary)' }} />
          <h3 className="text-xs font-extrabold">دعوت همسرتان بدون نیاز به توکن (لینک جادویی)</h3>
        </div>
        <p className="text-xs leading-6" style={{ color: 'var(--md-on-surface-variant)' }}>
          همسرتان اصلاً نیازی به ساخت یا وارد کردن توکن ندارد؛ فقط روی این لینک می‌زند و خودکار
          وصل می‌شود. اگر یک رمز ۴ رقمی بگذارید، توکن با AES-256 رمزنگاری می‌شود تا حتی اگر کسی
          لینک را ببیند نتواند توکن را استخراج کند.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <label htmlFor="invite-target" className="text-xs font-semibold block" style={{ color: 'var(--md-on-surface-variant)' }}>
              ساخت لینک برای
            </label>
            <select
              id="invite-target"
              className="m3-input text-xs"
              value={inviteTarget}
              onChange={(e) => setInviteTarget(e.target.value as PartnerId)}
            >
              <option value="p2">{p2.trim() || state.partners.p2}</option>
              <option value="p1">{p1.trim() || state.partners.p1}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="invite-pin" className="text-xs font-semibold block" style={{ color: 'var(--md-on-surface-variant)' }}>
              رمز محافظ لینک (توصیه‌شده)
            </label>
            <div className="relative">
              <KeyRound
                className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--md-on-surface-variant)' }}
              />
              <input
                id="invite-pin"
                type="text"
                inputMode="numeric"
                className="m3-input pr-9 text-xs"
                placeholder="مثلاً: 1404"
                value={invitePin}
                onChange={(e) => setInvitePin(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={buildingLink}
            onClick={() => void handleBuildInvite('share')}
            className="m3-btn-primary flex-1 text-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>{buildingLink ? 'در حال ساخت...' : 'ارسال لینک ایمن'}</span>
          </button>
          <button
            type="button"
            disabled={buildingLink}
            onClick={() => void handleBuildInvite('copy')}
            className="m3-btn-tonal text-xs"
          >
            <Copy className="w-4 h-4" />
            <span>کپی</span>
          </button>
        </div>

        {generatedLink && (
          <div className="space-y-1">
            <label htmlFor="generated-invite-box" className="text-[11px] font-semibold block" style={{ color: 'var(--md-on-surface-variant)' }}>
              لینک آماده (برای کپی دستی انتخاب کنید):
            </label>
            <input
              id="generated-invite-box"
              type="text"
              readOnly
              dir="ltr"
              className="m3-input text-xs text-left select-all"
              value={generatedLink}
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>
        )}
      </section>

      {/* Safe Backup & Restore + PWA Install */}
      <section className="space-y-2.5 pt-1">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              exportSafeBackupJson(state);
              store.showToast('بکاپ ایمن (بدون توکن گیت‌هاب) دانلود شد');
            }}
            className="m3-btn-tonal text-xs"
          >
            <Download className="w-4 h-4" />
            <span>دانلود بکاپ ایمن</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="m3-btn-tonal text-xs"
          >
            <Upload className="w-4 h-4" />
            <span>بازیابی بکاپ</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
        <PWAInstallButton />
      </section>
    </BottomSheet>
  );
};
