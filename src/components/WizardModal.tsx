import React, { useState } from 'react';
import { Check, Heart } from 'lucide-react';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { PartnerId } from '../types/app';
import { getTodayJalaliKey } from '../utils/jalali';
import { PALETTES } from '../utils/themeEngine';
import { BottomSheet } from './BottomSheet';
import { JalaliDateFields } from './JalaliDateFields';

interface WizardModalProps {
  open: boolean;
  store: CoupleStore;
}

export const WizardModal: React.FC<WizardModalProps> = ({ open, store }) => {
  const [p1, setP1] = useState(
    store.state.partners.p1 === 'نفر اول' ? '' : store.state.partners.p1
  );
  const [p2, setP2] = useState(
    store.state.partners.p2 === 'نفر دوم' ? '' : store.state.partners.p2
  );
  const [myAccount, setMyAccount] = useState<PartnerId>(store.state.myAccount);
  const [evTitle, setEvTitle] = useState('');
  const [evDate, setEvDate] = useState(getTodayJalaliKey());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.finishWizard({
      p1: p1.trim() || 'نفر اول',
      p2: p2.trim() || 'نفر دوم',
      myAccount,
      firstEventTitle: evTitle.trim() || undefined,
      firstEventDateKey: evDate,
    });
  };

  return (
    <BottomSheet
      open={open}
      onClose={() => {}}
      preventBackdropClose
      title="به فضای دوتایی خوش آمدید"
      subtitle="در کمتر از ۳۰ ثانیه اپلیکیشن مشترک خودتان را آماده کنید"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="wiz-p1"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              نام نفر اول
            </label>
            <input
              id="wiz-p1"
              type="text"
              className="m3-input"
              placeholder="مثلاً: علی"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="wiz-p2"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              نام نفر دوم
            </label>
            <input
              id="wiz-p2"
              type="text"
              className="m3-input"
              placeholder="مثلاً: سارا"
              value={p2}
              onChange={(e) => setP2(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <span
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            الان کدام‌یک با این گوشی وارد می‌شوید؟
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMyAccount('p1')}
              className={myAccount === 'p1' ? 'm3-btn-primary text-xs' : 'm3-btn-tonal text-xs'}
            >
              {p1.trim() || 'نفر اول'}
            </button>
            <button
              type="button"
              onClick={() => setMyAccount('p2')}
              className={myAccount === 'p2' ? 'm3-btn-primary text-xs' : 'm3-btn-tonal text-xs'}
            >
              {p2.trim() || 'نفر دوم'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              انتخاب رنگ پاستلی دلخواه
            </span>
            <span
              className="text-[11px] font-bold"
              style={{ color: 'var(--md-primary)' }}
            >
              {PALETTES.find((p) => p.id === store.state.palette)?.name}
            </span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {PALETTES.map((pal) => {
              const active = store.state.palette === pal.id;
              return (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => store.setPalette(pal.id)}
                  className="w-9 h-9 rounded-full flex items-center justify-center mx-auto cursor-pointer transition-transform active:scale-90"
                  style={{
                    backgroundColor: pal.seed,
                    boxShadow: active
                      ? `0 0 0 2px var(--md-card), 0 0 0 4px ${pal.seed}`
                      : 'none',
                  }}
                  title={pal.name}
                  aria-label={pal.name}
                >
                  {active && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="p-3.5 rounded-2xl space-y-3"
          style={{ backgroundColor: 'var(--md-surface-low)' }}
        >
          <div className="space-y-1.5">
            <label
              htmlFor="wiz-ev-title"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              اولین مناسبت مهم (اختیاری — مثلاً سالگرد آشنایی یا ازدواج)
            </label>
            <input
              id="wiz-ev-title"
              type="text"
              className="m3-input"
              placeholder="سالگرد ازدواج ما"
              value={evTitle}
              onChange={(e) => setEvTitle(e.target.value)}
            />
          </div>
          {evTitle.trim() && (
            <JalaliDateFields
              idPrefix="wiz-ev-date"
              label="تاریخ شمسی مناسبت"
              value={evDate}
              onChange={setEvDate}
            />
          )}
        </div>

        <button type="submit" className="m3-btn-primary w-full">
          <Heart className="w-4 h-4 fill-current" />
          <span>شروع استفاده از دوتایی</span>
        </button>
      </form>
    </BottomSheet>
  );
};
