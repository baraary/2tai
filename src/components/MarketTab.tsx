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
  Settings2,
  ShoppingCart,
  Store,
  Trash2,
} from 'lucide-react';
import { CategoryIcon } from '../data/assets';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { CategoryListKey, MarketSubTab, PantryItem, ShoppingItem } from '../types/app';
import { daysBetweenJalaliAndToday, formatJalaliFull, formatRelativeDaysFa, toFa } from '../utils/jalali';
import { PartnerAvatar } from './PartnerAvatar';

interface MarketTabProps {
  store: CoupleStore;
  subTab: MarketSubTab;
  onChangeSubTab: (sub: MarketSubTab) => void;
  onOpenMarketModal: (params?: {
    target?: MarketSubTab;
    editItem?: ShoppingItem | PantryItem;
    quickTitle?: string;
    defaultCat?: string;
  }) => void;
  onOpenCategoryManager: (listKey: CategoryListKey) => void;
  onOpenInStoreMode: () => void;
}

export const MarketTab: React.FC<MarketTabProps> = ({
  store,
  subTab,
  onChangeSubTab,
  onOpenMarketModal,
  onOpenCategoryManager,
  onOpenInStoreMode,
}) => {
  const { state } = store;
  const [quickTitle, setQuickTitle] = useState('');
  const [activeCat, setActiveCat] = useState('همه');
  const [activeTag, setActiveTag] = useState('همه');
  const [reorderMode, setReorderMode] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const pendingShopCount = state.shopping.filter((i) => !i.done).length;
  const doneShopCount = state.shopping.length - pendingShopCount;

  const allTags = useMemo(() => {
    const set = new Set<string>();
    const source = subTab === 'shopping' ? state.shopping : state.pantry;
    source.forEach((item) => item.tags.forEach((tg) => set.add(tg)));
    return Array.from(set);
  }, [state.pantry, state.shopping, subTab]);

  const queryLower = quickTitle.trim().toLowerCase();

  const filteredShopping = useMemo(() => {
    return state.shopping
      .filter((item) => {
        if (activeCat !== 'همه' && item.category !== activeCat) return false;
        if (activeTag !== 'همه' && !item.tags.includes(activeTag)) return false;
        if (
          queryLower &&
          !item.title.toLowerCase().includes(queryLower) &&
          !(item.note || '').toLowerCase().includes(queryLower)
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
  }, [state.shopping, activeCat, activeTag, queryLower]);

  const filteredPantry = useMemo(() => {
    const order = { empty: 0, low: 1, ok: 2 };
    return state.pantry
      .filter((item) => {
        if (activeCat !== 'همه' && item.category !== activeCat) return false;
        if (activeTag !== 'همه' && !item.tags.includes(activeTag)) return false;
        if (
          queryLower &&
          !item.title.toLowerCase().includes(queryLower) &&
          !(item.note || '').toLowerCase().includes(queryLower)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => order[a.status] - order[b.status]);
  }, [state.pantry, activeCat, activeTag, queryLower]);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) {
      onOpenMarketModal({
        target: subTab,
        defaultCat: activeCat !== 'همه' ? activeCat : undefined,
      });
      return;
    }
    store.saveMarketItem({
      target: subTab,
      title: trimmed,
      qty: '',
      category:
        activeCat !== 'همه'
          ? activeCat
          : state.marketCategories[0]?.name || 'سوپرمارکت و لبنیات',
      status: 'ok',
      purchaseDate: null,
      expiryDate: null,
      priority: 'normal',
      tags: [],
      note: '',
    });
    setQuickTitle('');
  };

  return (
    <div className="space-y-5">
      {/* Header + Segmented Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-black">خرید و انبار خانه</h1>
          {subTab === 'shopping' && (
            <button
              type="button"
              onClick={onOpenInStoreMode}
              className="min-h-[40px] px-3.5 rounded-2xl text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95 shrink-0"
              style={{
                backgroundColor: 'var(--pastel-mint-soft)',
                color: 'var(--pastel-mint)',
                border: '1px solid var(--md-outline-variant)',
              }}
            >
              <Store className="w-4 h-4" />
              <span>توی فروشگاه هستم</span>
            </button>
          )}
        </div>

        <div
          className="inline-grid grid-cols-2 p-1 rounded-2xl gap-1"
          style={{
            backgroundColor: 'var(--md-surface-container)',
            border: '1px solid var(--md-outline-variant)',
          }}
          role="tablist"
          aria-label="بخش خرید و انبار"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'shopping'}
            onClick={() => {
              onChangeSubTab('shopping');
              setActiveTag('همه');
            }}
            className="min-h-[40px] px-4 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer tabular-nums"
            style={{
              backgroundColor: subTab === 'shopping' ? 'var(--md-card)' : 'transparent',
              color:
                subTab === 'shopping' ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
            }}
          >
            لیست خرید ({toFa(pendingShopCount)})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'pantry'}
            onClick={() => {
              onChangeSubTab('pantry');
              setActiveTag('همه');
            }}
            className="min-h-[40px] px-4 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer tabular-nums"
            style={{
              backgroundColor: subTab === 'pantry' ? 'var(--md-card)' : 'transparent',
              color: subTab === 'pantry' ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
            }}
          >
            انبار خانه ({toFa(state.pantry.length)})
          </button>
        </div>
      </div>

      {/* Quick Add / Search Bar */}
      <form onSubmit={handleQuickAddSubmit} className="flex items-center gap-2">
        <label htmlFor="market-quick-input" className="sr-only">
          جستجو یا افزودن سریع کالا
        </label>
        <input
          id="market-quick-input"
          type="text"
          className="m3-input"
          placeholder={
            subTab === 'shopping'
              ? 'نام کالا را بنویسید و Enter بزنید (یا جستجو)...'
              : 'افزودن سریع به انبار خانه یا جستجو...'
          }
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
        />
        <button type="submit" className="m3-btn-primary shrink-0 px-4">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">افزودن سریع</span>
        </button>
        <button
          type="button"
          onClick={() =>
            onOpenMarketModal({
              target: subTab,
              quickTitle: quickTitle.trim(),
              defaultCat: activeCat !== 'همه' ? activeCat : undefined,
            })
          }
          className="m3-btn-tonal shrink-0 px-3.5"
          title="افزودن با جزئیات کامل (تاریخ انقضا، مقدار، تگ)"
        >
          جزئیات
        </button>
      </form>

      {/* Interactive Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setActiveCat('همه')}
          className="min-h-[38px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          style={{
            backgroundColor:
              activeCat === 'همه' ? 'var(--md-primary)' : 'var(--md-surface-container)',
            color: activeCat === 'همه' ? 'var(--md-on-primary)' : 'var(--md-on-surface)',
          }}
        >
          همه
        </button>
        {state.marketCategories.map((cat) => {
          const active = activeCat === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveCat(cat.name)}
              className="min-h-[38px] px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
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
          onClick={() => onOpenCategoryManager('marketCategories')}
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

      {/* Tag Filters */}
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

      {/* Shopping Sub-View */}
      {subTab === 'shopping' ? (
        <section className="m3-surface-card rounded-3xl p-4 md:p-5 space-y-3">
          {(doneShopCount > 0 || filteredShopping.length > 1) && (
            <div
              className="flex items-center justify-between gap-2 pb-2 border-b"
              style={{ borderColor: 'var(--md-outline-variant)' }}
            >
              <div className="flex items-center gap-2">
                {filteredShopping.length > 1 && (
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
                {doneShopCount > 0 && (
                  <span
                    className="text-xs font-semibold tabular-nums"
                    style={{ color: 'var(--md-on-surface-variant)' }}
                  >
                    {toFa(doneShopCount)} خریده‌شده
                  </span>
                )}
              </div>
              {doneShopCount > 0 && (
                <button
                  type="button"
                  onClick={store.clearDoneShopping}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                  style={{ color: 'var(--md-danger)' }}
                >
                  پاکسازی خریده‌شده‌ها
                </button>
              )}
            </div>
          )}

          {filteredShopping.length === 0 ? (
            <p
              className="text-sm py-8 text-center rounded-2xl"
              style={{
                backgroundColor: 'var(--md-surface-low)',
                color: 'var(--md-on-surface-variant)',
              }}
            >
              لیست خرید در این فیلتر خالی است.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--md-outline-variant)' }}>
              {filteredShopping.map((item, idx) => {
                const isDragOver = dragOverId === item.id && dragId !== item.id;
                const prevItem = idx > 0 ? filteredShopping[idx - 1] : null;
                const nextItem =
                  idx < filteredShopping.length - 1 ? filteredShopping[idx + 1] : null;
                return (
                  <div
                    key={item.id}
                    draggable={!item.done}
                    onDragStart={(e) => {
                      setDragId(item.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      if (!dragId || dragId === item.id) return;
                      e.preventDefault();
                      setDragOverId(item.id);
                    }}
                    onDragLeave={() => {
                      if (dragOverId === item.id) setDragOverId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragId && dragId !== item.id) {
                        store.reorderShopping(dragId, item.id);
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
                    {!item.done && (
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
                      onClick={() => store.toggleShoppingDone(item.id)}
                      className="flex-1 min-w-0 min-h-[44px] flex items-center gap-3 text-right cursor-pointer"
                    >
                      <span
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${item.done ? 'check-pop' : ''}`}
                        style={{
                          borderColor: item.done ? 'var(--md-primary)' : 'var(--md-outline)',
                          backgroundColor: item.done ? 'var(--md-primary)' : 'transparent',
                          color: 'var(--md-on-primary)',
                        }}
                      >
                        {item.done && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`text-sm font-bold truncate flex items-center gap-1.5 strike-smooth ${item.done ? 'line-through opacity-55' : ''}`}
                        >
                          {item.pinned && (
                            <Pin
                              className="w-3 h-3 shrink-0"
                              style={{ color: 'var(--md-primary)' }}
                            />
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>
                        <div
                          className="text-xs flex items-center gap-1.5 flex-wrap mt-0.5"
                          style={{ color: 'var(--md-on-surface-variant)' }}
                        >
                          <span>{item.category}</span>
                          {item.qty && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{item.qty}</span>
                            </>
                          )}
                          {item.priority === 'high' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span style={{ color: 'var(--md-danger)', fontWeight: 700 }}>فوری</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            <PartnerAvatar
                              partner={item.addedBy}
                              name={state.partners[item.addedBy]}
                              avatar={state.partnerAvatars[item.addedBy]}
                              size="xs"
                            />
                            <span>{state.partners[item.addedBy]}</span>
                          </span>
                          {item.tags.map((tg) => (
                            <React.Fragment key={tg}>
                              <span aria-hidden="true">·</span>
                              <span>#{tg}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {reorderMode ? (
                        <>
                          <button
                            type="button"
                            disabled={!prevItem}
                            onClick={() => prevItem && store.reorderShopping(item.id, prevItem.id)}
                            className="m3-icon-btn disabled:opacity-30"
                            aria-label={`انتقال ${item.title} به بالا`}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={!nextItem}
                            onClick={() => nextItem && store.reorderShopping(item.id, nextItem.id)}
                            className="m3-icon-btn disabled:opacity-30"
                            aria-label={`انتقال ${item.title} به پایین`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => store.toggleShoppingPin(item.id)}
                            className="m3-icon-btn"
                            style={item.pinned ? { color: 'var(--md-primary)' } : undefined}
                            aria-label={item.pinned ? `برداشتن سنجاق ${item.title}` : `سنجاق کردن ${item.title}`}
                            title={item.pinned ? 'برداشتن سنجاق' : 'سنجاق به بالا'}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenMarketModal({ target: 'shopping', editItem: item })}
                            className="m3-icon-btn"
                            aria-label={`ویرایش ${item.title}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => store.deleteShoppingItem(item.id)}
                            className="m3-icon-btn"
                            style={{ color: 'var(--md-danger)' }}
                            aria-label={`حذف ${item.title}`}
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
      ) : (
        /* Pantry Sub-View */
        <section className="m3-surface-card rounded-3xl p-4 md:p-5">
          {filteredPantry.length === 0 ? (
            <p
              className="text-sm py-8 text-center rounded-2xl"
              style={{
                backgroundColor: 'var(--md-surface-low)',
                color: 'var(--md-on-surface-variant)',
              }}
            >
              کالایی در انبار خانه ثبت نشده است.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--md-outline-variant)' }}>
              {filteredPantry.map((item) => {
                const expDays = item.expiryDate
                  ? daysBetweenJalaliAndToday(item.expiryDate)
                  : null;
                const statusLabel =
                  item.status === 'ok'
                    ? 'موجود'
                    : item.status === 'low'
                      ? 'رو به اتمام'
                      : 'تمام شده';
                const statusColor =
                  item.status === 'ok'
                    ? 'var(--md-success)'
                    : item.status === 'low'
                      ? 'var(--md-warning)'
                      : 'var(--md-danger)';

                return (
                  <div key={item.id} className="flex items-center justify-between gap-2 py-2.5">
                    <button
                      type="button"
                      onClick={() => store.cyclePantryStatus(item.id)}
                      className="flex-1 min-w-0 min-h-[44px] text-right cursor-pointer"
                      title="برای تغییر وضعیت (موجود / رو به اتمام / تمام شده) لمس کنید"
                    >
                      <div className="text-sm font-bold truncate">{item.title}</div>
                      <div
                        className="text-xs flex items-center gap-1.5 flex-wrap mt-0.5 tabular-nums"
                        style={{ color: 'var(--md-on-surface-variant)' }}
                      >
                        <span style={{ color: statusColor, fontWeight: 700 }}>{statusLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.category}</span>
                        {item.qty && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.qty}</span>
                          </>
                        )}
                        {item.purchaseDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>خرید: {formatJalaliFull(item.purchaseDate)}</span>
                          </>
                        )}
                        {expDays !== null && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span
                              style={{
                                color:
                                  expDays <= 3
                                    ? 'var(--md-danger)'
                                    : expDays <= 7
                                      ? 'var(--md-warning)'
                                      : 'var(--md-on-surface-variant)',
                                fontWeight: expDays <= 7 ? 700 : 400,
                              }}
                            >
                              {expDays < 0
                                ? 'منقضی شده'
                                : expDays === 0
                                  ? 'انقضا امروز'
                                  : `انقضا ${formatRelativeDaysFa(expDays)}`}
                            </span>
                          </>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {item.status !== 'ok' && (
                        <button
                          type="button"
                          onClick={() => store.movePantryToShopping(item.id)}
                          className="m3-icon-btn"
                          style={{ color: 'var(--md-primary)' }}
                          aria-label={`افزودن ${item.title} به لیست خرید`}
                          title="ارسال به لیست خرید"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenMarketModal({ target: 'pantry', editItem: item })}
                        className="m3-icon-btn"
                        aria-label={`ویرایش ${item.title}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => store.deletePantryItem(item.id)}
                        className="m3-icon-btn"
                        style={{ color: 'var(--md-danger)' }}
                        aria-label={`حذف ${item.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
