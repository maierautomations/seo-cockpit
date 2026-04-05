// Page type filter types for URL-based dashboard filtering

export type PageTypePresetId = 'nur-artikel' | 'artikel-vergleiche' | 'alle';

export interface PageTypePreset {
  id: PageTypePresetId;
  label: string;
  description: string;
  includePatterns: string[]; // URL path substrings to include; empty = all
}

export interface UrlFilterRule {
  pattern: string;
  type: 'include' | 'exclude';
}

export interface PageTypeSettings {
  activePreset: PageTypePresetId;
  customRules: UrlFilterRule[];
}

export interface UrlPrefixGroup {
  prefix: string;
  count: number;
  exampleUrl: string;
}
