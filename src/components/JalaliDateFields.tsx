import React from 'react';
import {
  getJalaliMonthDays,
  JALALI_MONTHS,
  makeDateKey,
  parseDateKey,
  toFa,
} from '../utils/jalali';

interface JalaliDateFieldsProps {
  idPrefix: string;
  value: string;
  onChange: (nextDateKey: string) => void;
  label?: string;
}

const JALALI_YEAR_OPTIONS = Array.from({ length: 201 }, (_, idx) => 1300 + idx);

export const JalaliDateFields: React.FC<JalaliDateFieldsProps> = ({
  idPrefix,
  value,
  onChange,
  label,
}) => {
  const [rawY, m, d] = parseDateKey(value) || [1404, 1, 1];
  const y = Math.max(1300, Math.min(1500, rawY));
  const maxDays = getJalaliMonthDays(y, m);
  const clampedDay = Math.min(d, maxDays);

  const handleDayChange = (nextD: number) => {
    onChange(makeDateKey(y, m, nextD));
  };

  const handleMonthChange = (nextM: number) => {
    const maxForNextMonth = getJalaliMonthDays(y, nextM);
    onChange(makeDateKey(y, nextM, Math.min(clampedDay, maxForNextMonth)));
  };

  const handleYearChange = (nextY: number) => {
    if (!Number.isFinite(nextY)) return;
    const boundedY = Math.max(1300, Math.min(1500, nextY));
    const maxForNextYear = getJalaliMonthDays(boundedY, m);
    onChange(makeDateKey(boundedY, m, Math.min(clampedDay, maxForNextYear)));
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <span
          className="block text-xs font-semibold"
          style={{ color: 'var(--md-on-surface-variant)' }}
        >
          {label}
        </span>
      )}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label htmlFor={`${idPrefix}-day`} className="sr-only">
            روز
          </label>
          <select
            id={`${idPrefix}-day`}
            className="m3-input tabular-nums"
            value={clampedDay}
            onChange={(e) => handleDayChange(Number(e.target.value))}
          >
            {Array.from({ length: maxDays }, (_, idx) => idx + 1).map((dayNum) => (
              <option key={dayNum} value={dayNum}>
                {toFa(dayNum)} ام
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-month`} className="sr-only">
            ماه
          </label>
          <select
            id={`${idPrefix}-month`}
            className="m3-input"
            value={m}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
          >
            {JALALI_MONTHS.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-year`} className="sr-only">
            سال
          </label>
          <select
            id={`${idPrefix}-year`}
            className="m3-input tabular-nums text-center"
            value={y}
            onChange={(e) => handleYearChange(Number(e.target.value))}
          >
            {JALALI_YEAR_OPTIONS.map((yearNum) => (
              <option key={yearNum} value={yearNum}>
                {toFa(yearNum)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
