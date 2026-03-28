// Raw row from "Suchanfragen" CSV (Google Search Console export)
export interface RawQueryRow {
  keyword: string;
  klicks: number;
  impressionen: number;
  ctr: number; // decimal: 0.013 = 1.3%
  position: number;
}

// Raw row from "Seiten" CSV (Google Search Console export)
export interface RawPageRow {
  url: string;
  klicks: number;
  impressionen: number;
  ctr: number; // decimal: 0.013 = 1.3%
  position: number;
}

// A keyword associated with a URL (after merge or from detailed export)
export interface KeywordEntry {
  keyword: string;
  klicks: number;
  impressionen: number;
  ctr: number;
  position: number;
}

// Merged URL-level data — the core entity in the app
export interface PageData {
  url: string;
  klicks: number;
  impressionen: number;
  ctr: number; // weighted average CTR
  position: number; // weighted average position
  keywords: KeywordEntry[];
  keywordCount: number;
}

// Dashboard KPI overview aggregates
export interface DashboardOverview {
  totalKlicks: number;
  totalImpressionen: number;
  avgCtr: number;
  avgPosition: number;
  totalPages: number;
  totalKeywords: number;
}
