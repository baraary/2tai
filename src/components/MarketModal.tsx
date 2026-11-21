import React, { useEffect, useState } from 'react';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type {
  CategoryListKey,
  MarketSubTab,
  PantryItem,
  PantryStatus,
  PriorityLevel,
  ShoppingItem,
} from '../types/app';
import { getTodayJalaliKey } from '../utils/jalali';
import { parseTagsInput } from '../utils/storageAndValidation';
import { BottomSheet } from './BottomSheet';
import { CategoryCombobox } from './CategoryCombobox';
import { JalaliDateFields } from './JalaliDateFields';

interface MarketModalProps {
  open: boolean;
  onClose: () => void;
  store: CoupleStore;
  initialTarget: MarketSubTab;
  editItem?: ShoppingItem | PantryItem | null;
  quickTitle?: string;
  defaultCategory?: string;
  onOpenCategoryManager: (listKey: CategoryListKey, editCatName?: string) => void;
  onAfterSaveTarget?: (target: MarketSubTab) => void;
}

export const MarketModal: React.FC<MarketModalProps> = ({
  open,
  onClose,
  store,
  initialTarget,
  editItem,
  quickTitle,
  defaultCategory,
  onOpenCategoryManager,
  onAfterSaveTarget,
}) => {
  const { state } = store;
  const fallbackCat = state.marketCategories[0]?.name || 'سوپرمارکت و لبنیات';

  const [target, setTarget] = useState<MarketSubTab>(initialTarget);
  const [title, setTitle] = useState('');
  const [qty, setQty] = useState('');
  const [category, setCategory] = useState(fallbackCat);
  const [status, setStatus] = useState<PantryStatus>('ok');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [tagsRaw, setTagsRaw] = useState('');
  const [note, setNote] = useState('');
  const [hasPurchaseDate, setHasPurchaseDate] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(getTodayJalaliKey());
  const [hasExpiryDate, setHasExpiryDate] = useState(false);
  const [expiryDate, setExpiryDate] = useState(getTodayJalaliKey());

  useEffect(() => {
    if (!open) return;
    const todayKey = getTodayJalaliKey();
    setTarget(initialTarget);
    if (editItem) {
      setTitle(editItem.title);
      setQty(editItem.qty || '');
      setCategory(editItem.category || fallbackCat);
      setPriority(editItem.priority || 'normal');
      setTagsRaw((editItem.tags || []).join('، '));
      setNote(editItem.note || '');
      if ('status' in editItem) {
        setStatus(editItem.status || 'ok');
        setHasPurchaseDate(Boolean(editItem.purchaseDate));
        setPurchaseDate(editItem.purchaseDate || todayKey);
        setHasExpiryDate(Boolean(editItem.expiryDate));
        setExpiryDate(editItem.expiryDate || todayKey);
      } else {
        setStatus('ok');
        setHasPurchaseDate(false);
        setPurchaseDate(todayKey);
        setHasExpiryDate(false);
        setExpiryDate(todayKey);
      }
    } else {
      setTitle(quickTitle || '');
      setQty('');
      setCategory(defaultCategory || fallbackCat);
      setStatus('ok');
      setPriority('normal');
      setTagsRaw('');
      setNote('');
      setHasPurchaseDate(false);
      setPurchaseDate(todayKey);
      setHasExpiryDate(false);
      setExpiryDate(todayKey);
    }
  }, [open, initialTarget, editItem, quickTitle, defaultCategory, fallbackCat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      store.showToast('لطفاً نام کالا را وارد کنید');
      return;
    }

    store.saveMarketItem({
      target,
      editId: editItem?.id,
      sourceList: editItem ? initialTarget : undefined,
      title: cleanTitle,
      qty: qty.trim(),
      category: category.trim() || fallbackCat,
      status,
      purchaseDate: target === 'pantry' && hasPurchaseDate ? purchaseDate : null,
      expiryDate: target === 'pantry' && hasExpiryDate ? expiryDate : null,
      priority,
      tags: parseTagsInput(tagsRaw),
      note: note.trim(),
    });
    onAfterSaveTarget?.(target);
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editItem ? 'ویرایش کالا' : 'افزودن به خرید / انبار خانه'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="grid grid-cols-2 p-1 rounded-2xl gap-1"
          style={{
            backgroundColor: 'var(--md-surface-container)',
            border: '1px solid var(--md-outline-variant)',
          }}
        >
          <button
            type="button"
            onClick={() => setTarget('shopping')}
            className="min-h-[40px] rounded-xl text-xs font-bold cursor-pointer transition-colors"
            style={{
              backgroundColor: target === 'shopping' ? 'var(--md-card)' : 'transparent',
              color: target === 'shopping' ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
            }}
          >
            لیست خرید
          </button>
          <button
            type="button"
            onClick={() => setTarget('pantry')}
            className="min-h-[40px] rounded-xl text-xs font-bold cursor-pointer transition-colors"
            style={{
              backgroundColor: target === 'pantry' ? 'var(--md-card)' : 'transparent',
              color: target === 'pantry' ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
            }}
          >
            انبار خانه
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label
              htmlFor="mk-title"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              نام کالا
            </label>
            <input
              id="mk-title"
              type="text"
              className="m3-input"
              placeholder="مثلاً: شیر، روغن زیتون، قهوه..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="mk-qty"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              مقدار / تعداد
            </label>
            <input
              id="mk-qty"
              type="text"
              className="m3-input"
              placeholder="۲ بسته"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
        </div>

        <CategoryCombobox
          id="mk-category"
          label="دسته‌بندی"
          listKey="marketCategories"
          categories={state.marketCategories}
          value={category}
          onChange={setCategory}
          onQuickCreate={(name) => store.saveCategory('marketCategories', { name, icon: 'cart' })}
          onOpenManager={onOpenCategoryManager}
          onDeleteCategory={store.deleteCategory}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="mk-priority"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              اولویت
            </label>
            <select
              id="mk-priority"
              className="m3-input"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
            >
              <option value="normal">عادی</option>
              <option value="high">فوری</option>
            </select>
          </div>

          {target === 'pantry' && (
            <div className="space-y-1.5">
              <label
                htmlFor="mk-status"
                className="text-xs font-semibold block"
                style={{ color: 'var(--md-on-surface-variant)' }}
              >
                وضعیت موجودی
              </label>
              <select
                id="mk-status"
                className="m3-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as PantryStatus)}
              >
                <option value="ok">موجود</option>
                <option value="low">رو به اتمام</option>
                <option value="empty">تمام شده</option>
              </select>
            </div>
          )}
        </div>

        {target === 'pantry' && (
          <div className="space-y-3 p-3.5 rounded-2xl" style={{ backgroundColor: 'var(--md-surface-low)' }}>
            <label htmlFor="mk-has-pur" className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input
                id="mk-has-pur"
                type="checkbox"
                checked={hasPurchaseDate}
                onChange={(e) => setHasPurchaseDate(e.target.checked)}
              />
              <span>ثبت تاریخ خرید</span>
            </label>
            {hasPurchaseDate && (
              <JalaliDateFields
                idPrefix="mk-pur"
                value={purchaseDate}
                onChange={setPurchaseDate}
              />
            )}

            <label htmlFor="mk-has-exp" className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input
                id="mk-has-exp"
                type="checkbox"
                checked={hasExpiryDate}
                onChange={(e) => setHasExpiryDate(e.target.checked)}
              />
              <span>ثبت تاریخ انقضا (هشدار هوشمند)</span>
            </label>
            {hasExpiryDate && (
              <JalaliDateFields
                idPrefix="mk-exp"
                value={expiryDate}
                onChange={setExpiryDate}
              />
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="mk-tags"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            تگ‌ها (با ویرگول یا فاصله جدا کنید)
          </label>
          <input
            id="mk-tags"
            type="text"
            className="m3-input"
            placeholder="ارگانیک، مهمانی، صبحانه"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="mk-note"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            یادداشت (اختیاری)
          </label>
          <textarea
            id="mk-note"
            rows={2}
            className="m3-input"
            placeholder="برند مدنظر یا توضیح..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button type="submit" className="m3-btn-primary flex-1">
            {editItem ? 'ذخیره تغییرات' : 'افزودن کالا'}
          </button>
          <button type="button" onClick={onClose} className="m3-btn-tonal">
            انصراف
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
