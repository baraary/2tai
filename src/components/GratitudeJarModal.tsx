import React, { useMemo, useState } from 'react';
import {
  Clock,
  Lock,
  Plus,
  Shuffle,
  Sparkles,
  Trash2,
  Unlock,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { CoupleStore } from '../hooks/useCoupleStore';
import type { MemoryNote } from '../types/app';
import { launchPastelConfetti, triggerHaptic } from '../utils/celebration';
import {
  daysBetweenJalaliAndToday,
  formatJalaliFull,
  formatRelativeDaysFa,
  getTodayJalaliKey,
  makeDateKey,
  toFa,
} from '../utils/jalali';
import { playSound } from '../utils/soundEffects';
import { BottomSheet } from './BottomSheet';
import { JalaliDateFields } from './JalaliDateFields';
import { PartnerAvatar } from './PartnerAvatar';

interface GratitudeJarModalProps {
  open: boolean;
  onClose: () => void;
  store: CoupleStore;
  initialView?: 'jar' | 'add';
}

const MEMORY_EMOJIS = ['✨', '🤍', '🌸', '☕', '🌙', '✈️', '🎵', '🍰', '🌿', '💌'];

export function isMemorySealed(m: MemoryNote): boolean {
  if (!m.unlockDateKey) return false;
  const rem = daysBetweenJalaliAndToday(m.unlockDateKey);
  return rem !== null && rem > 0;
}

export const GratitudeJarModal: React.FC<GratitudeJarModalProps> = ({
  open,
  onClose,
  store,
  initialView = 'jar',
}) => {
  const { state, todayJalali } = store;
  const [showComposer, setShowComposer] = useState(initialView === 'add');
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'sealed'>('all');
  const [drawnNote, setDrawnNote] = useState<MemoryNote | null>(null);

  // Composer form
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [isCapsule, setIsCapsule] = useState(false);
  const [unlockDateKey, setUnlockDateKey] = useState(() => {
    const [y, m, d] = todayJalali;
    const nextM = m === 12 ? 1 : m + 1;
    const nextY = m === 12 ? y + 1 : y;
    return makeDateKey(nextY, nextM, Math.min(d, 29));
  });

  const unlockedMemories = useMemo(
    () => state.memories.filter((m) => !isMemorySealed(m)),
    [state.memories]
  );

  const sealedMemories = useMemo(
    () => state.memories.filter((m) => isMemorySealed(m)),
    [state.memories]
  );

  const visibleList = useMemo(() => {
    if (filter === 'unlocked') return unlockedMemories;
    if (filter === 'sealed') return sealedMemories;
    return state.memories;
  }, [filter, sealedMemories, state.memories, unlockedMemories]);

  const handleDrawRandom = () => {
    if (unlockedMemories.length === 0) {
      store.showToast('هنوز خاطره بازشده‌ای در شیشه نیست؛ اولین یادداشت رو بنداز ✨');
      return;
    }
    const pool =
      unlockedMemories.length > 1 && drawnNote
        ? unlockedMemories.filter((m) => m.id !== drawnNote.id)
        : unlockedMemories;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setDrawnNote(pick);
    triggerHaptic('celebrate');
    playSound('jar', state.soundEnabled);
    launchPastelConfetti('hearts');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    store.addMemoryNote({
      text: trimmed,
      emoji,
      dateKey: getTodayJalaliKey(),
      unlockDateKey: isCapsule ? unlockDateKey : null,
    });
    setText('');
    setIsCapsule(false);
    setShowComposer(false);
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="شیشه خاطرات و کپسول زمان"
      subtitle={`${toFa(unlockedMemories.length)} خاطره باز · ${toFa(sealedMemories.length)} کپسول زمان مهروموم`}
    >
      {/* Top Action Card: Pull a Random Memory or Drop a New Note */}
      <section
        className="rounded-3xl p-4 space-y-3"
        style={{
          backgroundColor: 'var(--pastel-lavender-soft)',
          border: '1px solid var(--md-outline-variant)',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--pastel-lavender)' }} />
            <span className="text-xs font-extrabold" style={{ color: 'var(--pastel-lavender)' }}>
              گنجینه لحظه‌های خوب ما
            </span>
          </div>
          <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--md-on-surface-variant)' }}>
            {toFa(state.memories.length)} یادداشت
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDrawRandom}
            className="m3-btn-primary flex-1 text-xs"
            style={{ backgroundColor: 'var(--pastel-lavender)', color: '#FFFFFF' }}
          >
            <Shuffle className="w-4 h-4" />
            <span>یه خاطره شانسی بخون</span>
          </button>
          <button
            type="button"
            onClick={() => setShowComposer((v) => !v)}
            className="m3-btn-tonal text-xs"
            style={{ backgroundColor: 'var(--md-card)' }}
          >
            <Plus className="w-4 h-4" />
            <span>{showComposer ? 'بستن فرم' : 'یادداشت جدید'}</span>
          </button>
        </div>

        {/* Drawn Random Memory Postcard Reveal */}
        <AnimatePresence mode="wait">
          {drawnNote && (
            <motion.div
              key={drawnNote.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl p-4 space-y-2.5"
              style={{
                backgroundColor: 'var(--md-card)',
                border: '1px solid var(--md-outline-variant)',
                boxShadow: 'var(--md-shadow-1)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{drawnNote.emoji}</span>
                  <PartnerAvatar
                    partner={drawnNote.author}
                    name={state.partners[drawnNote.author]}
                    avatar={state.partnerAvatars[drawnNote.author]}
                    size="xs"
                  />
                  <span className="text-xs font-bold">{state.partners[drawnNote.author]}</span>
                </div>
                <span className="text-[11px] tabular-nums" style={{ color: 'var(--md-on-surface-variant)' }}>
                  {formatJalaliFull(drawnNote.dateKey)}
                </span>
              </div>
              <p className="text-sm font-medium leading-7 whitespace-pre-wrap">
                {drawnNote.text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* New Memory / Time Capsule Composer */}
      <AnimatePresence initial={false}>
        {showComposer && (
          <motion.form
            key="jar-composer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleAdd}
            className="overflow-hidden"
          >
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{
                backgroundColor: 'var(--md-surface-low)',
                border: '1px solid var(--md-outline-variant)',
              }}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                {MEMORY_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className="w-9 h-9 rounded-xl text-base flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                    style={{
                      backgroundColor:
                        emoji === em ? 'var(--md-primary-container)' : 'var(--md-card)',
                      border:
                        emoji === em
                          ? '1.5px solid var(--md-primary)'
                          : '1px solid var(--md-outline-variant)',
                    }}
                    aria-label={`انتخاب نماد ${em}`}
                  >
                    {em}
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="jar-note-text" className="sr-only">
                  متن یادداشت قدردانی یا خاطره
                </label>
                <textarea
                  id="jar-note-text"
                  rows={3}
                  maxLength={500}
                  className="m3-input resize-none leading-7"
                  placeholder="یه لحظه قشنگ، یه تشکر از همسرت یا نامه‌ای برای آینده بنویس..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              </div>

              {/* Optional Time Capsule Lock */}
              <div
                className="rounded-xl p-3 space-y-2.5"
                style={{
                  backgroundColor: 'var(--md-card)',
                  border: '1px solid var(--md-outline-variant)',
                }}
              >
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <span className="flex items-center gap-2 text-xs font-bold">
                    <Clock className="w-4 h-4" style={{ color: 'var(--pastel-amber)' }} />
                    <span>تبدیل به کپسول زمان (مهروموم تا تاریخ آینده)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={isCapsule}
                    onChange={(e) => setIsCapsule(e.target.checked)}
                    className="w-4 h-4 accent-[var(--md-primary)] cursor-pointer"
                  />
                </label>

                {isCapsule && (
                  <div className="pt-1">
                    <JalaliDateFields
                      idPrefix="capsule-unlock"
                      label="تاریخ باز شدن کپسول زمان:"
                      value={unlockDateKey}
                      onChange={setUnlockDateKey}
                    />
                  </div>
                )}
              </div>

              <button type="submit" className="m3-btn-primary w-full text-xs">
                {isCapsule ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>مهروموم کردن در کپسول زمان</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>انداختن در شیشه خاطرات</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      {state.memories.length > 0 && (
        <div
          className="inline-grid grid-cols-3 p-1 rounded-2xl gap-1 w-full"
          style={{
            backgroundColor: 'var(--md-surface-container)',
            border: '1px solid var(--md-outline-variant)',
          }}
        >
          {(
            [
              { id: 'all', label: `همه (${toFa(state.memories.length)})` },
              { id: 'unlocked', label: `بازشده (${toFa(unlockedMemories.length)})` },
              { id: 'sealed', label: `کپسول قفل (${toFa(sealedMemories.length)})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className="min-h-[36px] rounded-xl text-xs font-bold cursor-pointer transition-colors tabular-nums"
              style={{
                backgroundColor: filter === tab.id ? 'var(--md-card)' : 'transparent',
                color: filter === tab.id ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Memories List */}
      {visibleList.length === 0 ? (
        <p
          className="text-sm py-8 text-center rounded-2xl"
          style={{
            backgroundColor: 'var(--md-surface-low)',
            color: 'var(--md-on-surface-variant)',
          }}
        >
          {state.memories.length === 0
            ? 'شیشه خاطرات هنوز خالی است! اولین لحظه قشنگ یا یادداشت قدردانی را اضافه کنید.'
            : 'موردی در این بخش وجود ندارد.'}
        </p>
      ) : (
        <div className="space-y-2.5">
          {visibleList.map((m) => {
            const sealed = isMemorySealed(m);
            const remDays = m.unlockDateKey ? daysBetweenJalaliAndToday(m.unlockDateKey) : null;
            return (
              <article
                key={m.id}
                className="rounded-2xl p-3.5 space-y-2"
                style={{
                  backgroundColor: sealed ? 'var(--pastel-amber-soft)' : 'var(--md-surface-low)',
                  border: '1px solid var(--md-outline-variant)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base leading-none">{sealed ? '🔒' : m.emoji}</span>
                    <PartnerAvatar
                      partner={m.author}
                      name={state.partners[m.author]}
                      avatar={state.partnerAvatars[m.author]}
                      size="xs"
                    />
                    <span className="text-xs font-bold truncate">{state.partners[m.author]}</span>
                    <span aria-hidden="true" style={{ color: 'var(--md-on-surface-variant)' }}>
                      ·
                    </span>
                    <span
                      className="text-[11px] tabular-nums truncate"
                      style={{ color: 'var(--md-on-surface-variant)' }}
                    >
                      {formatJalaliFull(m.dateKey)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => store.deleteMemoryNote(m.id)}
                    className="m3-icon-btn !min-w-[34px] !min-h-[34px]"
                    style={{ color: 'var(--md-danger)' }}
                    aria-label="حذف یادداشت"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {sealed ? (
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <p
                      className="text-xs font-bold flex items-center gap-1.5"
                      style={{ color: 'var(--pastel-amber)' }}
                    >
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        کپسول زمان مهروموم — باز شدن {remDays !== null ? formatRelativeDaysFa(remDays) : ''} ({m.unlockDateKey ? formatJalaliFull(m.unlockDateKey) : ''})
                      </span>
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-6 whitespace-pre-wrap">{m.text}</p>
                    {m.unlockDateKey && (
                      <div
                        className="text-[11px] font-semibold flex items-center gap-1"
                        style={{ color: 'var(--md-success)' }}
                      >
                        <Unlock className="w-3 h-3" />
                        <span>کپسول زمان بازشده در {formatJalaliFull(m.unlockDateKey)}</span>
                      </div>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </BottomSheet>
  );
};
