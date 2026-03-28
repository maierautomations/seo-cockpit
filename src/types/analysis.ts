import type { CategoryId } from './scoring';

export interface HeadingInfo {
  text: string;
  containsKeyword: boolean;
}

export interface StructureCheck {
  h1: { present: boolean; containsKeyword: boolean; text: string };
  h2s: HeadingInfo[];
  h3s: { text: string }[];
  faqBlock: boolean;
  infoboxCount: number;
  comparisonTable: boolean;
  sourceBlock: { present: boolean; count: number };
}

export interface SeoCheck {
  metaDescription: { present: boolean; length: number; text: string };
  seoTitle: { length: number; text: string; inRange: boolean };
  altTexts: { total: number; missing: number };
  internalLinks: { count: number; urls: string[] };
}

export interface FinancialDataPoint {
  text: string;
  status: 'ok' | 'warning' | 'outdated';
  note: string;
}

export interface KeywordCoverage {
  keyword: string;
  count: number;
  inH1: boolean;
  inH2: boolean;
  inMeta: boolean;
}

export interface ContentAnalysis {
  financialData: FinancialDataPoint[];
  keywordCoverage: KeywordCoverage;
  contentDepth: 'shallow' | 'adequate' | 'deep';
  missingTopics: string[];
}

export interface FaqEntry {
  q: string;
  a: string;
}

export interface AiSuggestions {
  seoTitles: string[]; // 3 variants
  metaDescription: string;
  faqQuestions: FaqEntry[]; // 3-5
  missingContent: string[];
}

export interface ArticleAnalysis {
  url: string;
  title: string;
  fetchedAt: string; // ISO timestamp
  structure: StructureCheck;
  seo: SeoCheck;
  content: ContentAnalysis | null; // null until AI analysis triggered
  suggestions: AiSuggestions | null; // null until AI analysis triggered
  markdownContent: string;
}

// API request/response types
export interface AnalyzeArticleRequest {
  url: string;
  mainKeyword: string;
  keywords: string[];
  category: CategoryId;
}

export interface FetchArticleResponse {
  success: boolean;
  markdown?: string;
  html?: string;
  title?: string;
  metaDescription?: string;
  error?: string;
}

export interface AnalyzeArticleResponse {
  success: boolean;
  data?: ArticleAnalysis;
  error?: string;
}
