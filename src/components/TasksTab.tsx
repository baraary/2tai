import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Pin,
  Plus,
  Repeat,
  Settings2,
  Trash2,
} from 'lucide-react';
import { CategoryIcon } from '../data/assets';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { CategoryListKey, HomeTask, PartnerTarget } from '../types/app';
import { toFa } from '../utils/jalali';
import { PartnerAvatar } from './PartnerAvatar';

interface TasksTabProps {
  store: CoupleStore;
  onOpenTaskModal: (editTask?: HomeTask, quickTitle?: string, defaultCat?: string) => void;
  onOpenCategoryManager: (listKey: CategoryListKey) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  store,
  onOpenTaskModal,
  onOpenCategoryManager,
}) => {
  const { state } = store;
  const [quickTitle, setQuickTitle] = useState('');
  const [activeCat, setActiveCat] = useState('همه');
  const [activeTag, setActiveTag] = useState('همه');
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | PartnerTarget>('all');
  const [reorderMode, setReorderMode] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    state.tasks.forEach((t) => t.tags.forEach((tg) => s.add(tg)));
    return Array.from(s);
  }, [state.tasks]);

  const queryLower = quickTitle.trim().toLowerCase();

  const filtered = useMemo(() => {
    return state.tasks
      .filter((t) => {
        if (activeCat !== 'همه' && t.category !== activeCat) return false;
        if (activeTag !== 'همه' && !t.tags.includes(activeTag)) return false;
        if (assigneeFilter !== 'all' && t.assignee !== assigneeFilter) return false;
        if (
          queryLower &&
          !t.title.toLowerCase().includes(queryLower) &&
          !(t.note || '').toLowerCase().includes(queryLower)
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
  }, [state.tasks, activeCat, activeTag, assigneeFilter, queryLower]);

  const stats = useMemo(() => {
    const pending = state.tasks.filter((t) => !t.done);
    return {
      total: pending.length,
      p1: pending.filter((t) => t.assignee === 'p1').length,
      p2: pending.filter((t) => t.assignee === 'p2').length,
      both: pending.filter((t) => t.assignee === 'both').length,
      completedOneTime: state.tasks.filter((t) => t.done && t.freq === 'یک‌بار').length,
    };
  }, [state.tasks]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) {
      onOpenTaskModal(undefined, '', activeCat !== 'همه' ? activeCat : undefined);
      return;
    }
    store.saveTask({
      title: trimmed,
      category: activeCat !== 'همه' ? activeCat : state.taskCategories[0]?.name || 'کارهای منزل',
      assignee: assigneeFilter === 'all' ? 'both' : assigneeFilter,
      freq: 'یک‌بار',
      priority: 'normal',
      tags: [],
      note: '',
    });
    setQuickTitle('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black">کارهای منزل</h1>
          <p className="text-xs mt-0.5 tabular-nums" style={{ color: 'var(--md-on-surface-variant)' }}>
            {toFa(stats.total)} کار باقی‌مانده · {state.partners.p1}: {toFa(stats.p1)} ·{' '}
            {state.partners.p2}: {toFa(stats.p2)} · دوتایی: {toFa(stats.both)}
          </p>
        </div>

        <div
          className="inline-flex items-center p-1 rounded-2xl gap-1 self-start"
          style={{
            backgroundColor: 'var(--md-surface-container)',
            border: '1px solid var(--md-outline-variant)',
          }}
        >
          {(
            [
              { id: 'all', label: 'همه' },
              { id: 'p1', label: state.partners.p1 },
              { id: 'p2', label: state.partners.p2 },
              { id: 'both', label: 'دوتایی' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setAssigneeFilter(opt.id)}
              className="min-h-[36px] px-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
              style={{
                backgroundColor: assigneeFilter === opt.id ? 'var(--md-card)' : 'transparent',
                color:
                  assigneeFilter === opt.id
                    ? 'var(--md-primary)'
                    : 'var(--md-on-surface-variant)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
        <label htmlFor="task-quick-input" className="sr-only">
          افزودن یا جستجوی کار خانه
        </label>
        <input
          id="task-quick-input"
          type="text"
          className="m3-input"
          placeholder="عنوان کار را بنویسید و Enter بزنید (یا جستجو)..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
        />
        <button type="submit" className="m3-btn-primary shrink-0 px-4">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">افزودن</span>
        </button>
        <button
          type="button"
          onClick={() =>
            onOpenTaskModal(
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

      {/* Category Filter */}
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
        {state.taskCategories.map((cat) => {
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
          onClick={() => onOpenCategoryManager('taskCategories')}
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

      {/* Task List */}
      <section className="m3-surface-card rounded-3xl p-4 md:p-5 space-y-3">
        {(stats.completedOneTime > 0 || filtered.length > 1) && (
          <div
            className="flex items-center justify-between gap-2 pb-2 border-b"
            style={{ borderColor: 'var(--md-outline-variant)' }}
          >
            <div className="flex items-center gap-2">
              {filtered.length > 1 && (
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
              )}
              {stats.completedOneTime > 0 && (
                <span
                  className="text-xs font-semibold tabular-nums"
                  style={{ color: 'var(--md-on-surface-variant)' }}
                >
                  {toFa(stats.completedOneTime)} انجام‌شده
                </span>
              )}
            </div>
            {stats.completedOneTime > 0 && (
              <button
                type="button"
                onClick={store.clearCompletedTasks}
                className="text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                style={{ color: 'var(--md-danger)' }}
              >
                پاکسازی انجام‌شده‌ها
              </button>
            )}
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
            کاری در این دسته‌بندی ثبت نشده است.
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--md-outline-variant)' }}>
            {filtered.map((t, idx) => {
              const isDragOver = dragOverId === t.id && dragId !== t.id;
              const prevTask = idx > 0 ? filtered[idx - 1] : null;
              const nextTask = idx < filtered.length - 1 ? filtered[idx + 1] : null;
              return (
                <div
                  key={t.id}
                  draggable={!t.done}
                  onDragStart={(e) => {
                    setDragId(t.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    if (!dragId || dragId === t.id) return;
                    e.preventDefault();
                    setDragOverId(t.id);
                  }}
                  onDragLeave={() => {
                    if (dragOverId === t.id) setDragOverId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragId && dragId !== t.id) {
                      store.reorderTasks(dragId, t.id);
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
                  {!t.done && (
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
                    onClick={() => store.toggleTaskDone(t.id)}
                    className="flex-1 min-w-0 min-h-[44px] flex items-center gap-3 text-right cursor-pointer"
                  >
                    <span
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${t.done ? 'check-pop' : ''}`}
                      style={{
                        borderColor: t.done ? 'var(--md-primary)' : 'var(--md-outline)',
                        backgroundColor: t.done ? 'var(--md-primary)' : 'transparent',
                        color: 'var(--md-on-primary)',
                      }}
                    >
                      {t.done && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-bold truncate flex items-center gap-1.5 strike-smooth ${t.done ? 'line-through opacity-55' : ''}`}
                      >
                        {t.pinned && (
                          <Pin className="w-3 h-3 shrink-0" style={{ color: 'var(--md-primary)' }} />
                        )}
                        <span className="truncate">{t.title}</span>
                      </div>
                      <div
                        className="text-xs flex items-center gap-1.5 flex-wrap mt-0.5"
                        style={{ color: 'var(--md-on-surface-variant)' }}
                      >
                        <span>{t.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          {t.assignee !== 'both' && (
                            <PartnerAvatar
                              partner={t.assignee}
                              name={state.partners[t.assignee]}
                              avatar={state.partnerAvatars[t.assignee]}
                              size="xs"
                            />
                          )}
                          <span>
                            {t.assignee === 'both' ? 'دوتایی' : state.partners[t.assignee]}
                          </span>
                        </span>
                        {t.freq !== 'یک‌بار' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span
                              className="inline-flex items-center gap-0.5"
                              style={{ color: 'var(--md-primary)' }}
                            >
                              <Repeat className="w-3 h-3" />
                              {t.freq}
                            </span>
                          </>
                        )}
                        {t.priority === 'high' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span style={{ color: 'var(--md-danger)', fontWeight: 700 }}>فوری</span>
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
                          disabled={!prevTask}
                          onClick={() => prevTask && store.reorderTasks(t.id, prevTask.id)}
                          className="m3-icon-btn disabled:opacity-30"
                          aria-label={`انتقال ${t.title} به بالا`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={!nextTask}
                          onClick={() => nextTask && store.reorderTasks(t.id, nextTask.id)}
                          className="m3-icon-btn disabled:opacity-30"
                          aria-label={`انتقال ${t.title} به پایین`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => store.toggleTaskPin(t.id)}
                          className="m3-icon-btn"
                          style={t.pinned ? { color: 'var(--md-primary)' } : undefined}
                          aria-label={t.pinned ? `برداشتن سنجاق ${t.title}` : `سنجاق کردن ${t.title}`}
                          title={t.pinned ? 'برداشتن سنجاق' : 'سنجاق به بالا'}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenTaskModal(t)}
                          className="m3-icon-btn"
                          aria-label={`ویرایش ${t.title}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => store.deleteTask(t.id)}
                          className="m3-icon-btn"
                          style={{ color: 'var(--md-danger)' }}
                          aria-label={`حذف ${t.title}`}
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
