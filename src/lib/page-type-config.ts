import type { PageTypePresetId, PageTypePreset, PageTypeSettings } from '@/types/page-type-filter';

export const PAGE_TYPE_PRESETS: Record<PageTypePresetId, PageTypePreset> = {
  'nur-artikel': {
    id: 'nur-artikel',
    label: 'Nur Artikel',
    description: 'Nur /artikel/... URLs',
    includePatterns: ['/artikel/'],
  },
  'artikel-vergleiche': {
    id: 'artikel-vergleiche',
    label: 'Artikel + Vergleiche',
    description: '/artikel/ und /vergleich/ URLs',
    includePatterns: ['/artikel/', '/vergleich/'],
  },
  'alle': {
    id: 'alle',
    label: 'Alle Seiten',
    description: 'Alle URLs ohne Filter',
    includePatterns: [],
  },
};

export const PRESET_ORDER: PageTypePresetId[] = [
  'nur-artikel',
  'artikel-vergleiche',
  'alle',
];

export const DEFAULT_PAGE_TYPE_SETTINGS: PageTypeSettings = {
  activePreset: 'nur-artikel',
  customRules: [],
};
