import { useEffect, useMemo, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BottomNav } from './components/BottomNav';
import { CalendarTab } from './components/CalendarTab';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { EventModal } from './components/EventModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { GratitudeJarModal } from './components/GratitudeJarModal';
import { Header } from './components/Header';
import { HomeTab } from './components/HomeTab';
import { InStoreShoppingModal } from './components/InStoreShoppingModal';
import { MarketModal } from './components/MarketModal';
import { MarketTab } from './components/MarketTab';
import { NotificationsSheet } from './components/NotificationsSheet';
import { PinUnlockModal } from './components/PinUnlockModal';
import { SettingsSheet } from './components/SettingsSheet';
import { TaskModal } from './components/TaskModal';
import { TasksTab } from './components/TasksTab';
import { ToastUndo } from './components/ToastUndo';
import { WishModal } from './components/WishModal';
import { WishesTab } from './components/WishesTab';
import { WizardModal } from './components/WizardModal';
import { useCoupleStore } from './hooks/useCoupleStore';
import type {
  CategoryListKey,
  CoupleEvent,
  HomeTask,
  MarketSubTab,
  PantryItem,
  ShoppingItem,
  TabId,
  WishItem,
} from './types/app';
import { makeDateKey } from './utils/jalali';
import { generateSmartNotifications } from './utils/notifications';

export default function App() {
  const store = useCoupleStore();
  const { state, todayJalali, isOnline } = store;

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [marketSubTab, setMarketSubTab] = useState<MarketSubTab>('shopping');
  const [selectedCalDateKey, setSelectedCalDateKey] = useState(() =>
    makeDateKey(todayJalali[0], todayJalali[1], todayJalali[2])
  );

  // Modals state
  const [eventModal, setEventModal] = useState<{
    open: boolean;
    editEvent?: CoupleEvent | null;
    defaultDateKey?: string;
  }>({ open: false });

  const [marketModal, setMarketModal] = useState<{
    open: boolean;
    target: MarketSubTab;
    editItem?: ShoppingItem | PantryItem | null;
    quickTitle?: string;
    defaultCategory?: string;
  }>({ open: false, target: 'shopping' });

  const [taskModal, setTaskModal] = useState<{
    open: boolean;
    editTask?: HomeTask | null;
    quickTitle?: string;
    defaultCategory?: string;
  }>({ open: false });

  const [wishModal, setWishModal] = useState<{
    open: boolean;
    editWish?: WishItem | null;
    quickTitle?: string;
    defaultCategory?: string;
  }>({ open: false });

  const [catManager, setCatManager] = useState<{
    open: boolean;
    listKey: CategoryListKey;
    editCatName?: string | null;
  }>({ open: false, listKey: 'eventCategories' });

  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inStoreOpen, setInStoreOpen] = useState(false);
  const [jarModal, setJarModal] = useState<{ open: boolean; initialView: 'jar' | 'add' }>({
    open: false,
    initialView: 'jar',
  });

  const alerts = useMemo(() => generateSmartNotifications(state), [state]);

  // Global Cmd+K / Ctrl+K shortcut for Spotlight Search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const anyModalOpen =
    eventModal.open ||
    marketModal.open ||
    taskModal.open ||
    wishModal.open ||
    catManager.open ||
    notifOpen ||
    settingsOpen ||
    searchOpen ||
    inStoreOpen ||
    jarModal.open ||
    !state.isInitialized ||
    Boolean(store.pendingPinInvite);

  const handleSelectTab = (tab: TabId) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <Header
        onSelectTab={handleSelectTab}
        partners={state.partners}
        partnerAvatars={state.partnerAvatars}
        myAccount={state.myAccount}
        themeMode={state.themeMode}
        onToggleTheme={store.toggleQuickTheme}
        syncKind={store.syncKind}
        syncLabel={store.syncLabel}
        hasCloudSync={Boolean(state.syncConfig.gistToken)}
        onManualSync={() => void store.pullFromCloud(false, true)}
        notifCount={alerts.length}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenNotifications={() => setNotifOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {!isOnline && (
        <div
          role="status"
          className="px-4 py-2 text-xs font-bold flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--md-warning-container)',
            color: 'var(--md-warning)',
          }}
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span>حالت آفلاین فعال است — تغییرات روی گوشی ذخیره و پس از اتصال همگام می‌شوند</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-5 pb-28 sm:pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'home' && (
              <HomeTab
                store={store}
                onNavigate={handleSelectTab}
                onOpenEventModal={(ev) =>
                  setEventModal({ open: true, editEvent: ev || null, defaultDateKey: selectedCalDateKey })
                }
                onOpenMarketModal={() => setMarketModal({ open: true, target: 'shopping' })}
                onOpenTaskModal={() => setTaskModal({ open: true })}
                onOpenWishModal={() => setWishModal({ open: true })}
                onOpenGratitudeJar={(initialView = 'jar') =>
                  setJarModal({ open: true, initialView })
                }
                isModalOpen={anyModalOpen}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarTab
                store={store}
                selectedDateKey={selectedCalDateKey}
                onSelectDateKey={setSelectedCalDateKey}
                onOpenEventModal={(ev, dateKey) =>
                  setEventModal({
                    open: true,
                    editEvent: ev || null,
                    defaultDateKey: dateKey || selectedCalDateKey,
                  })
                }
              />
            )}

            {activeTab === 'market' && (
              <MarketTab
                store={store}
                subTab={marketSubTab}
                onChangeSubTab={setMarketSubTab}
                onOpenMarketModal={(params) =>
                  setMarketModal({
                    open: true,
                    target: params?.target || marketSubTab,
                    editItem: params?.editItem || null,
                    quickTitle: params?.quickTitle,
                    defaultCategory: params?.defaultCat,
                  })
                }
                onOpenCategoryManager={(listKey) =>
                  setCatManager({ open: true, listKey, editCatName: null })
                }
                onOpenInStoreMode={() => setInStoreOpen(true)}
              />
            )}

            {activeTab === 'tasks' && (
              <TasksTab
                store={store}
                onOpenTaskModal={(editTask, quickTitle, defaultCategory) =>
                  setTaskModal({
                    open: true,
                    editTask: editTask || null,
                    quickTitle,
                    defaultCategory,
                  })
                }
                onOpenCategoryManager={(listKey) =>
                  setCatManager({ open: true, listKey, editCatName: null })
                }
              />
            )}

            {activeTab === 'wishes' && (
              <WishesTab
                store={store}
                onOpenWishModal={(editWish, quickTitle, defaultCategory) =>
                  setWishModal({
                    open: true,
                    editWish: editWish || null,
                    quickTitle,
                    defaultCategory,
                  })
                }
                onOpenCategoryManager={(listKey) =>
                  setCatManager({ open: true, listKey, editCatName: null })
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Modals & Sheets */}
      <EventModal
        open={eventModal.open}
        onClose={() => setEventModal({ open: false })}
        store={store}
        editEvent={eventModal.editEvent}
        defaultDateKey={eventModal.defaultDateKey}
        onOpenCategoryManager={(listKey, editCatName) =>
          setCatManager({ open: true, listKey, editCatName: editCatName || null })
        }
      />

      <MarketModal
        open={marketModal.open}
        onClose={() => setMarketModal((prev) => ({ ...prev, open: false }))}
        store={store}
        initialTarget={marketModal.target}
        editItem={marketModal.editItem}
        quickTitle={marketModal.quickTitle}
        defaultCategory={marketModal.defaultCategory}
        onOpenCategoryManager={(listKey, editCatName) =>
          setCatManager({ open: true, listKey, editCatName: editCatName || null })
        }
        onAfterSaveTarget={(t) => setMarketSubTab(t)}
      />

      <TaskModal
        open={taskModal.open}
        onClose={() => setTaskModal({ open: false })}
        store={store}
        editTask={taskModal.editTask}
        quickTitle={taskModal.quickTitle}
        defaultCategory={taskModal.defaultCategory}
        onOpenCategoryManager={(listKey, editCatName) =>
          setCatManager({ open: true, listKey, editCatName: editCatName || null })
        }
      />

      <WishModal
        open={wishModal.open}
        onClose={() => setWishModal({ open: false })}
        store={store}
        editWish={wishModal.editWish}
        quickTitle={wishModal.quickTitle}
        defaultCategory={wishModal.defaultCategory}
        onOpenCategoryManager={(listKey, editCatName) =>
          setCatManager({ open: true, listKey, editCatName: editCatName || null })
        }
      />

      <CategoryManagerModal
        open={catManager.open}
        onClose={() => setCatManager((prev) => ({ ...prev, open: false }))}
        store={store}
        listKey={catManager.listKey}
        initialEditName={catManager.editCatName}
      />

      <NotificationsSheet
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        store={store}
        alerts={alerts}
        onNavigate={handleSelectTab}
      />

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        store={store}
      />

      <WizardModal
        open={!state.isInitialized && !store.pendingPinInvite}
        store={store}
      />

      <PinUnlockModal
        rawCode={store.pendingPinInvite}
        onCancel={() => store.setPendingPinInvite(null)}
        onUnlocked={(payload) => void store.applyInvitePayload(payload)}
      />

      <GlobalSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        state={state}
        onNavigateTab={(tab, marketSub) => {
          if (marketSub) setMarketSubTab(marketSub);
          handleSelectTab(tab);
        }}
        onSelectEvent={(ev) => {
          setSelectedCalDateKey(ev.dateKey);
          setActiveTab('calendar');
          setEventModal({ open: true, editEvent: ev, defaultDateKey: ev.dateKey });
        }}
        onSelectShopping={(item) => {
          setMarketSubTab('shopping');
          setActiveTab('market');
          setMarketModal({ open: true, target: 'shopping', editItem: item });
        }}
        onSelectPantry={(item) => {
          setMarketSubTab('pantry');
          setActiveTab('market');
          setMarketModal({ open: true, target: 'pantry', editItem: item });
        }}
        onSelectTask={(task) => {
          setActiveTab('tasks');
          setTaskModal({ open: true, editTask: task });
        }}
        onSelectWish={(wish) => {
          setActiveTab('wishes');
          setWishModal({ open: true, editWish: wish });
        }}
      />

      <GratitudeJarModal
        key={jarModal.open ? `jar-${jarModal.initialView}` : 'jar-closed'}
        open={jarModal.open}
        onClose={() => setJarModal((prev) => ({ ...prev, open: false }))}
        store={store}
        initialView={jarModal.initialView}
      />

      <InStoreShoppingModal
        open={inStoreOpen}
        onClose={() => setInStoreOpen(false)}
        store={store}
      />

      <ToastUndo toast={store.toast} onDismiss={store.dismissToast} />
    </div>
  );
}
