import React from 'react';
import {
  Apple,
  Baby,
  Bike,
  BookOpen,
  Briefcase,
  Brush,
  Cake,
  CalendarHeart,
  Camera,
  Car,
  ChefHat,
  Clock,
  CloudRain,
  Coffee,
  Compass,
  CreditCard,
  Crown,
  Droplets,
  Dumbbell,
  Film,
  Flame,
  Flower2,
  Gamepad2,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  Home,
  IceCreamCone,
  KeyRound,
  Lamp,
  Laptop,
  Leaf,
  MapPin,
  Milk,
  Moon,
  Mountain,
  Music,
  Palette,
  PartyPopper,
  PawPrint,
  PiggyBank,
  Pill,
  Pizza,
  Plane,
  Receipt,
  Scissors,
  Ship,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Smile,
  Snowflake,
  Sofa,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Tent,
  Ticket,
  TrainFront,
  Trophy,
  Tv,
  Umbrella,
  Utensils,
  Wallet,
  Wine,
  Wrench,
  Zap,
} from 'lucide-react';
import type { HeroArtKey } from '../types/app';

export interface CategoryIconDef {
  key: string;
  label: string;
  render: (className?: string) => React.ReactNode;
}

export const CATEGORY_ICONS: CategoryIconDef[] = [
  // عشق، مناسبت و خانواده
  { key: 'heart', label: 'عشق', render: (c) => <Heart className={c} /> },
  { key: 'ring', label: 'سالگرد و حلقه', render: (c) => <Gem className={c} /> },
  { key: 'calendarHeart', label: 'تاریخ خاص', render: (c) => <CalendarHeart className={c} /> },
  { key: 'cake', label: 'تولد', render: (c) => <Cake className={c} /> },
  { key: 'gift', label: 'هدیه', render: (c) => <Gift className={c} /> },
  { key: 'party', label: 'جشن و مهمانی', render: (c) => <PartyPopper className={c} /> },
  { key: 'flower', label: 'گل و دسته گل', render: (c) => <Flower2 className={c} /> },
  { key: 'baby', label: 'خانواده و کودک', render: (c) => <Baby className={c} /> },
  // سفر، طبیعت و فصل‌ها
  { key: 'plane', label: 'پرواز و سفر', render: (c) => <Plane className={c} /> },
  { key: 'tent', label: 'کمپینگ', render: (c) => <Tent className={c} /> },
  { key: 'car', label: 'ماشین و جاده', render: (c) => <Car className={c} /> },
  { key: 'train', label: 'قطار', render: (c) => <TrainFront className={c} /> },
  { key: 'ship', label: 'دریا و کشتی', render: (c) => <Ship className={c} /> },
  { key: 'bike', label: 'دوچرخه', render: (c) => <Bike className={c} /> },
  { key: 'mountain', label: 'کوه و طبیعت', render: (c) => <Mountain className={c} /> },
  { key: 'compass', label: 'ماجراجویی', render: (c) => <Compass className={c} /> },
  { key: 'map', label: 'مکان و قرار', render: (c) => <MapPin className={c} /> },
  { key: 'sun', label: 'آفتاب و تابستان', render: (c) => <Sun className={c} /> },
  { key: 'moon', label: 'شب و ماه', render: (c) => <Moon className={c} /> },
  { key: 'cloudRain', label: 'باران', render: (c) => <CloudRain className={c} /> },
  { key: 'snowflake', label: 'زمستان و برف', render: (c) => <Snowflake className={c} /> },
  { key: 'umbrella', label: 'ساحل و چتر', render: (c) => <Umbrella className={c} /> },
  // غذا، کافه و خرید
  { key: 'cart', label: 'سوپرمارکت', render: (c) => <ShoppingCart className={c} /> },
  { key: 'shoppingBag', label: 'خرید و پوشاک', render: (c) => <ShoppingBag className={c} /> },
  { key: 'apple', label: 'میوه و تره‌بار', render: (c) => <Apple className={c} /> },
  { key: 'bread', label: 'غذا و رستوران', render: (c) => <Utensils className={c} /> },
  { key: 'coffee', label: 'کافه و چای', render: (c) => <Coffee className={c} /> },
  { key: 'pizza', label: 'فست‌فود', render: (c) => <Pizza className={c} /> },
  { key: 'icecream', label: 'بستنی و دسر', render: (c) => <IceCreamCone className={c} /> },
  { key: 'milk', label: 'لبنیات و نوشیدنی', render: (c) => <Milk className={c} /> },
  { key: 'wine', label: 'شام ویژه', render: (c) => <Wine className={c} /> },
  { key: 'chef', label: 'آشپزی', render: (c) => <ChefHat className={c} /> },
  // خانه، نظافت و مراقبت
  { key: 'home', label: 'خانه', render: (c) => <Home className={c} /> },
  { key: 'key', label: 'کلید و ملک', render: (c) => <KeyRound className={c} /> },
  { key: 'sofa', label: 'دکور و مبلمان', render: (c) => <Sofa className={c} /> },
  { key: 'lamp', label: 'روشنایی', render: (c) => <Lamp className={c} /> },
  { key: 'sparkles', label: 'نظافت و بهداشتی', render: (c) => <Sparkles className={c} /> },
  { key: 'droplets', label: 'شستشو و آب', render: (c) => <Droplets className={c} /> },
  { key: 'wrench', label: 'تعمیرات فنی', render: (c) => <Wrench className={c} /> },
  { key: 'zap', label: 'برق و انرژی', render: (c) => <Zap className={c} /> },
  { key: 'leaf', label: 'گل و گیاه', render: (c) => <Leaf className={c} /> },
  { key: 'paw', label: 'حیوان خانگی', render: (c) => <PawPrint className={c} /> },
  { key: 'shirt', label: 'لباس و مد', render: (c) => <Shirt className={c} /> },
  { key: 'scissors', label: 'آرایش و زیبایی', render: (c) => <Scissors className={c} /> },
  // سلامت، ورزش و مالی
  { key: 'medical', label: 'پزشکی و سلامت', render: (c) => <Stethoscope className={c} /> },
  { key: 'pill', label: 'داروخانه', render: (c) => <Pill className={c} /> },
  { key: 'dumbbell', label: 'ورزش و باشگاه', render: (c) => <Dumbbell className={c} /> },
  { key: 'receipt', label: 'قبوض', render: (c) => <Receipt className={c} /> },
  { key: 'wallet', label: 'مالی و بودجه', render: (c) => <Wallet className={c} /> },
  { key: 'piggyBank', label: 'پس‌انداز', render: (c) => <PiggyBank className={c} /> },
  { key: 'creditCard', label: 'قسط و کارت', render: (c) => <CreditCard className={c} /> },
  // سرگرمی، هنر، کار و یادگیری
  { key: 'movie', label: 'فیلم و سینما', render: (c) => <Film className={c} /> },
  { key: 'tv', label: 'سریال', render: (c) => <Tv className={c} /> },
  { key: 'music', label: 'موسیقی و کنسرت', render: (c) => <Music className={c} /> },
  { key: 'ticket', label: 'بلیط و تئاتر', render: (c) => <Ticket className={c} /> },
  { key: 'camera', label: 'عکاسی و خاطره', render: (c) => <Camera className={c} /> },
  { key: 'gamepad', label: 'بازی و سرگرمی', render: (c) => <Gamepad2 className={c} /> },
  { key: 'palette', label: 'هنر و نقاشی', render: (c) => <Palette className={c} /> },
  { key: 'brush', label: 'کاردستی و طراحی', render: (c) => <Brush className={c} /> },
  { key: 'book', label: 'کتاب و مطالعه', render: (c) => <BookOpen className={c} /> },
  { key: 'graduation', label: 'تحصیل و دوره', render: (c) => <GraduationCap className={c} /> },
  { key: 'briefcase', label: 'کار و پروژه', render: (c) => <Briefcase className={c} /> },
  { key: 'laptop', label: 'لپ‌تاپ و دیجیتال', render: (c) => <Laptop className={c} /> },
  { key: 'phone', label: 'موبایل و ارتباط', render: (c) => <Smartphone className={c} /> },
  // ویژه و عمومی
  { key: 'clock', label: 'یادآور و زمان', render: (c) => <Clock className={c} /> },
  { key: 'smile', label: 'حال خوب', render: (c) => <Smile className={c} /> },
  { key: 'crown', label: 'خاص و VIP', render: (c) => <Crown className={c} /> },
  { key: 'trophy', label: 'موفقیت و هدف', render: (c) => <Trophy className={c} /> },
  { key: 'flame', label: 'ویژه و فوری', render: (c) => <Flame className={c} /> },
  { key: 'star', label: 'ستاره', render: (c) => <Star className={c} /> },
];

export function CategoryIcon({ name, className = 'w-4 h-4' }: { name?: string; className?: string }) {
  const found = CATEGORY_ICONS.find((i) => i.key === name) || CATEGORY_ICONS[CATEGORY_ICONS.length - 1];
  return <>{found.render(className)}</>;
}

export const HERO_ART_OPTIONS: { key: HeroArtKey; title: string }[] = [
  { key: 'rings', title: 'حلقه‌های سالگرد' },
  { key: 'hearts', title: 'قلب‌های دوتایی' },
  { key: 'loveletter', title: 'نامه عاشقانه' },
  { key: 'bouquet', title: 'دسته گل عاشقانه' },
  { key: 'dinner', title: 'شام رمانتیک' },
  { key: 'cafe', title: 'قرار کافه' },
  { key: 'tea', title: 'چای دونفره' },
  { key: 'cake', title: 'جشن تولد' },
  { key: 'giftbox', title: 'کادو و سورپرایز' },
  { key: 'fireworks', title: 'جشن و آتش‌بازی' },
  { key: 'cinema', title: 'سینما و فیلم' },
  { key: 'music', title: 'کنسرت و موزیک' },
  { key: 'camera', title: 'عکاسی و خاطره' },
  { key: 'books', title: 'کتاب و مطالعه' },
  { key: 'gaming', title: 'بازی و سرگرمی' },
  { key: 'art', title: 'نقاشی و هنر' },
  { key: 'pizza', title: 'پیتزا و فست‌فود' },
  { key: 'icecream', title: 'بستنی و دسر' },
  { key: 'cooking', title: 'آشپزی دونفره' },
  { key: 'shopping', title: 'خرید و استایل' },
  { key: 'camping', title: 'سفر و کمپینگ' },
  { key: 'plane', title: 'پرواز و سفر' },
  { key: 'roadtrip', title: 'جاده و ماشین' },
  { key: 'train', title: 'سفر با قطار' },
  { key: 'boat', title: 'قایق و دریاچه' },
  { key: 'balloon', title: 'بالن و رویا' },
  { key: 'bicycle', title: 'دوچرخه‌سواری' },
  { key: 'mountains', title: 'کوه و طبیعت' },
  { key: 'beach', title: 'دریا و ساحل' },
  { key: 'sunset', title: 'غروب آفتاب' },
  { key: 'sunrise', title: 'طلوع و صبح‌بخیر' },
  { key: 'picnic', title: 'پیک‌نیک بهاری' },
  { key: 'stargaze', title: 'شب و ستاره' },
  { key: 'rainy', title: 'روز بارانی' },
  { key: 'autumn', title: 'برگ پاییزی' },
  { key: 'snow', title: 'برف زمستانی' },
  { key: 'nowruz', title: 'نوروز و عید' },
  { key: 'yalda', title: 'شب یلدا' },
  { key: 'home', title: 'خانه گرم' },
  { key: 'keys', title: 'کلید خانه جدید' },
  { key: 'garden', title: 'گلدان و گیاه' },
  { key: 'pet', title: 'حیوان خانگی' },
  { key: 'health', title: 'سلامتی و چکاپ' },
  { key: 'fitness', title: 'ورزش و باشگاه' },
  { key: 'spa', title: 'آرامش و اسپا' },
  { key: 'graduation', title: 'موفقیت و مدرک' },
  { key: 'savings', title: 'پس‌انداز و هدف' },
  { key: 'baby', title: 'خانواده و نی‌نی' },
];

export function HeroArtwork({ artKey, className = 'w-full h-full' }: { artKey?: HeroArtKey; className?: string }) {
  switch (artKey) {
    case 'rings':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="48" cy="65" r="21" fill="none" stroke="#FFF2CC" strokeWidth="6.5" />
          <circle cx="72" cy="65" r="21" fill="none" stroke="#FFFFFF" strokeWidth="6.5" />
          <polygon points="48,34 56,43 48,50 40,43" fill="#FFE08A" />
          <circle cx="88" cy="36" r="3" fill="#FFF8E1" opacity="0.9" />
          <circle cx="30" cy="42" r="2.5" fill="#FFF8E1" opacity="0.75" />
        </svg>
      );
    case 'loveletter':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <rect x="24" y="40" width="72" height="48" rx="10" fill="#FFFFFF" />
          <path d="M26 44 L60 68 L94 44" fill="none" stroke="#F4D7E2" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 86 L49 65 M94 86 L71 65" stroke="#F3E5EB" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M60 72 C60 72 49 65 49 58 C49 54 52 51 55.5 51 C57.8 51 59.3 52.4 60 54 C60.7 52.4 62.2 51 64.5 51 C68 51 71 54 71 58 C71 65 60 72 60 72 Z" fill="#F28AA4" />
          <circle cx="88" cy="31" r="3" fill="#FFF3B0" />
          <circle cx="32" cy="33" r="2.5" fill="#FFFFFF" opacity="0.8" />
        </svg>
      );
    case 'bouquet':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M40 58 L60 98 L80 58 Z" fill="#FFF5EB" opacity="0.94" />
          <path d="M49 76 Q60 82 71 76" fill="none" stroke="#F4A5B8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="46" cy="48" r="11" fill="#FFD1DC" />
          <circle cx="74" cy="48" r="11" fill="#FFE2B8" />
          <circle cx="60" cy="39" r="13" fill="#FFFFFF" />
          <circle cx="60" cy="39" r="5" fill="#FFD166" />
          <circle cx="46" cy="48" r="4" fill="#FFFFFF" opacity="0.85" />
          <circle cx="74" cy="48" r="4" fill="#FFFFFF" opacity="0.85" />
          <ellipse cx="35" cy="57" rx="7" ry="4" transform="rotate(-30 35 57)" fill="#B8E4C9" />
          <ellipse cx="85" cy="57" rx="7" ry="4" transform="rotate(30 85 57)" fill="#B8E4C9" />
        </svg>
      );
    case 'dinner':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <rect x="24" y="84" width="72" height="6" rx="3" fill="rgba(255,255,255,0.85)" />
          <rect x="55" y="48" width="10" height="36" rx="4" fill="#FFF9F0" />
          <path d="M60 28 C66 36 66 44 60 46 C54 44 54 36 60 28 Z" fill="#FFE082" />
          <path d="M36 56 H48 L46 69 C45 73 39 73 38 69 Z" fill="rgba(255,255,255,0.9)" />
          <line x1="42" y1="72" x2="42" y2="84" stroke="#FFFFFF" strokeWidth="2.8" />
          <path d="M72 56 H84 L82 69 C81 73 75 73 74 69 Z" fill="rgba(255,255,255,0.9)" />
          <line x1="78" y1="72" x2="78" y2="84" stroke="#FFFFFF" strokeWidth="2.8" />
          <circle cx="60" cy="36" r="14" fill="rgba(255,224,130,0.24)" />
        </svg>
      );
    case 'cafe':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M44 40 Q47 32 44 26" stroke="#FFE8CC" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M58 38 Q61 30 58 24" stroke="#FFE8CC" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M72 40 Q75 32 72 26" stroke="#FFE8CC" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M32 50 H82 V72 C82 84 72 90 57 90 C42 90 32 84 32 72 Z" fill="#FFFFFF" />
          <path d="M82 56 H90 C95 56 97 60 97 65 C97 70 94 74 88 74 H82" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <path d="M57 63 C57 63 50 58 50 54 C50 51.5 52 50 54 50 C55.5 50 57 51 57 52.5 C57 51 58.5 50 60 50 C62 50 64 51.5 64 54 C64 58 57 63 57 63 Z" fill="#E8839F" />
        </svg>
      );
    case 'tea':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M48 34 Q51 27 48 22" stroke="#FFE8CC" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M60 32 Q63 25 60 20" stroke="#FFE8CC" strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="56" cy="68" rx="24" ry="20" fill="#FFFFFF" />
          <ellipse cx="56" cy="48" rx="14" ry="5" fill="#FFE2B8" />
          <circle cx="56" cy="42" r="4.5" fill="#FFE082" />
          <path d="M34 64 C24 62 24 54 32 54" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M78 58 C88 58 92 66 88 74 C85 78 80 78 76 76" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M56 63 C56 63 50 59 50 56 C50 54 51.8 53 53.5 53 C54.7 53 55.6 53.8 56 54.8 C56.4 53.8 57.3 53 58.5 53 C60.2 53 62 54 62 56 C62 59 56 63 56 63 Z" fill="#F29CB4" />
        </svg>
      );
    case 'cake':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <rect x="44" y="34" width="6" height="16" rx="3" fill="#FFF3C4" />
          <rect x="57" y="30" width="6" height="20" rx="3" fill="#FFF3C4" />
          <rect x="70" y="34" width="6" height="16" rx="3" fill="#FFF3C4" />
          <circle cx="47" cy="29" r="4" fill="#FFD166" />
          <circle cx="60" cy="25" r="4.5" fill="#FFD166" />
          <circle cx="73" cy="29" r="4" fill="#FFD166" />
          <rect x="30" y="50" width="60" height="36" rx="10" fill="#FFFFFF" />
          <path d="M30 62 Q40 70 50 62 Q60 70 70 62 Q80 70 90 62" fill="none" stroke="#F4A5B8" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );
    case 'giftbox':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <rect x="32" y="52" width="56" height="38" rx="9" fill="#FFFFFF" />
          <rect x="28" y="42" width="64" height="14" rx="6" fill="#FFF4E6" />
          <rect x="55" y="42" width="10" height="48" fill="#F4A5B8" />
          <path d="M60 42 C52 28 38 30 43 40 C46 44 55 43 60 42 Z" fill="#FFE082" />
          <path d="M60 42 C68 28 82 30 77 40 C74 44 65 43 60 42 Z" fill="#FFE082" />
        </svg>
      );
    case 'fireworks':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <g stroke="#FFE082" strokeWidth="4" strokeLinecap="round">
            <line x1="60" y1="24" x2="60" y2="38" />
            <line x1="60" y1="68" x2="60" y2="82" />
            <line x1="31" y1="53" x2="45" y2="53" />
            <line x1="75" y1="53" x2="89" y2="53" />
          </g>
          <g stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round">
            <line x1="40" y1="33" x2="49" y2="42" />
            <line x1="71" y1="64" x2="80" y2="73" />
            <line x1="80" y1="33" x2="71" y2="42" />
            <line x1="49" y1="64" x2="40" y2="73" />
          </g>
          <circle cx="60" cy="53" r="6" fill="#FFD1DC" />
          <circle cx="34" cy="78" r="3.5" fill="#B8E4C9" />
          <circle cx="86" cy="80" r="3.5" fill="#FFD1DC" />
          <circle cx="88" cy="38" r="2.8" fill="#FFFFFF" />
        </svg>
      );
    case 'cinema':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <rect x="26" y="44" width="68" height="44" rx="10" fill="#FFFFFF" />
          <path d="M26 52 H94 V44 C94 38 90 34 84 34 H36 C30 34 26 38 26 44 Z" fill="#FFE2B8" />
          <line x1="40" y1="34" x2="34" y2="52" stroke="rgba(0,0,0,0.15)" strokeWidth="4" />
          <line x1="58" y1="34" x2="52" y2="52" stroke="rgba(0,0,0,0.15)" strokeWidth="4" />
          <line x1="76" y1="34" x2="70" y2="52" stroke="rgba(0,0,0,0.15)" strokeWidth="4" />
          <polygon points="54,60 54,78 70,69" fill="#E8839F" />
        </svg>
      );
    case 'music':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M48 76 V38 L82 30 V68" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="42" cy="78" rx="10" ry="8" fill="#FFE082" />
          <ellipse cx="76" cy="70" rx="10" ry="8" fill="#FFD1DC" />
          <circle cx="34" cy="40" r="3.5" fill="#FFFFFF" opacity="0.7" />
          <circle cx="88" cy="48" r="3" fill="#FFFFFF" opacity="0.7" />
        </svg>
      );
    case 'camera':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M42 42 L48 34 H72 L78 42 Z" fill="#FFE2B8" />
          <rect x="24" y="42" width="72" height="46" rx="12" fill="#FFFFFF" />
          <circle cx="60" cy="65" r="16" fill="#DCE9FA" stroke="#B6CEF5" strokeWidth="3.5" />
          <circle cx="60" cy="65" r="8" fill="#FFFFFF" />
          <circle cx="64" cy="61" r="2.8" fill="#FFE082" />
          <circle cx="82" cy="52" r="3.5" fill="#F4A5B8" />
        </svg>
      );
    case 'books':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <rect x="28" y="68" width="64" height="18" rx="6" fill="#FFFFFF" />
          <rect x="34" y="50" width="54" height="18" rx="6" fill="#FFE2B8" />
          <rect x="30" y="34" width="56" height="16" rx="6" fill="#FFD1DC" />
          <path d="M74 34 V54 L79 49 L84 54 V34 Z" fill="#FFF3B0" />
          <line x1="38" y1="77" x2="78" y2="77" stroke="#E5ECF6" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'gaming':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M36 48 H84 C94 48 98 62 94 76 C92 84 82 86 76 78 L70 72 H50 L44 78 C38 86 28 84 26 76 C22 62 26 48 36 48 Z" fill="#FFFFFF" />
          <line x1="42" y1="56" x2="42" y2="68" stroke="#9EAEEB" strokeWidth="4" strokeLinecap="round" />
          <line x1="36" y1="62" x2="48" y2="62" stroke="#9EAEEB" strokeWidth="4" strokeLinecap="round" />
          <circle cx="76" cy="58" r="3.5" fill="#F4A5B8" />
          <circle cx="83" cy="64" r="3.5" fill="#FFE082" />
          <circle cx="70" cy="64" r="3.5" fill="#B8E4C9" />
        </svg>
      );
    case 'art':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M60 28 C80 28 94 42 94 58 C94 72 82 78 72 76 C66 75 64 81 66 86 C68 92 60 94 52 92 C34 88 24 72 26 54 C28 38 42 28 60 28 Z" fill="#FFFFFF" />
          <circle cx="44" cy="50" r="5.5" fill="#F4A5B8" />
          <circle cx="58" cy="41" r="5.5" fill="#FFE082" />
          <circle cx="74" cy="46" r="5.5" fill="#B8E4C9" />
          <circle cx="79" cy="60" r="5.5" fill="#B6D6FA" />
          <circle cx="43" cy="68" r="6" fill="rgba(0,0,0,0.12)" />
        </svg>
      );
    case 'pizza':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M60 28 L90 84 Q60 94 30 84 Z" fill="#FFF1B8" />
          <path d="M30 84 Q60 94 90 84" fill="none" stroke="#F6B882" strokeWidth="9" strokeLinecap="round" />
          <circle cx="58" cy="54" r="5.5" fill="#F28A94" />
          <circle cx="48" cy="70" r="5" fill="#F28A94" />
          <circle cx="69" cy="70" r="5" fill="#F28A94" />
          <circle cx="62" cy="64" r="3" fill="#B8E4C9" />
        </svg>
      );
    case 'icecream':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M44 62 L60 96 L76 62 Z" fill="#FFE0B5" />
          <circle cx="50" cy="54" r="14" fill="#FFD1DC" />
          <circle cx="70" cy="54" r="14" fill="#C7EFE0" />
          <circle cx="60" cy="42" r="14" fill="#FFFFFF" />
          <circle cx="60" cy="28" r="4.5" fill="#F28A94" />
        </svg>
      );
    case 'cooking':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="44" cy="46" r="13" fill="#FFFFFF" />
          <circle cx="60" cy="40" r="15" fill="#FFFFFF" />
          <circle cx="76" cy="46" r="13" fill="#FFFFFF" />
          <rect x="38" y="54" width="44" height="24" rx="6" fill="#FFFFFF" />
          <rect x="38" y="74" width="44" height="10" rx="5" fill="#FFE2B8" />
          <path d="M60 70 C60 70 54 66 54 63 C54 61 55.5 60 57 60 C58.3 60 59.3 60.8 60 61.8 C60.7 60.8 61.7 60 63 60 C64.5 60 66 61 66 63 C66 66 60 70 60 70 Z" fill="#F4A5B8" />
        </svg>
      );
    case 'shopping':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M48 48 V40 C48 33 64 33 64 40 V48" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
          <rect x="34" y="46" width="44" height="44" rx="10" fill="#FFFFFF" />
          <path d="M66 54 V48 C66 42 78 42 78 48 V54" fill="none" stroke="#FFE2B8" strokeWidth="4" strokeLinecap="round" />
          <rect x="56" y="54" width="32" height="36" rx="8" fill="#FFD1DC" />
          <circle cx="52" cy="64" r="3.5" fill="#FFE082" />
        </svg>
      );
    case 'camping':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="84" cy="36" r="10" fill="#FFE8A3" />
          <path d="M18 86 L46 44 L74 86 Z" fill="rgba(255,255,255,0.34)" />
          <path d="M40 86 L66 48 L96 86 Z" fill="#FFFFFF" opacity="0.95" />
          <path d="M58 86 L66 64 L74 86 Z" fill="rgba(0,0,0,0.2)" />
          <rect x="20" y="86" width="80" height="5" rx="2.5" fill="rgba(255,255,255,0.55)" />
        </svg>
      );
    case 'plane':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M26 78 Q56 76 86 38" stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeDasharray="5 5" fill="none" />
          <path d="M90 34 L42 54 L56 62 L62 78 L72 64 L88 68 Z" fill="#FFFFFF" />
          <circle cx="34" cy="40" r="6" fill="rgba(255,255,255,0.34)" />
          <circle cx="42" cy="40" r="8" fill="rgba(255,255,255,0.34)" />
        </svg>
      );
    case 'roadtrip':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="82" cy="34" r="9" fill="#FFE8A3" />
          <path d="M26 70 L36 52 H78 L90 70 V82 H26 Z" fill="#FFFFFF" />
          <rect x="40" y="56" width="16" height="12" rx="3" fill="rgba(0,0,0,0.16)" />
          <rect x="60" y="56" width="16" height="12" rx="3" fill="rgba(0,0,0,0.16)" />
          <circle cx="42" cy="82" r="9" fill="#3D4354" />
          <circle cx="42" cy="82" r="4" fill="#FFFFFF" />
          <circle cx="76" cy="82" r="9" fill="#3D4354" />
          <circle cx="76" cy="82" r="4" fill="#FFFFFF" />
        </svg>
      );
    case 'train':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="38" cy="34" r="6" fill="rgba(255,255,255,0.45)" />
          <circle cx="48" cy="30" r="4.5" fill="rgba(255,255,255,0.35)" />
          <rect x="34" y="38" width="52" height="44" rx="12" fill="#FFFFFF" />
          <rect x="42" y="46" width="36" height="18" rx="5" fill="#DCE9FA" />
          <circle cx="46" cy="73" r="4" fill="#FFE082" />
          <circle cx="74" cy="73" r="4" fill="#FFE082" />
          <line x1="40" y1="88" x2="32" y2="96" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <line x1="80" y1="88" x2="88" y2="96" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'boat':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <polygon points="60,26 60,68 34,68" fill="#FFFFFF" />
          <polygon points="64,34 86,68 64,68" fill="#FFE2B8" />
          <path d="M28 72 H92 L82 84 H38 Z" fill="#FFD1DC" />
          <path d="M22 88 Q40 82 60 88 Q80 94 98 88" fill="none" stroke="#D9F2FF" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );
    case 'balloon':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M60 24 C78 24 88 38 84 54 C80 68 70 74 68 76 H52 C50 74 40 68 36 54 C32 38 42 24 60 24 Z" fill="#FFFFFF" />
          <path d="M60 24 C69 24 72 44 65 76 H55 C48 44 51 24 60 24 Z" fill="#FFD1DC" />
          <line x1="54" y1="76" x2="55" y2="84" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="66" y1="76" x2="65" y2="84" stroke="#FFFFFF" strokeWidth="2.5" />
          <rect x="52" y="84" width="16" height="10" rx="3" fill="#FFE2B8" />
          <circle cx="30" cy="40" r="5" fill="rgba(255,255,255,0.35)" />
        </svg>
      );
    case 'bicycle':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="38" cy="74" r="15" fill="none" stroke="#FFFFFF" strokeWidth="4.5" />
          <circle cx="82" cy="74" r="15" fill="none" stroke="#FFFFFF" strokeWidth="4.5" />
          <path d="M38 74 L54 52 H74 L82 74 M54 52 L62 74 H38" fill="none" stroke="#FFE2B8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="48" y1="48" x2="58" y2="48" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <path d="M74 52 L70 42 H78" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <rect x="78" y="44" width="12" height="10" rx="3" fill="#FFD1DC" />
        </svg>
      );
    case 'mountains':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M18 86 L48 40 L78 86 Z" fill="rgba(255,255,255,0.48)" />
          <path d="M44 86 L72 34 L102 86 Z" fill="#FFFFFF" opacity="0.96" />
          <path d="M62 52 L72 34 L82 52 L76 49 L72 54 L68 49 Z" fill="#FFE8D6" />
          <circle cx="34" cy="34" r="8" fill="#FFE082" />
        </svg>
      );
    case 'beach':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="78" cy="36" r="11" fill="#FFE082" />
          <path d="M22 80 Q40 70 60 80 Q80 90 98 80 V92 H22 Z" fill="#B5E6EB" opacity="0.92" />
          <path d="M48 80 Q50 58 44 44" stroke="#FFF1D6" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M44 44 Q28 40 24 50" stroke="#B8E4C9" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M44 44 Q58 34 66 44" stroke="#B8E4C9" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M44 44 Q42 30 52 26" stroke="#B8E4C9" strokeWidth="5" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'sunset':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M34 72 A26 26 0 0 1 86 72 Z" fill="#FFE082" />
          <line x1="22" y1="74" x2="98" y2="74" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
          <line x1="34" y1="84" x2="86" y2="84" stroke="rgba(255,255,255,0.75)" strokeWidth="4" strokeLinecap="round" />
          <line x1="46" y1="93" x2="74" y2="93" stroke="rgba(255,255,255,0.5)" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'sunrise':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="60" cy="62" r="18" fill="#FFE082" />
          <g stroke="#FFF3B0" strokeWidth="3.5" strokeLinecap="round">
            <line x1="60" y1="30" x2="60" y2="38" />
            <line x1="36" y1="42" x2="42" y2="47" />
            <line x1="84" y1="42" x2="78" y2="47" />
          </g>
          <path d="M24 78 C24 70 32 66 40 68 C44 60 56 58 64 64 C72 60 82 64 84 70 C92 70 96 76 96 82 H24 Z" fill="#FFFFFF" />
        </svg>
      );
    case 'picnic':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M34 58 H86 L80 88 H40 Z" fill="#FFE2B8" />
          <path d="M42 58 C42 36 78 36 78 58" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <line x1="37" y1="68" x2="83" y2="68" stroke="rgba(255,255,255,0.7)" strokeWidth="3" />
          <line x1="39" y1="78" x2="81" y2="78" stroke="rgba(255,255,255,0.7)" strokeWidth="3" />
          <circle cx="52" cy="52" r="7" fill="#F4A5B8" />
          <circle cx="68" cy="52" r="7" fill="#B8E4C9" />
        </svg>
      );
    case 'stargaze':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M68 30 A26 26 0 1 0 90 74 A20 20 0 1 1 68 30 Z" fill="#FFF3B0" />
          <polygon points="78,34 81,41 88,41 82,45 84,52 78,48 72,52 74,45 68,41 75,41" fill="#FFFFFF" />
          <circle cx="38" cy="38" r="3" fill="#FFFFFF" opacity="0.9" />
          <circle cx="44" cy="84" r="2.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="88" cy="60" r="2.5" fill="#FFD1DC" />
        </svg>
      );
    case 'rainy':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M28 60 A32 30 0 0 1 92 60 Z" fill="#FFFFFF" />
          <path d="M60 60 V86 C60 92 52 92 52 86" fill="none" stroke="#FFE2B8" strokeWidth="5" strokeLinecap="round" />
          <line x1="38" y1="70" x2="34" y2="80" stroke="#B5E6EB" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="76" y1="70" x2="72" y2="80" stroke="#B5E6EB" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="86" y1="68" x2="82" y2="76" stroke="#B5E6EB" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'autumn':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M60 26 C82 40 86 64 60 84 C34 64 38 40 60 26 Z" fill="#FFD1A9" />
          <line x1="60" y1="36" x2="60" y2="94" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <line x1="60" y1="54" x2="72" y2="46" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="64" x2="48" y2="56" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="72" x2="70" y2="66" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'snow':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <line x1="60" y1="26" x2="60" y2="94" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
          <line x1="26" y1="60" x2="94" y2="60" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
          <line x1="36" y1="36" x2="84" y2="84" stroke="#D9F2FF" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="84" y1="36" x2="36" y2="84" stroke="#D9F2FF" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="60" cy="60" r="9" fill="#FFFFFF" />
        </svg>
      );
    case 'nowruz':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="60" cy="62" r="24" fill="rgba(217,242,255,0.48)" stroke="#FFFFFF" strokeWidth="4" />
          <ellipse cx="60" cy="64" rx="11" ry="6" fill="#FFB38A" />
          <polygon points="48,64 41,58 41,70" fill="#FFB38A" />
          <circle cx="66" cy="62" r="1.8" fill="#3D3640" />
          <path d="M44 36 Q60 24 76 36" fill="none" stroke="#B8E4C9" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case 'yalda':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          {/* Cute pastel watermelon slice + pomegranate */}
          <path d="M26 60 A34 34 0 0 0 94 60 Z" fill="#B8E4C9" />
          <path d="M32 60 A28 28 0 0 0 88 60 Z" fill="#FFFFFF" />
          <path d="M36 60 A24 24 0 0 0 84 60 Z" fill="#F28A9B" />
          <circle cx="50" cy="68" r="2.2" fill="#4A2D36" />
          <circle cx="60" cy="74" r="2.2" fill="#4A2D36" />
          <circle cx="70" cy="68" r="2.2" fill="#4A2D36" />
          <circle cx="60" cy="40" r="9" fill="#FF9EB0" />
          <path d="M55 32 L57 27 L60 31 L63 27 L65 32" fill="#FF9EB0" />
        </svg>
      );
    case 'home':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M24 60 L60 28 L96 60" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="34" y="58" width="52" height="34" rx="8" fill="#FFFFFF" opacity="0.96" />
          <rect x="52" y="70" width="16" height="22" rx="5" fill="#F4A5B8" />
        </svg>
      );
    case 'keys':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="44" cy="56" r="15" fill="none" stroke="#FFE082" strokeWidth="7" />
          <line x1="57" y1="56" x2="92" y2="56" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
          <line x1="78" y1="56" x2="78" y2="68" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <line x1="88" y1="56" x2="88" y2="65" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <circle cx="44" cy="56" r="4" fill="#FFD1DC" />
        </svg>
      );
    case 'garden':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M40 64 H80 L74 90 H46 Z" fill="#FFE0C2" />
          <rect x="36" y="58" width="48" height="9" rx="4.5" fill="#FFFFFF" />
          <line x1="60" y1="58" x2="60" y2="34" stroke="#B8E4C9" strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="48" cy="46" rx="11" ry="6" transform="rotate(-28 48 46)" fill="#B8E4C9" />
          <ellipse cx="72" cy="46" rx="11" ry="6" transform="rotate(28 72 46)" fill="#B8E4C9" />
          <circle cx="60" cy="31" r="8" fill="#FFD1DC" />
          <circle cx="60" cy="31" r="3" fill="#FFE082" />
        </svg>
      );
    case 'pet':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="40" cy="46" r="8" fill="#FFFFFF" />
          <circle cx="53" cy="37" r="8" fill="#FFFFFF" />
          <circle cx="67" cy="37" r="8" fill="#FFFFFF" />
          <circle cx="80" cy="46" r="8" fill="#FFFFFF" />
          <path d="M60 52 C44 52 36 66 42 78 C46 86 55 83 60 83 C65 83 74 86 78 78 C84 66 76 52 60 52 Z" fill="#FFE2EC" />
        </svg>
      );
    case 'health':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M60 88 C60 88 28 67 28 48 C28 36 37 28 48 28 C54 28 58 32 60 36 C62 32 66 28 72 28 C83 28 92 36 92 48 C92 67 60 88 60 88 Z" fill="#FFFFFF" />
          <rect x="56" y="46" width="8" height="24" rx="3" fill="#5ABFA1" />
          <rect x="48" y="54" width="24" height="8" rx="3" fill="#5ABFA1" />
        </svg>
      );
    case 'fitness':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <rect x="40" y="55" width="40" height="10" rx="5" fill="#FFFFFF" />
          <rect x="30" y="42" width="12" height="36" rx="6" fill="#FFE082" />
          <rect x="78" y="42" width="12" height="36" rx="6" fill="#FFE082" />
          <rect x="22" y="48" width="9" height="24" rx="4.5" fill="#FFD1DC" />
          <rect x="89" y="48" width="9" height="24" rx="4.5" fill="#FFD1DC" />
        </svg>
      );
    case 'spa':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path d="M60 32 C69 46 69 64 60 76 C51 64 51 46 60 32 Z" fill="#FFFFFF" />
          <path d="M60 76 C44 72 34 58 34 44 C46 46 56 58 60 76 Z" fill="#FFD1DC" opacity="0.92" />
          <path d="M60 76 C76 72 86 58 86 44 C74 46 64 58 60 76 Z" fill="#FFD1DC" opacity="0.92" />
          <path d="M28 84 Q60 92 92 84" fill="none" stroke="#B8E4C9" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );
    case 'graduation':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <polygon points="60,34 96,52 60,70 24,52" fill="#FFFFFF" />
          <path d="M40 60 V76 C40 82 50 86 60 86 C70 86 80 82 80 76 V60" fill="#DCE9FA" />
          <line x1="88" y1="56" x2="88" y2="76" stroke="#FFE082" strokeWidth="4" strokeLinecap="round" />
          <circle cx="88" cy="78" r="4.5" fill="#FFE082" />
        </svg>
      );
    case 'savings':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="60" cy="34" r="8" fill="#FFE082" />
          <ellipse cx="60" cy="66" rx="28" ry="20" fill="#FFFFFF" />
          <circle cx="86" cy="66" r="7" fill="#FFD1DC" />
          <circle cx="72" cy="59" r="2.8" fill="#3D4354" />
          <line x1="52" y1="52" x2="68" y2="52" stroke="#F4A5B8" strokeWidth="4" strokeLinecap="round" />
          <rect x="44" y="81" width="7" height="10" rx="3.5" fill="#FFFFFF" />
          <rect x="69" y="81" width="7" height="10" rx="3.5" fill="#FFFFFF" />
        </svg>
      );
    case 'baby':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <circle cx="60" cy="60" r="24" fill="#FFFFFF" />
          <circle cx="52" cy="57" r="3" fill="#3D4354" />
          <circle cx="68" cy="57" r="3" fill="#3D4354" />
          <circle cx="46" cy="63" r="4" fill="#FFD1DC" />
          <circle cx="74" cy="63" r="4" fill="#FFD1DC" />
          <path d="M54 67 Q60 73 66 67" fill="none" stroke="#E8839F" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M56 36 Q60 28 66 34" fill="none" stroke="#FFE082" strokeWidth="4" strokeLinecap="round" />
          <circle cx="88" cy="36" r="3.5" fill="#FFF3B0" />
          <circle cx="32" cy="38" r="3" fill="#D9F2FF" />
        </svg>
      );
    case 'hearts':
    default:
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="rgba(255,255,255,0.16)" />
          <path
            d="M52 86 C52 86 24 66 24 47 C24 36 33 28 43 28 C49 28 52 32 52 36 C52 32 55 28 61 28 C71 28 80 36 80 47 C80 66 52 86 52 86 Z"
            fill="#FFFFFF"
            opacity="0.96"
          />
          <path
            d="M78 78 C78 78 60 66 60 54 C60 47 65 42 72 42 C75 42 78 44 78 47 C78 44 81 42 84 42 C91 42 96 47 96 54 C96 66 78 78 78 78 Z"
            fill="#FFD6E4"
            opacity="0.95"
          />
        </svg>
      );
  }
}

export const PULSE_MOODS = [
  '😊',
  '🥰',
  '🤍',
  '😍',
  '🤗',
  '☕',
  '🍕',
  '🎉',
  '🌿',
  '✈️',
  '🎬',
  '💪',
  '😴',
  '🌧️',
  '🤒',
  '🙏',
];
