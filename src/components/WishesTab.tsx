import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Lock,
  Pencil,
  Pin,
  Plus,
  Settings2,
  Trash2,
} from 'lucide-react';
import { CategoryIcon } from '../data/assets';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { CategoryListKey, WishItem } from '../types/app';
import { PartnerAvatar } from './PartnerAvatar';

interface WishesTabProps {
  store: CoupleStore;
  onOpenWishModal: (editWish?: WishItem, quickTitle?: string, defaultCat?: string) => void;
  onOpenCategoryManager: (listKey: CategoryListKey) => void;
}

export const WishesTab: React.FC<WishesTabProps> = ({
  store,
  onOpenWishModal,
  onOpenCategoryManager,
}) => {
  const { state } = store;
  const [quickTitle, setQuickTitle] = useState('');
  const [activeCat, setActiveCat] = useState('همه');
  const [activeTag, setActiveTag] = useState('همه');
  const [reorderMode, setReorderMode] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const visibleWishes = useMemo(
    () => state.wishes.filter((w) => !w.isPrivate || w.addedBy === state.myAccount),
    [state.wishes, state.myAccount]
  );

  const allTags = useMemo(() => {
    const s = new Set<string>();
    visibleWishes.forEach((w) => w.tags.forEach((tg) => s.add(tg)));
    return Array.from(s);
  }, [visibleWishes]);

  const queryLower = quickTitle.trim().toLowerCase();

  const filtered = useMemo(() => {
    return visibleWishes
      .filter((w) => {
        if (activeCat !== 'همه' && w.category !== activeCat) return false;
        if (activeTag !== 'همه' && !w.tags.includes(activeTag)) return false;
        if (
          queryLower &&
          !w.title.toLowerCase().includes(queryLower) &&
          !(w.note || '').toLowerCase().includes(queryLower)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.done !== b.done) return Number(a.done) - Number(b.done);
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        const oa = a.order ?? Number.MAX_SAFE_INTEGER;
        const ob = b.order ?? Number.MAX_SAFE_INTEGER;
        if (oa !== ob) return oa - ob;
        return b.updatedAt - a.updatedAt;
      });
  }, [visibleWishes, activeCat, activeTag, queryLower]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) {
      onOpenWishModal(undefined, '', activeCat !== 'همه' ? activeCat : undefined);
      return;
    }
    store.saveWish({
      title: trimmed,
      category: activeCat !== 'همه' ? activeCat : state.wishCategories[0]?.name || 'سفر و طبیعت‌گردی',
      priority: 'high',
      tags: [],
      isPrivate: false,
      localOnly: false,
      note: '',
    });
    setQuickTitle('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black">دفترچه آرزوها و ایده‌ها</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--md-on-surface-variant)' }}>
            سفرها، فیلم‌ها، کافه‌ها و ایده‌های هدیه سورپرایزی (با امکان ذخیره کاملاً محلی)
          </p>
        </div>
      </div>

      <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
        <label htmlFor="wish-quick-input" className="sr-only">
          افزودن یا جستجوی آرزو
        </label>
        <input
          id="wish-quick-input"
          type="text"
          className="m3-input"
          placeholder="آرزو یا ایده جدید را بنویسید و Enter بزنید..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
        />
        <button type="submit" className="m3-btn-primary shrink-0 px-4">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">ثبت</span>
        </button>
        <button
          type="button"
          onClick={() =>
            onOpenWishModal(
              undefined,
              quickTitle.trim(),
              activeCat !== 'همه' ? activeCat : undefined
            )
          }
          className="m3-btn-tonal shrink-0 px-3.5"
        >
          جزئیات
        </button>
      </form>

      {/* Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setActiveCat('همه')}
          className="min-h-[38px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
          style={{
            backgroundColor:
              activeCat === 'همه' ? 'var(--md-primary)' : 'var(--md-surface-container)',
            color: activeCat === 'همه' ? 'var(--md-on-primary)' : 'var(--md-on-surface)',
          }}
        >
          همه
        </button>
        {state.wishCategories.map((cat) => {
          const active = activeCat === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveCat(cat.name)}
              className="min-h-[38px] px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              style={{
                backgroundColor: active ? 'var(--md-primary)' : 'var(--md-surface-container)',
                color: active ? 'var(--md-on-primary)' : 'var(--md-on-surface)',
              }}
            >
              <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onOpenCategoryManager('wishCategories')}
          className="min-h-[38px] px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          style={{
            border: '1px dashed var(--md-outline)',
            color: 'var(--md-on-surface-variant)',
          }}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>دسته‌ها</span>
        </button>
      </div>

      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['همه', ...allTags].map((tg) => (
            <button
              key={tg}
              type="button"
              onClick={() => setActiveTag(tg)}
              className="min-h-[34px] px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              style={{
                backgroundColor:
                  activeTag === tg ? 'var(--md-primary-container)' : 'var(--md-surface-low)',
                color:
                  activeTag === tg
                    ? 'var(--md-on-primary-container)'
                    : 'var(--md-on-surface-variant)',
              }}
            >
              {tg === 'همه' ? 'همه تگ‌ها' : `#${tg}`}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <section className="m3-surface-card rounded-3xl p-4 md:p-5 space-y-3">
        {filtered.length > 1 && (
          <div
            className="flex items-center justify-between gap-2 pb-2 border-b"
            style={{ borderColor: 'var(--md-outline-variant)' }}
          >
            <button
              type="button"
              onClick={() => setReorderMode((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors"
              style={{
                backgroundColor: reorderMode
                  ? 'var(--md-primary-container)'
                  : 'var(--md-surface-low)',
                color: reorderMode
                  ? 'var(--md-on-primary-container)'
                  : 'var(--md-on-surface-variant)',
              }}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{reorderMode ? 'پایان مرتب‌سازی' : 'مرتب‌سازی'}</span>
            </button>
            <span className="text-[11px]" style={{ color: 'var(--md-on-surface-variant)' }}>
              تیک زدن آرزو جشن کانفتی دارد ✨
            </span>
          </div>
        )}

        {filtered.length === 0 ? (
          <p
            className="text-sm py-8 text-center rounded-2xl"
            style={{
              backgroundColor: 'var(--md-surface-low)',
              color: 'var(--md-on-surface-variant)',
            }}
          >
            آرزویی در این فیلتر ثبت نشده است.
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--md-outline-variant)' }}>
            {filtered.map((w, idx) => {
              const isDragOver = dragOverId === w.id && dragId !== w.id;
              const prevWish = idx > 0 ? filtered[idx - 1] : null;
              const nextWish = idx < filtered.length - 1 ? filtered[idx + 1] : null;
              return (
                <div
                  key={w.id}
                  draggable={!w.done}
                  onDragStart={(e) => {
                    setDragId(w.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    if (!dragId || dragId === w.id) return;
                    e.preventDefault();
                    setDragOverId(w.id);
                  }}
                  onDragLeave={() => {
                    if (dragOverId === w.id) setDragOverId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragId && dragId !== w.id) {
                      store.reorderWishes(dragId, w.id);
                    }
                    setDragId(null);
                    setDragOverId(null);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setDragOverId(null);
                  }}
                  className={`flex items-center justify-between gap-2 py-2.5 transition-colors ${isDragOver ? 'drop-target-ring px-2' : ''}`}
                >
                  {!w.done && (
                    <span
                      className="hidden sm:inline-flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0 opacity-45 hover:opacity-90"
                      style={{ color: 'var(--md-on-surface-variant)' }}
                      title="برای تغییر ترتیب بکشید"
                      aria-hidden="true"
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => store.toggleWishDone(w.id)}
                    className="flex-1 min-w-0 min-h-[44px] flex items-center gap-3 text-right cursor-pointer"
                  >
                    <span
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${w.done ? 'check-pop' : ''}`}
                      style={{
                        borderColor: w.done ? 'var(--md-primary)' : 'var(--md-outline)',
                        backgroundColor: w.done ? 'var(--md-primary)' : 'transparent',
                        color: 'var(--md-on-primary)',
                      }}
                    >
                      {w.done && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-bold truncate flex items-center gap-1.5 strike-smooth ${w.done ? 'line-through opacity-55' : ''}`}
                      >
                        {w.pinned && (
                          <Pin className="w-3 h-3 shrink-0" style={{ color: 'var(--md-primary)' }} />
                        )}
                        <span className="truncate">{w.title}</span>
                        {w.localOnly && (
                          <Lock
                            className="w-3.5 h-3.5 shrink-0"
                            style={{ color: 'var(--md-primary)' }}
                          />
                        )}
                      </div>
                      <div
                        className="text-xs flex items-center gap-1.5 flex-wrap mt-0.5"
                        style={{ color: 'var(--md-on-surface-variant)' }}
                      >
                        <span>{w.category}</span>
                        {w.priority === 'high' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span style={{ color: 'var(--md-primary)', fontWeight: 700 }}>ویژه</span>
                          </>
                        )}
                        {w.isPrivate ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>
                              {w.localOnly
                                ? 'فقط روی این گوشی (بدون ارسال به ابر)'
                                : `خصوصی (${state.partners[w.addedBy]})`}
                            </span>
                          </>
                        ) : (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1">
                              <PartnerAvatar
                                partner={w.addedBy}
                                name={state.partners[w.addedBy]}
                                avatar={state.partnerAvatars[w.addedBy]}
                                size="xs"
                              />
                              <span>{state.partners[w.addedBy]}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-0.5 shrink-0">
                    {reorderMode ? (
                      <>
                        <button
                          type="button"
                          disabled={!prevWish}
                          onClick={() => prevWish && store.reorderWishes(w.id, prevWish.id)}
                          className="m3-icon-btn disabled:opacity-30"
                          aria-label={`انتقال ${w.title} به بالا`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={!nextWish}
                          onClick={() => nextWish && store.reorderWishes(w.id, nextWish.id)}
                          className="m3-icon-btn disabled:opacity-30"
                          aria-label={`انتقال ${w.title} به پایین`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => store.toggleWishPin(w.id)}
                          className="m3-icon-btn"
                          style={w.pinned ? { color: 'var(--md-primary)' } : undefined}
                          aria-label={w.pinned ? `برداشتن سنجاق ${w.title}` : `سنجاق کردن ${w.title}`}
                          title={w.pinned ? 'برداشتن سنجاق' : 'سنجاق به بالا'}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenWishModal(w)}
                          className="m3-icon-btn"
                          aria-label={`ویرایش ${w.title}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => store.deleteWish(w.id)}
                          className="m3-icon-btn"
                          style={{ color: 'var(--md-danger)' }}
                          aria-label={`حذف ${w.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
