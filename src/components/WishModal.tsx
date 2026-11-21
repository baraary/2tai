import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { CategoryListKey, PriorityLevel, WishItem } from '../types/app';
import { parseTagsInput } from '../utils/storageAndValidation';
import { BottomSheet } from './BottomSheet';
import { CategoryCombobox } from './CategoryCombobox';

interface WishModalProps {
  open: boolean;
  onClose: () => void;
  store: CoupleStore;
  editWish?: WishItem | null;
  quickTitle?: string;
  defaultCategory?: string;
  onOpenCategoryManager: (listKey: CategoryListKey, editCatName?: string) => void;
}

export const WishModal: React.FC<WishModalProps> = ({
  open,
  onClose,
  store,
  editWish,
  quickTitle,
  defaultCategory,
  onOpenCategoryManager,
}) => {
  const { state } = store;
  const fallbackCat = state.wishCategories[0]?.name || 'سفر و طبیعت‌گردی';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(fallbackCat);
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [tagsRaw, setTagsRaw] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [localOnly, setLocalOnly] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editWish) {
      setTitle(editWish.title);
      setCategory(editWish.category || fallbackCat);
      setPriority(editWish.priority || 'high');
      setTagsRaw((editWish.tags || []).join('، '));
      setIsPrivate(Boolean(editWish.isPrivate));
      setLocalOnly(editWish.localOnly ?? Boolean(editWish.isPrivate));
      setNote(editWish.note || '');
    } else {
      setTitle(quickTitle || '');
      setCategory(defaultCategory || fallbackCat);
      setPriority('high');
      setTagsRaw('');
      setIsPrivate(false);
      setLocalOnly(true);
      setNote('');
    }
  }, [open, editWish, quickTitle, defaultCategory, fallbackCat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      store.showToast('عنوان آرزو را وارد کنید');
      return;
    }
    store.saveWish(
      {
        title: cleanTitle,
        category: category.trim() || fallbackCat,
        priority,
        tags: parseTagsInput(tagsRaw),
        isPrivate,
        localOnly: isPrivate ? localOnly : false,
        note: note.trim(),
      },
      editWish?.id
    );
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editWish ? 'ویرایش آرزو یا ایده' : 'ثبت آرزو یا ایده جدید'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="ws-title"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            عنوان آرزو یا ایده
          </label>
          <input
            id="ws-title"
            type="text"
            className="m3-input"
            placeholder="مثلاً: سفر به کیش، ایده هدیه تولد، کافه جدید..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <CategoryCombobox
          id="ws-category"
          label="دسته‌بندی"
          listKey="wishCategories"
          categories={state.wishCategories}
          value={category}
          onChange={setCategory}
          onQuickCreate={(name) => store.saveCategory('wishCategories', { name, icon: 'star' })}
          onOpenManager={onOpenCategoryManager}
          onDeleteCategory={store.deleteCategory}
        />

        <div className="space-y-1.5">
          <label
            htmlFor="ws-priority"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            اهمیت
          </label>
          <select
            id="ws-priority"
            className="m3-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityLevel)}
          >
            <option value="high">ویژه و اولویت‌دار</option>
            <option value="normal">معمولی</option>
          </select>
        </div>

        <div
          className="p-3.5 rounded-2xl space-y-2.5"
          style={{ backgroundColor: 'var(--md-surface-low)' }}
        >
          <label htmlFor="ws-private" className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
            <input
              id="ws-private"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <span>آیتم خصوصی (مناسب ایده هدیه سورپرایزی)</span>
          </label>
          {isPrivate && (
            <label
              htmlFor="ws-local-only"
              className="flex items-start gap-2.5 text-xs leading-6 cursor-pointer pr-6"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              <input
                id="ws-local-only"
                type="checkbox"
                className="mt-1"
                checked={localOnly}
                onChange={(e) => setLocalOnly(e.target.checked)}
              />
              <span className="flex items-start gap-1">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-1" style={{ color: 'var(--md-primary)' }} />
                <span>
                  <strong>حفظ کامل محرمانگی:</strong> فقط روی همین گوشی ذخیره شود و هرگز به Gist
                  مشترک ارسال نشود.
                </span>
              </span>
            </label>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="ws-tags"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            تگ‌ها
          </label>
          <input
            id="ws-tags"
            type="text"
            className="m3-input"
            placeholder="تابستان، سورپرایز، فیلم"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="ws-note"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            یادداشت
          </label>
          <textarea
            id="ws-note"
            rows={2}
            className="m3-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button type="submit" className="m3-btn-primary flex-1">
            {editWish ? 'ذخیره تغییرات' : 'ثبت آرزو'}
          </button>
          <button type="button" onClick={onClose} className="m3-btn-tonal">
            انصراف
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
