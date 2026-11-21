import React, { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { CATEGORY_ICONS, CategoryIcon, HERO_ART_OPTIONS, HeroArtwork } from '../data/assets';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { CategoryListKey, HeroArtKey } from '../types/app';
import { toFa } from '../utils/jalali';
import { BottomSheet } from './BottomSheet';

interface CategoryManagerModalProps {
  open: boolean;
  onClose: () => void;
  store: CoupleStore;
  listKey: CategoryListKey;
  initialEditName?: string | null;
}

const TITLES: Record<CategoryListKey, string> = {
  eventCategories: 'مدیریت دسته‌بندی‌های تقویم',
  marketCategories: 'مدیریت دسته‌بندی‌های خرید و انبار',
  taskCategories: 'مدیریت دسته‌بندی‌های کارهای خانه',
  wishCategories: 'مدیریت دسته‌بندی‌های آرزوها',
};

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  open,
  onClose,
  store,
  listKey,
  initialEditName,
}) => {
  const categories = store.state[listKey] || [];
  const [editingOriginal, setEditingOriginal] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('star');
  const [heroArt, setHeroArt] = useState<HeroArtKey>('hearts');

  useEffect(() => {
    if (!open) return;
    if (initialEditName) {
      const found = categories.find((c) => c.name === initialEditName);
      if (found) {
        setEditingOriginal(found.name);
        setName(found.name);
        setIcon(found.icon || 'star');
        setHeroArt(found.heroArt || 'hearts');
        return;
      }
    }
    setEditingOriginal(null);
    setName('');
    setIcon('star');
    setHeroArt('hearts');
  }, [open, initialEditName, listKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setEditingOriginal(null);
    setName('');
    setIcon('star');
    setHeroArt('hearts');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) {
      store.showToast('نام دسته‌بندی را وارد کنید');
      return;
    }
    store.saveCategory(
      listKey,
      listKey === 'eventCategories' ? { name: clean, icon, heroArt } : { name: clean, icon },
      editingOriginal
    );
    resetForm();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={TITLES[listKey]}>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-4 rounded-2xl"
        style={{ backgroundColor: 'var(--md-surface-low)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold">
            {editingOriginal ? `ویرایش دسته «${editingOriginal}»` : 'افزودن دسته‌بندی جدید'}
          </h3>
          {editingOriginal && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-bold cursor-pointer"
              style={{ color: 'var(--md-primary)' }}
            >
              لغو ویرایش
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="cat-mgr-name"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            نام دسته‌بندی
          </label>
          <input
            id="cat-mgr-name"
            type="text"
            className="m3-input"
            placeholder="مثلاً: ورزش، کتاب، هدیه..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              آیکون دسته‌بندی
            </span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--md-primary)' }}>
              {toFa(CATEGORY_ICONS.length)} آیکون
            </span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto pl-1 py-0.5">
            {CATEGORY_ICONS.map((ic) => {
              const active = icon === ic.key;
              return (
                <button
                  key={ic.key}
                  type="button"
                  onClick={() => setIcon(ic.key)}
                  className="h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--md-primary)' : 'var(--md-card)',
                    color: active ? 'var(--md-on-primary)' : 'var(--md-on-surface)',
                    border: '1px solid var(--md-outline-variant)',
                  }}
                  title={ic.label}
                  aria-label={ic.label}
                >
                  <CategoryIcon name={ic.key} className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {listKey === 'eventCategories' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold block"
                style={{ color: 'var(--md-on-surface-variant)' }}
              >
                تصویرک پیش‌فرض رویداد
              </span>
              <span
                className="text-[11px] font-bold"
                style={{ color: 'var(--md-primary)' }}
              >
                {toFa(HERO_ART_OPTIONS.length)} طرح
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto pl-1 py-0.5">
              {HERO_ART_OPTIONS.map((opt) => {
                const active = heroArt === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setHeroArt(opt.key)}
                    className="p-2 rounded-xl flex flex-col items-center gap-1 cursor-pointer"
                    style={{
                      backgroundColor: active ? 'var(--md-primary-container)' : 'var(--md-card)',
                      border: active
                        ? '2px solid var(--md-primary)'
                        : '1px solid var(--md-outline-variant)',
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg m3-hero-gradient p-1">
                      <HeroArtwork artKey={opt.key} />
                    </div>
                    <span className="text-[10px] font-semibold truncate w-full text-center">
                      {opt.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button type="submit" className="m3-btn-primary w-full">
          {editingOriginal ? 'ذخیره ویرایش دسته' : 'افزودن دسته‌بندی'}
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-xs font-bold" style={{ color: 'var(--md-on-surface-variant)' }}>
          دسته‌های موجود ({categories.length})
        </h3>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl"
              style={{ backgroundColor: 'var(--md-surface-low)' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'var(--md-primary-container)',
                    color: 'var(--md-on-primary-container)',
                  }}
                >
                  <CategoryIcon name={cat.icon} className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold truncate">{cat.name}</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingOriginal(cat.name);
                    setName(cat.name);
                    setIcon(cat.icon || 'star');
                    setHeroArt(cat.heroArt || 'hearts');
                  }}
                  className="m3-icon-btn"
                  aria-label={`ویرایش ${cat.name}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => store.deleteCategory(listKey, cat.name)}
                  className="m3-icon-btn"
                  style={{ color: 'var(--md-danger)' }}
                  aria-label={`حذف ${cat.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
};
