import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Pencil, Plus, Settings2, Trash2 } from 'lucide-react';
import { CategoryIcon } from '../data/assets';
import type { CategoryItem, CategoryListKey } from '../types/app';

interface CategoryComboboxProps {
  id: string;
  label: string;
  listKey: CategoryListKey;
  categories: CategoryItem[];
  value: string;
  onChange: (name: string) => void;
  onQuickCreate: (name: string) => void;
  onOpenManager: (listKey: CategoryListKey, editCatName?: string) => void;
  onDeleteCategory: (listKey: CategoryListKey, name: string) => void;
}

export const CategoryCombobox: React.FC<CategoryComboboxProps> = ({
  id,
  label,
  listKey,
  categories,
  value,
  onChange,
  onQuickCreate,
  onOpenManager,
  onDeleteCategory,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const trimmed = value.trim();
  const filtered = trimmed
    ? categories.filter((c) => c.name.toLowerCase().includes(trimmed.toLowerCase()))
    : categories;
  const exactExists = categories.some((c) => c.name === trimmed);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="text-xs font-semibold"
          style={{ color: 'var(--md-on-surface-variant)' }}
        >
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onOpenManager(listKey);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'var(--md-primary)' }}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>مدیریت دسته‌ها</span>
        </button>
      </div>

      <div className="relative">
        <input
          id={id}
          type="text"
          className="m3-input pl-10"
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          placeholder="جستجو یا تایپ دسته جدید..."
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
          style={{ color: 'var(--md-on-surface-variant)' }}
          aria-label="باز کردن فهرست دسته‌بندی‌ها"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div
          className="absolute z-40 mt-1.5 w-full max-h-56 overflow-y-auto rounded-2xl p-1.5 space-y-1"
          style={{
            backgroundColor: 'var(--md-card)',
            border: '1px solid var(--md-outline-variant)',
            boxShadow: 'var(--md-shadow-2)',
          }}
        >
          {filtered.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center justify-between gap-2 rounded-xl px-2 py-1 transition-colors"
              style={{
                backgroundColor:
                  cat.name === value ? 'var(--md-primary-container)' : 'transparent',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  onChange(cat.name);
                  setOpen(false);
                }}
                className="flex-1 min-w-0 min-h-[38px] flex items-center gap-2.5 text-right cursor-pointer"
                style={{
                  color:
                    cat.name === value
                      ? 'var(--md-on-primary-container)'
                      : 'var(--md-on-surface)',
                }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'var(--md-surface-container)',
                    color: 'var(--md-primary)',
                  }}
                >
                  <CategoryIcon name={cat.icon} className="w-4 h-4" />
                </span>
                <span className="text-sm font-medium truncate">{cat.name}</span>
              </button>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onOpenManager(listKey, cat.name);
                  }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ color: 'var(--md-on-surface-variant)' }}
                  aria-label={`ویرایش دسته ${cat.name}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCategory(listKey, cat.name)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ color: 'var(--md-danger)' }}
                  aria-label={`حذف دسته ${cat.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {trimmed && !exactExists && (
            <button
              type="button"
              onClick={() => {
                onQuickCreate(trimmed);
                onChange(trimmed);
                setOpen(false);
              }}
              className="w-full min-h-[42px] flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--md-primary-container)',
                color: 'var(--md-on-primary-container)',
              }}
            >
              <span className="flex items-center gap-1.5 truncate">
                <Plus className="w-4 h-4 shrink-0" />
                ساخت سریع دسته «{trimmed}»
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
