export type PartnerId = 'p1' | 'p2';
export type PartnerTarget = 'p1' | 'p2' | 'both';
export type ThemeMode = 'auto' | 'light' | 'dark' | 'amoled';
export type DarkStylePref = 'dark' | 'amoled';
export type HeroDisplayMode = 'slider' | 'stack';
export type TabId = 'home' | 'calendar' | 'market' | 'tasks' | 'wishes';
export type MarketSubTab = 'shopping' | 'pantry';
export type PriorityLevel = 'normal' | 'high';
export type PantryStatus = 'ok' | 'low' | 'empty';
export type TaskFrequency = 'یک‌بار' | 'روزانه' | 'هفتگی' | 'ماهانه';
export type CategoryListKey =
  | 'eventCategories'
  | 'marketCategories'
  | 'taskCategories'
  | 'wishCategories';

export type PaletteId =
  | 'terracotta'
  | 'sage'
  | 'ocean'
  | 'lavender'
  | 'rose'
  | 'amber'
  | 'emerald'
  | 'cobalt'
  | 'plum'
  | 'teal'
  | 'crimson'
  | 'coffee'
  | 'indigo'
  | 'olive'
  | 'sunset'
  | 'monochrome'
  | 'sakura'
  | 'butter'
  | 'pistachio'
  | 'glacier'
  | 'lilac'
  | 'coral'
  | 'seafoam'
  | 'champagne';

export type HeroArtKey =
  | 'rings'
  | 'hearts'
  | 'loveletter'
  | 'bouquet'
  | 'dinner'
  | 'cafe'
  | 'tea'
  | 'cake'
  | 'giftbox'
  | 'fireworks'
  | 'cinema'
  | 'music'
  | 'camera'
  | 'books'
  | 'gaming'
  | 'art'
  | 'pizza'
  | 'icecream'
  | 'cooking'
  | 'shopping'
  | 'camping'
  | 'plane'
  | 'roadtrip'
  | 'train'
  | 'boat'
  | 'balloon'
  | 'bicycle'
  | 'mountains'
  | 'beach'
  | 'sunset'
  | 'sunrise'
  | 'picnic'
  | 'stargaze'
  | 'rainy'
  | 'autumn'
  | 'snow'
  | 'nowruz'
  | 'yalda'
  | 'home'
  | 'keys'
  | 'garden'
  | 'pet'
  | 'health'
  | 'fitness'
  | 'spa'
  | 'graduation'
  | 'savings'
  | 'baby';

export interface CategoryItem {
  name: string;
  icon: string;
  heroArt?: HeroArtKey;
}

export interface CoupleEvent {
  id: string;
  title: string;
  dateKey: string; // YYYY-MM-DD (Jalali)
  time?: string;
  partner: PartnerTarget;
  category: string;
  heroArt?: HeroArtKey;
  pinned: boolean;
  repeatYearly: boolean;
  note?: string;
  updatedAt: number;
}

export interface ShoppingItem {
  id: string;
  title: string;
  qty?: string;
  category: string;
  priority: PriorityLevel;
  tags: string[];
  note?: string;
  addedBy: PartnerId;
  done: boolean;
  pinned?: boolean;
  order?: number;
  updatedAt: number;
}

export interface PantryItem {
  id: string;
  title: string;
  qty?: string;
  category: string;
  status: PantryStatus;
  purchaseDate?: string | null;
  expiryDate?: string | null;
  priority: PriorityLevel;
  tags: string[];
  note?: string;
  addedBy: PartnerId;
  updatedAt: number;
}

export interface HomeTask {
  id: string;
  title: string;
  category: string;
  assignee: PartnerTarget;
  freq: TaskFrequency;
  priority: PriorityLevel;
  tags: string[];
  note?: string;
  done: boolean;
  pinned?: boolean;
  order?: number;
  lastCompletedDate?: string | null; // Jalali YYYY-MM-DD for recurring auto-reset
  updatedAt: number;
}

export interface WishItem {
  id: string;
  title: string;
  category: string;
  priority: PriorityLevel;
  tags: string[];
  isPrivate: boolean;
  localOnly?: boolean; // Never synced to shared Gist (true surprise privacy)
  note?: string;
  addedBy: PartnerId;
  done: boolean;
  pinned?: boolean;
  order?: number;
  updatedAt: number;
}

export interface PartnerPulse {
  mood: string;
  note: string;
  updatedAt: number;
}

export interface QuickNudge {
  id: string;
  from: PartnerId;
  emoji: string;
  message: string;
  createdAt: number;
  seenBy?: PartnerId | null;
}

export interface MemoryNote {
  id: string;
  text: string;
  emoji: string;
  dateKey: string; // Jalali YYYY-MM-DD when written/occurred
  unlockDateKey?: string | null; // Optional future Jalali YYYY-MM-DD (Time Capsule)
  author: PartnerId;
  createdAt: number;
  updatedAt: number;
}

export interface SyncConfig {
  gistToken: string;
  gistId: string;
}

export interface NotifPrefs {
  events: boolean;
  expiry: boolean;
  tasks: boolean;
}

export interface DeletedTombstones {
  events: Record<string, number>;
  shopping: Record<string, number>;
  pantry: Record<string, number>;
  tasks: Record<string, number>;
  wishes: Record<string, number>;
  memories: Record<string, number>;
}

export interface AppState {
  schemaVersion: number;
  lastUpdated: number;
  isInitialized: boolean;
  partners: { p1: string; p2: string };
  partnerAvatars: { p1: string; p2: string };
  myAccount: PartnerId;
  themeMode: ThemeMode;
  darkStylePref: DarkStylePref;
  palette: PaletteId;
  heroDisplayMode: HeroDisplayMode;
  soundEnabled: boolean;
  syncConfig: SyncConfig;
  notifPrefs: NotifPrefs;
  pendingOfflineSync: boolean;
  dailyPulse: {
    p1: PartnerPulse;
    p2: PartnerPulse;
  };
  quickNudge: QuickNudge | null;
  eventCategories: CategoryItem[];
  marketCategories: CategoryItem[];
  taskCategories: CategoryItem[];
  wishCategories: CategoryItem[];
  events: CoupleEvent[];
  shopping: ShoppingItem[];
  pantry: PantryItem[];
  tasks: HomeTask[];
  wishes: WishItem[];
  memories: MemoryNote[];
  deletedIds: DeletedTombstones;
}

export interface SharedCloudPayload {
  schemaVersion: number;
  lastUpdated: number;
  isInitialized: boolean;
  partners: { p1: string; p2: string };
  partnerAvatars: { p1: string; p2: string };
  dailyPulse: {
    p1: PartnerPulse;
    p2: PartnerPulse;
  };
  quickNudge: QuickNudge | null;
  eventCategories: CategoryItem[];
  marketCategories: CategoryItem[];
  taskCategories: CategoryItem[];
  wishCategories: CategoryItem[];
  events: CoupleEvent[];
  shopping: ShoppingItem[];
  pantry: PantryItem[];
  tasks: HomeTask[];
  wishes: WishItem[];
  memories: MemoryNote[];
  deletedIds: DeletedTombstones;
}

export type SyncStateKind = 'idle' | 'online' | 'syncing' | 'offline' | 'error';

export interface SmartNotification {
  id: string;
  type: 'event' | 'expiry' | 'task';
  priority: 'high' | 'med';
  title: string;
  sub: string;
  tab: TabId;
}

export interface UndoAction {
  label: string;
  restore: () => void;
}
