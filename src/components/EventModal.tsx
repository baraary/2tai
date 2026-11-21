import React, { useEffect, useState } from 'react';
import { HERO_ART_OPTIONS, HeroArtwork } from '../data/assets';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { CategoryListKey, CoupleEvent, HeroArtKey, PartnerTarget } from '../types/app';
import { getTodayJalaliKey, toFa } from '../utils/jalali';
import { BottomSheet } from './BottomSheet';
import { CategoryCombobox } from './CategoryCombobox';
import { JalaliDateFields } from './JalaliDateFields';

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  store: CoupleStore;
  editEvent?: CoupleEvent | null;
  defaultDateKey?: string;
  onOpenCategoryManager: (listKey: CategoryListKey, editCatName?: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  open,
  onClose,
  store,
  editEvent,
  defaultDateKey,
  onOpenCategoryManager,
}) => {
  const { state } = store;
  const defaultCat = state.eventCategories[0] || {
    name: 'سالگرد و عاشقانه',
    icon: 'ring',
    heroArt: 'rings' as HeroArtKey,
  };

  const [title, setTitle] = useState('');
  const [dateKey, setDateKey] = useState(getTodayJalaliKey());
  const [time, setTime] = useState('');
  const [partner, setPartner] = useState<PartnerTarget>('both');
  const [category, setCategory] = useState(defaultCat.name);
  const [heroArt, setHeroArt] = useState<HeroArtKey>(defaultCat.heroArt || 'rings');
  const [pinned, setPinned] = useState(false);
  const [repeatYearly, setRepeatYearly] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editEvent) {
      setTitle(editEvent.title);
      setDateKey(editEvent.dateKey);
      setTime(editEvent.time || '');
      setPartner(editEvent.partner || 'both');
      setCategory(editEvent.category || defaultCat.name);
      const matchedCat = state.eventCategories.find((c) => c.name === editEvent.category);
      setHeroArt(editEvent.heroArt || matchedCat?.heroArt || 'hearts');
      setPinned(Boolean(editEvent.pinned));
      setRepeatYearly(Boolean(editEvent.repeatYearly));
      setNote(editEvent.note || '');
    } else {
      setTitle('');
      setDateKey(defaultDateKey || getTodayJalaliKey());
      setTime('');
      setPartner('both');
      setCategory(defaultCat.name);
      setHeroArt(defaultCat.heroArt || 'rings');
      setPinned(state.events.length === 0);
      setRepeatYearly(true);
      setNote('');
    }
  }, [open, editEvent, defaultDateKey, defaultCat.name, defaultCat.heroArt, state.eventCategories, state.events.length]);

  const handleCategoryChange = (name: string) => {
    setCategory(name);
    const cat = state.eventCategories.find((c) => c.name === name);
    if (cat?.heroArt) setHeroArt(cat.heroArt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      store.showToast('لطفاً عنوان رویداد را بنویسید');
      return;
    }
    store.saveEvent(
      {
        title: cleanTitle,
        dateKey,
        time,
        partner,
        category: category.trim() || defaultCat.name,
        heroArt,
        pinned,
        repeatYearly,
        note: note.trim(),
      },
      editEvent?.id
    );
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editEvent ? 'ویرایش رویداد' : 'ثبت رویداد جدید'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="ev-title"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            عنوان رویداد
          </label>
          <input
            id="ev-title"
            type="text"
            className="m3-input"
            placeholder="مثلاً: سالگرد ازدواج، تولد، سفر شمال..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <JalaliDateFields
          idPrefix="ev-date"
          label="تاریخ شمسی"
          value={dateKey}
          onChange={setDateKey}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="ev-time"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              ساعت (اختیاری)
            </label>
            <input
              id="ev-time"
              type="time"
              className="m3-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="ev-partner"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              مربوط به
            </label>
            <select
              id="ev-partner"
              className="m3-input"
              value={partner}
              onChange={(e) => setPartner(e.target.value as PartnerTarget)}
            >
              <option value="both">دوتایی</option>
              <option value="p1">{state.partners.p1}</option>
              <option value="p2">{state.partners.p2}</option>
            </select>
          </div>
        </div>

        <CategoryCombobox
          id="ev-category"
          label="دسته‌بندی"
          listKey="eventCategories"
          categories={state.eventCategories}
          value={category}
          onChange={handleCategoryChange}
          onQuickCreate={(name) =>
            store.saveCategory('eventCategories', { name, icon: 'heart', heroArt })
          }
          onOpenManager={onOpenCategoryManager}
          onDeleteCategory={store.deleteCategory}
        />

        {/* Hero Art Picker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              تصویرک کارت شمارش معکوس
            </span>
            <span
              className="text-[11px] font-bold"
              style={{ color: 'var(--md-primary)' }}
            >
              {toFa(HERO_ART_OPTIONS.length)} طرح اختصاصی
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pl-1 py-0.5">
            {HERO_ART_OPTIONS.map((opt) => {
              const active = heroArt === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setHeroArt(opt.key)}
                  className="p-2 rounded-2xl flex flex-col items-center gap-1.5 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: active
                      ? 'var(--md-primary-container)'
                      : 'var(--md-surface-low)',
                    border: active
                      ? '2px solid var(--md-primary)'
                      : '1px solid var(--md-outline-variant)',
                  }}
                >
                  <div className="w-12 h-12 rounded-xl m3-hero-gradient p-1.5">
                    <HeroArtwork artKey={opt.key} />
                  </div>
                  <span className="text-[10px] font-bold truncate w-full text-center">
                    {opt.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <label
            htmlFor="ev-repeat"
            className="flex items-center gap-2.5 p-3 rounded-2xl cursor-pointer text-sm font-semibold"
            style={{ backgroundColor: 'var(--md-surface-low)' }}
          >
            <input
              id="ev-repeat"
              type="checkbox"
              className="w-4 h-4 accent-current"
              checked={repeatYearly}
              onChange={(e) => setRepeatYearly(e.target.checked)}
            />
            <span>تکرار سالانه (سالگرد/تولد)</span>
          </label>
          <label
            htmlFor="ev-pin"
            className="flex items-center gap-2.5 p-3 rounded-2xl cursor-pointer text-sm font-semibold"
            style={{ backgroundColor: 'var(--md-surface-low)' }}
          >
            <input
              id="ev-pin"
              type="checkbox"
              className="w-4 h-4 accent-current"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
            <span>پین در صفحه خانه</span>
          </label>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="ev-note"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            یادداشت (اختیاری)
          </label>
          <textarea
            id="ev-note"
            rows={2}
            className="m3-input"
            placeholder="توضیحات یا برنامه‌ریزی این روز..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button type="submit" className="m3-btn-primary flex-1">
            {editEvent ? 'ذخیره تغییرات' : 'ثبت رویداد'}
          </button>
          <button type="button" onClick={onClose} className="m3-btn-tonal">
            انصراف
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
