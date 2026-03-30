// SERP analysis types

export interface SerpResult {
  position: number;
  title: string;
  url: string;
  description: string;
  domain: string;
}

export interface FeaturedSnippet {
  type: 'paragraph' | 'list' | 'table' | 'none';
  title: string;
  content: string;
  url: string;
}

export interface PeopleAlsoAsk {
  question: string;
}

// Raw SERP API response (abstracted — works with ValueSERP, SerpAPI, etc.)
export interface SerpApiResponse {
  keyword: string;
  organicResults: SerpResult[];
  featuredSnippet: FeaturedSnippet | null;
  peopleAlsoAsk: PeopleAlsoAsk[];
  totalResults: number;
}

// Analysis results

export interface TitlePattern {
  pattern: string;
  count: number;
  total: number; // out of how many
  examples: string[];
}

export interface TopicCoverage {
  topic: string;
  count: number;
  total: number;
}

export interface GapItem {
  topic: string;
  competitorCount: number;
  total: number;
  recommendation: string;
}

export interface FeaturedSnippetChance {
  type: 'paragraph' | 'list' | 'table' | 'none';
  recommendation: string;
  currentSnippetUrl: string | null;
}

export interface SerpAnalysis {
  keyword: string;
  analyzedAt: string; // ISO timestamp
  organicResults: SerpResult[];
  titlePatterns: TitlePattern[];
  topicCoverage: TopicCoverage[];
  gaps: GapItem[];
  featuredSnippetChance: FeaturedSnippetChance;
  peopleAlsoAsk: string[];
}

// API request/response
export interface SerpAnalysisRequest {
  keyword: string;
  ownUrl?: string; // URL of user's article for gap analysis
  ownContent?: string; // markdown of own article
}

export interface SerpAnalysisResponse {
  success: boolean;
  data?: SerpAnalysis;
  error?: string;
}
