import type { PaletteId, ThemeMode } from '../types/app';

export interface PaletteDefinition {
  id: PaletteId;
  name: string;
  /** Primary pastel accent for Light mode (WCAG-AA with white text) */
  seed: string;
  /** Luminous pastel accent for Dark & AMOLED modes */
  accentDark: string;
  /** Whisper-soft pastel wash for active pills & soft icon backgrounds */
  softLight: string;
  /** Crisp readable pastel ink on softLight */
  softInkLight: string;
  /** Postcard dual-tone gradient start (Light) */
  heroStart: string;
  /** Postcard dual-tone gradient end (Light) */
  heroEnd: string;
  /** Postcard dual-tone gradient start (Dark / AMOLED) */
  heroDarkStart: string;
  /** Postcard dual-tone gradient end (Dark / AMOLED) */
  heroDarkEnd: string;
}

/**
 * 24 Curated Studio Pastel Palettes (3 rows of 8) — "Soft Paper & Studio Pastel".
 * Inspired by Scandinavian/Japanese minimalist craft (Things 3 & Apple Journal):
 * Pure snow-gray canvas (#F7F8FB) with crisp white cards in Light mode,
 * pure night slate (#101218) with zero muddy tint in Dark mode,
 * and radiant dual-tone pastel postcards for the Hero countdown showcase.
 */
export const PALETTES: PaletteDefinition[] = [
  // Row 1 — Signature Studio Pastels
  {
    id: 'rose',
    name: 'رز به یاسی',
    seed: '#D96B8C',
    accentDark: '#F4A3BD',
    softLight: '#FDF0F4',
    softInkLight: '#8E3452',
    heroStart: '#EB8AA8',
    heroEnd: '#B59DF0',
    heroDarkStart: '#8C415A',
    heroDarkEnd: '#634F99',
  },
  {
    id: 'ocean',
    name: 'آسمانی به فیروزه‌ای',
    seed: '#4E96D8',
    accentDark: '#8CC9F8',
    softLight: '#EEF6FE',
    softInkLight: '#24588A',
    heroStart: '#6EB2EE',
    heroEnd: '#77D1D8',
    heroDarkStart: '#346696',
    heroDarkEnd: '#2E767E',
  },
  {
    id: 'cobalt',
    name: 'پروینکل به فیروزه‌ای',
    seed: '#687EE0',
    accentDark: '#A3B3FF',
    softLight: '#EFF2FE',
    softInkLight: '#334696',
    heroStart: '#8498F0',
    heroEnd: '#78CEDE',
    heroDarkStart: '#44559E',
    heroDarkEnd: '#357485',
  },
  {
    id: 'sage',
    name: 'نعنایی به آسمانی',
    seed: '#46A489',
    accentDark: '#82DFC4',
    softLight: '#ECF9F4',
    softInkLight: '#20634F',
    heroStart: '#6EC8AE',
    heroEnd: '#7FC2F0',
    heroDarkStart: '#2E7863',
    heroDarkEnd: '#35688F',
  },
  {
    id: 'lavender',
    name: 'یاسی به صورتی',
    seed: '#8674DC',
    accentDark: '#BEB2FA',
    softLight: '#F3F0FE',
    softInkLight: '#493994',
    heroStart: '#A392EE',
    heroEnd: '#ECA1C4',
    heroDarkStart: '#5C4D9E',
    heroDarkEnd: '#8C4E6F',
  },
  {
    id: 'terracotta',
    name: 'هلویی به رز',
    seed: '#DC7F65',
    accentDark: '#F7AF99',
    softLight: '#FEF2EE',
    softInkLight: '#8C402B',
    heroStart: '#F09D82',
    heroEnd: '#EC93B0',
    heroDarkStart: '#99503A',
    heroDarkEnd: '#914962',
  },
  {
    id: 'teal',
    name: 'آکوا به نعنایی',
    seed: '#429EA8',
    accentDark: '#80D8E2',
    softLight: '#ECF8FA',
    softInkLight: '#1E5C63',
    heroStart: '#66C3CD',
    heroEnd: '#8AD9B8',
    heroDarkStart: '#2C7078',
    heroDarkEnd: '#3B7D63',
  },
  {
    id: 'emerald',
    name: 'زمردی به لیمویی',
    seed: '#4FA47B',
    accentDark: '#88DBB2',
    softLight: '#EDF9F3',
    softInkLight: '#246345',
    heroStart: '#70C49B',
    heroEnd: '#A9D991',
    heroDarkStart: '#347857',
    heroDarkEnd: '#577E44',
  },

  // Row 2 — Cozy Warm & Muted Pastels
  {
    id: 'amber',
    name: 'عسلی به هلویی',
    seed: '#CC8E3E',
    accentDark: '#F2C382',
    softLight: '#FEF6EB',
    softInkLight: '#7D5119',
    heroStart: '#E8B36A',
    heroEnd: '#F09E8B',
    heroDarkStart: '#916429',
    heroDarkEnd: '#965446',
  },
  {
    id: 'plum',
    name: 'ارغوانی به یاسی',
    seed: '#A76FC4',
    accentDark: '#D8A9F0',
    softLight: '#F7F0FC',
    softInkLight: '#61367A',
    heroStart: '#C28CDE',
    heroEnd: '#9BA3F0',
    heroDarkStart: '#73478C',
    heroDarkEnd: '#515799',
  },
  {
    id: 'crimson',
    name: 'توت‌فرنگی به مرجانی',
    seed: '#D9667B',
    accentDark: '#F59EB0',
    softLight: '#FDF0F2',
    softInkLight: '#8A2F40',
    heroStart: '#EE869A',
    heroEnd: '#F2A78D',
    heroDarkStart: '#944151',
    heroDarkEnd: '#995C47',
  },
  {
    id: 'coffee',
    name: 'لاته به کارامل',
    seed: '#9C7B63',
    accentDark: '#D4B49C',
    softLight: '#F7F2EE',
    softInkLight: '#5C4433',
    heroStart: '#B99880',
    heroEnd: '#D6B69C',
    heroDarkStart: '#735845',
    heroDarkEnd: '#856B55',
  },
  {
    id: 'indigo',
    name: 'نیلی به آسمان شب',
    seed: '#7470D9',
    accentDark: '#B0ACF7',
    softLight: '#F1F0FE',
    softInkLight: '#3C388E',
    heroStart: '#908CEB',
    heroEnd: '#82B8F0',
    heroDarkStart: '#504C9E',
    heroDarkEnd: '#3E6B99',
  },
  {
    id: 'olive',
    name: 'ماچا به سیب سبز',
    seed: '#769B5A',
    accentDark: '#AED492',
    softLight: '#F2F8EE',
    softInkLight: '#415E2C',
    heroStart: '#95B978',
    heroEnd: '#85C7A4',
    heroDarkStart: '#516E3B',
    heroDarkEnd: '#3E7558',
  },
  {
    id: 'sunset',
    name: 'غروب زردآلو و بنفش',
    seed: '#DF7F6A',
    accentDark: '#F7AE9E',
    softLight: '#FEF2EF',
    softInkLight: '#8A3E2E',
    heroStart: '#F29B86',
    heroEnd: '#C697E8',
    heroDarkStart: '#995140',
    heroDarkEnd: '#6E4C8C',
  },
  {
    id: 'monochrome',
    name: 'سنگی به نقره‌ای',
    seed: '#5A6578',
    accentDark: '#B4BECD',
    softLight: '#F1F3F7',
    softInkLight: '#323A48',
    heroStart: '#7C889C',
    heroEnd: '#A6B2C4',
    heroDarkStart: '#485161',
    heroDarkEnd: '#636E82',
  },

  // Row 3 — New Dreamy Studio Pastel Row (8 Brand-New Palettes!)
  {
    id: 'sakura',
    name: 'شکوفه ساکورا',
    seed: '#E07AA0',
    accentDark: '#F7B0CB',
    softLight: '#FEF1F6',
    softInkLight: '#8F3859',
    heroStart: '#F4A2C1',
    heroEnd: '#F7C1A6',
    heroDarkStart: '#994E6B',
    heroDarkEnd: '#996A52',
  },
  {
    id: 'butter',
    name: 'کره‌ای وانیلی',
    seed: '#C8983C',
    accentDark: '#F2D085',
    softLight: '#FEF9EC',
    softInkLight: '#7A5816',
    heroStart: '#EBC773',
    heroEnd: '#F2B28A',
    heroDarkStart: '#917430',
    heroDarkEnd: '#965F40',
  },
  {
    id: 'pistachio',
    name: 'پسته‌ای خامه‌ای',
    seed: '#64A372',
    accentDark: '#9CD9A9',
    softLight: '#EFF9F1',
    softInkLight: '#2E633A',
    heroStart: '#8BCE99',
    heroEnd: '#9CD4C6',
    heroDarkStart: '#467D52',
    heroDarkEnd: '#46786D',
  },
  {
    id: 'glacier',
    name: 'یخچال آسمانی',
    seed: '#5298C8',
    accentDark: '#94D0F5',
    softLight: '#EEF7FC',
    softInkLight: '#235A80',
    heroStart: '#82C2EB',
    heroEnd: '#A7B8F2',
    heroDarkStart: '#3B6F94',
    heroDarkEnd: '#556299',
  },
  {
    id: 'lilac',
    name: 'ارکیده یاسی',
    seed: '#9A76D6',
    accentDark: '#CEB4FA',
    softLight: '#F5F1FD',
    softInkLight: '#56398C',
    heroStart: '#BA98EE',
    heroEnd: '#94B2F2',
    heroDarkStart: '#6D4F9E',
    heroDarkEnd: '#4B6399',
  },
  {
    id: 'coral',
    name: 'مرجانی ملایم',
    seed: '#E07572',
    accentDark: '#F7A9A6',
    softLight: '#FEF1F0',
    softInkLight: '#8E3735',
    heroStart: '#F29693',
    heroEnd: '#F2B399',
    heroDarkStart: '#994A48',
    heroDarkEnd: '#96604B',
  },
  {
    id: 'seafoam',
    name: 'کف دریا',
    seed: '#48A69B',
    accentDark: '#87DDD3',
    softLight: '#ECF9F7',
    softInkLight: '#21635C',
    heroStart: '#70CCC2',
    heroEnd: '#98D4A8',
    heroDarkStart: '#307A72',
    heroDarkEnd: '#497D58',
  },
  {
    id: 'champagne',
    name: 'شامپاینی لطیف',
    seed: '#B48278',
    accentDark: '#E3B9B0',
    softLight: '#FAF3F1',
    softInkLight: '#6E463E',
    heroStart: '#CFA49B',
    heroEnd: '#DEB6C8',
    heroDarkStart: '#825B53',
    heroDarkEnd: '#8A6073',
  },
];

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

export function resolveThemeMode(mode: ThemeMode): 'light' | 'dark' | 'amoled' {
  if (mode === 'auto') {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  return mode;
}

export function applyMaterialYouTheme(paletteId: PaletteId, themeMode: ThemeMode): 'light' | 'dark' | 'amoled' {
  const pal = PALETTES.find((p) => p.id === paletteId) || PALETTES[0];
  const resolved = resolveThemeMode(themeMode);
  const root = document.documentElement;
  const body = document.body;

  body.setAttribute('data-palette', pal.id);
  body.setAttribute('data-theme-resolved', resolved);

  if (resolved === 'dark' || resolved === 'amoled') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  let tokens: Record<string, string>;

  if (resolved === 'light') {
    tokens = {
      '--seed-color': pal.seed,
      '--seed-secondary': pal.heroEnd,
      '--md-primary': pal.seed,
      '--md-on-primary': '#FFFFFF',
      '--md-primary-container': pal.softLight,
      '--md-on-primary-container': pal.softInkLight,
      '--md-secondary': pal.seed,
      '--md-secondary-container': pal.softLight,
      '--md-on-secondary-container': pal.softInkLight,
      // Soft Paper & Studio Pastel: Pure snow-gray canvas (#F7F8FB) + pure crisp white cards (#FFFFFF)
      '--md-bg': '#F7F8FB',
      '--md-surface': '#F7F8FB',
      '--md-surface-low': '#F1F3F8',
      '--md-surface-container': '#ECEFF5',
      '--md-surface-high': '#E2E6EF',
      '--md-card': '#FFFFFF',
      '--md-header-bg': 'rgba(247, 248, 251, 0.86)',
      '--md-nav-bg': 'rgba(255, 255, 255, 0.92)',
      '--md-on-surface': '#171B24',
      '--md-on-surface-variant': '#636B7C',
      '--md-outline': '#C8D0DF',
      '--md-outline-variant': '#E6E9F0',
      '--md-success': '#2C916E',
      '--md-success-container': '#EAF8F2',
      '--md-warning': '#B87620',
      '--md-warning-container': '#FEF6E9',
      '--md-danger': '#CC4B60',
      '--md-danger-container': '#FDF0F2',
      '--md-hero-start': pal.heroStart,
      '--md-hero-end': pal.heroEnd,
      '--md-shadow-1': '0 1px 2px rgba(15, 23, 42, 0.035), 0 4px 12px rgba(15, 23, 42, 0.02)',
      '--md-shadow-2': '0 12px 30px rgba(15, 23, 42, 0.09), 0 2px 8px rgba(15, 23, 42, 0.04)',
      // Multi-Pastel Section Harmony
      '--pastel-sky': '#4A90D6',
      '--pastel-sky-soft': '#EEF6FE',
      '--pastel-rose': '#D96B8C',
      '--pastel-rose-soft': '#FDF0F4',
      '--pastel-mint': '#3A9D80',
      '--pastel-mint-soft': '#EBF8F4',
      '--pastel-lavender': '#8472D9',
      '--pastel-lavender-soft': '#F3F0FE',
      '--pastel-amber': '#C58734',
      '--pastel-amber-soft': '#FEF6EA',
    };
  } else if (resolved === 'dark') {
    tokens = {
      '--seed-color': pal.accentDark,
      '--seed-secondary': pal.heroDarkEnd,
      '--md-primary': pal.accentDark,
      '--md-on-primary': '#101218',
      '--md-primary-container': hexToRgba(pal.accentDark, 0.15),
      '--md-on-primary-container': pal.accentDark,
      '--md-secondary': pal.accentDark,
      '--md-secondary-container': hexToRgba(pal.accentDark, 0.15),
      '--md-on-secondary-container': pal.accentDark,
      // Pure Night Slate (#101218) with zero purple/brown mud
      '--md-bg': '#101218',
      '--md-surface': '#101218',
      '--md-surface-low': '#171A23',
      '--md-surface-container': '#1E222E',
      '--md-surface-high': '#262B3A',
      '--md-card': '#161922',
      '--md-header-bg': 'rgba(16, 18, 24, 0.88)',
      '--md-nav-bg': 'rgba(22, 25, 34, 0.92)',
      '--md-on-surface': '#F2F4F8',
      '--md-on-surface-variant': '#949EB2',
      '--md-outline': '#4B5469',
      '--md-outline-variant': '#242938',
      '--md-success': '#7ED9B8',
      '--md-success-container': 'rgba(126, 217, 184, 0.13)',
      '--md-warning': '#F0C57D',
      '--md-warning-container': 'rgba(240, 197, 125, 0.13)',
      '--md-danger': '#F29AA8',
      '--md-danger-container': 'rgba(242, 154, 168, 0.13)',
      '--md-hero-start': pal.heroDarkStart,
      '--md-hero-end': pal.heroDarkEnd,
      '--md-shadow-1': '0 1px 4px rgba(0, 0, 0, 0.28)',
      '--md-shadow-2': '0 12px 32px rgba(0, 0, 0, 0.48)',
      // Multi-Pastel Section Harmony (Dark)
      '--pastel-sky': '#8CC9F8',
      '--pastel-sky-soft': 'rgba(140, 201, 248, 0.14)',
      '--pastel-rose': '#F4A3BD',
      '--pastel-rose-soft': 'rgba(244, 163, 189, 0.14)',
      '--pastel-mint': '#82DFC4',
      '--pastel-mint-soft': 'rgba(130, 223, 196, 0.14)',
      '--pastel-lavender': '#BEB2FA',
      '--pastel-lavender-soft': 'rgba(190, 178, 250, 0.14)',
      '--pastel-amber': '#F2C382',
      '--pastel-amber-soft': 'rgba(242, 195, 130, 0.14)',
    };
  } else {
    tokens = {
      '--seed-color': pal.accentDark,
      '--seed-secondary': pal.heroDarkEnd,
      '--md-primary': pal.accentDark,
      '--md-on-primary': '#000000',
      '--md-primary-container': hexToRgba(pal.accentDark, 0.16),
      '--md-on-primary-container': pal.accentDark,
      '--md-secondary': pal.accentDark,
      '--md-secondary-container': hexToRgba(pal.accentDark, 0.16),
      '--md-on-secondary-container': pal.accentDark,
      '--md-bg': '#000000',
      '--md-surface': '#000000',
      '--md-surface-low': '#101218',
      '--md-surface-container': '#181B24',
      '--md-surface-high': '#212532',
      '--md-card': '#0B0D12',
      '--md-header-bg': 'rgba(0, 0, 0, 0.9)',
      '--md-nav-bg': 'rgba(11, 13, 18, 0.94)',
      '--md-on-surface': '#FAFAFC',
      '--md-on-surface-variant': '#949EB2',
      '--md-outline': '#4B5469',
      '--md-outline-variant': '#1E222E',
      '--md-success': '#7ED9B8',
      '--md-success-container': 'rgba(126, 217, 184, 0.15)',
      '--md-warning': '#F0C57D',
      '--md-warning-container': 'rgba(240, 197, 125, 0.15)',
      '--md-danger': '#F29AA8',
      '--md-danger-container': 'rgba(242, 154, 168, 0.15)',
      '--md-hero-start': pal.heroDarkStart,
      '--md-hero-end': pal.heroDarkEnd,
      '--md-shadow-1': '0 2px 10px rgba(0, 0, 0, 0.6)',
      '--md-shadow-2': '0 12px 32px rgba(0, 0, 0, 0.85)',
      // Multi-Pastel Section Harmony (AMOLED)
      '--pastel-sky': '#8CC9F8',
      '--pastel-sky-soft': 'rgba(140, 201, 248, 0.15)',
      '--pastel-rose': '#F4A3BD',
      '--pastel-rose-soft': 'rgba(244, 163, 189, 0.15)',
      '--pastel-mint': '#82DFC4',
      '--pastel-mint-soft': 'rgba(130, 223, 196, 0.15)',
      '--pastel-lavender': '#BEB2FA',
      '--pastel-lavender-soft': 'rgba(190, 178, 250, 0.15)',
      '--pastel-amber': '#F2C382',
      '--pastel-amber-soft': 'rgba(242, 195, 130, 0.15)',
    };
  }

  Object.entries(tokens).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });

  const metaTheme = document.getElementById('metaThemeColor');
  if (metaTheme) {
    metaTheme.setAttribute('content', tokens['--md-bg']);
  }

  return resolved;
}
