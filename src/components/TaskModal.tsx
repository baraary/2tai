import React, { useEffect, useState } from 'react';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type {
  CategoryListKey,
  HomeTask,
  PartnerTarget,
  PriorityLevel,
  TaskFrequency,
} from '../types/app';
import { parseTagsInput } from '../utils/storageAndValidation';
import { BottomSheet } from './BottomSheet';
import { CategoryCombobox } from './CategoryCombobox';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  store: CoupleStore;
  editTask?: HomeTask | null;
  quickTitle?: string;
  defaultCategory?: string;
  onOpenCategoryManager: (listKey: CategoryListKey, editCatName?: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  open,
  onClose,
  store,
  editTask,
  quickTitle,
  defaultCategory,
  onOpenCategoryManager,
}) => {
  const { state } = store;
  const fallbackCat = state.taskCategories[0]?.name || 'کارهای منزل';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(fallbackCat);
  const [assignee, setAssignee] = useState<PartnerTarget>('both');
  const [freq, setFreq] = useState<TaskFrequency>('یک‌بار');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [tagsRaw, setTagsRaw] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editTask) {
      setTitle(editTask.title);
      setCategory(editTask.category || fallbackCat);
      setAssignee(editTask.assignee || 'both');
      setFreq(editTask.freq || 'یک‌بار');
      setPriority(editTask.priority || 'normal');
      setTagsRaw((editTask.tags || []).join('، '));
      setNote(editTask.note || '');
    } else {
      setTitle(quickTitle || '');
      setCategory(defaultCategory || fallbackCat);
      setAssignee('both');
      setFreq('یک‌بار');
      setPriority('normal');
      setTagsRaw('');
      setNote('');
    }
  }, [open, editTask, quickTitle, defaultCategory, fallbackCat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      store.showToast('عنوان کار را وارد کنید');
      return;
    }
    store.saveTask(
      {
        title: cleanTitle,
        category: category.trim() || fallbackCat,
        assignee,
        freq,
        priority,
        tags: parseTagsInput(tagsRaw),
        note: note.trim(),
      },
      editTask?.id
    );
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editTask ? 'ویرایش کار خانه' : 'ثبت کار جدید برای خانه'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="tk-title"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            عنوان کار
          </label>
          <input
            id="tk-title"
            type="text"
            className="m3-input"
            placeholder="مثلاً: آبیاری گل‌ها، پرداخت قبض، تعمیر شیر..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <CategoryCombobox
          id="tk-category"
          label="دسته‌بندی"
          listKey="taskCategories"
          categories={state.taskCategories}
          value={category}
          onChange={setCategory}
          onQuickCreate={(name) => store.saveCategory('taskCategories', { name, icon: 'wrench' })}
          onOpenManager={onOpenCategoryManager}
          onDeleteCategory={store.deleteCategory}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="tk-assignee"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              مسئول انجام
            </label>
            <select
              id="tk-assignee"
              className="m3-input"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value as PartnerTarget)}
            >
              <option value="both">دوتایی</option>
              <option value="p1">{state.partners.p1}</option>
              <option value="p2">{state.partners.p2}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="tk-freq"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              تکرار خودکار
            </label>
            <select
              id="tk-freq"
              className="m3-input"
              value={freq}
              onChange={(e) => setFreq(e.target.value as TaskFrequency)}
            >
              <option value="یک‌بار">یک‌بار</option>
              <option value="روزانه">روزانه (ریست خودکار)</option>
              <option value="هفتگی">هفتگی (ریست خودکار)</option>
              <option value="ماهانه">ماهانه (ریست خودکار)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="tk-priority"
              className="text-xs font-semibold block"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              اولویت
            </label>
            <select
              id="tk-priority"
              className="m3-input"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
            >
              <option value="normal">عادی</option>
              <option value="high">فوری</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="tk-tags"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            تگ‌ها (اختیاری)
          </label>
          <input
            id="tk-tags"
            type="text"
            className="m3-input"
            placeholder="آخرهفته، مهم، آشپزخانه"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="tk-note"
            className="text-xs font-semibold block"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            یادداشت
          </label>
          <textarea
            id="tk-note"
            rows={2}
            className="m3-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button type="submit" className="m3-btn-primary flex-1">
            {editTask ? 'ذخیره تغییرات' : 'ثبت کار'}
          </button>
          <button type="button" onClick={onClose} className="m3-btn-tonal">
            انصراف
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
