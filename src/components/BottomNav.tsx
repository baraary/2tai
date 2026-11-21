import React from 'react';
import { CalendarDays, CheckSquare, Heart, Home, ShoppingBag } from 'lucide-react';
import type { TabId } from '../types/app';

interface BottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

const ITEMS: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'home', label: 'خانه', icon: Home },
  { id: 'calendar', label: 'تقویم', icon: CalendarDays },
  { id: 'market', label: 'خرید', icon: ShoppingBag },
  { id: 'tasks', label: 'کارها', icon: CheckSquare },
  { id: 'wishes', label: 'آرزوها', icon: Heart },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav
      className="fixed bottom-3 sm:bottom-5 inset-x-3 z-40 flex justify-center pointer-events-none pb-safe"
      aria-label="ناوبری اصلی"
    >
      <div
        className="pointer-events-auto flex items-center justify-between gap-1 p-1.5 rounded-[28px] backdrop-blur-xl w-full max-w-[390px] sm:max-w-lg"
        style={{
          backgroundColor: 'var(--md-nav-bg)',
          border: '1px solid var(--md-outline-variant)',
          boxShadow: 'var(--md-shadow-2)',
        }}
      >
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`h-11 sm:h-12 rounded-[22px] flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ease-out active:scale-95 ${
                active
                  ? 'px-4 sm:px-5 shrink-0'
                  : 'flex-1 sm:flex-initial sm:px-3.5 min-w-[44px]'
              }`}
              style={{
                backgroundColor: active ? 'var(--md-primary-container)' : 'transparent',
                color: active ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
              }}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              title={item.label}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${active ? 'scale-105' : ''}`} />
              <span
                className={`text-xs sm:text-[13px] font-bold leading-none whitespace-nowrap ${
                  active ? 'inline-block' : 'hidden sm:inline-block font-semibold'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
