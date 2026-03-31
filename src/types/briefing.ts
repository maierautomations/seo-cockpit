// Content Briefing types for new article planning

export interface BriefingKeyword {
  keyword: string;
  impressionen: number;
  position: number;
  source: 'gsc' | 'input';
}

export interface BriefingHeading {
  level: 'h1' | 'h2';
  text: string;
  note?: string;
}

export interface BriefingElement {
  type:
    | 'infobox'
    | 'vergleichstabelle'
    | 'faq'
    | 'pro-contra'
    | 'timeline'
    | 'zitat';
  label: string;
  description: string;
  placement: string;
}

export interface BriefingFaq {
  question: string;
  answerHint: string;
}

export interface BriefingYoast {
  keyphrase: string;
  seoTitle: string;
  slug: string;
  metaDescription: string;
}

export interface BriefingInternalLink {
  url: string;
  anchorSuggestion: string;
  matchingKeywords: string[];
  impressionen: number;
}

export interface ContentBriefing {
  hauptkeyword: string;
  nebenkeywords: string[];
  generatedAt: string;
  headings: BriefingHeading[];
  keywordCluster: BriefingKeyword[];
  elements: BriefingElement[];
  faqQuestions: BriefingFaq[];
  yoast: BriefingYoast;
  internalLinks: BriefingInternalLink[];
  // SERP context (reference, collapsible in UI)
  serpTopResults: {
    position: number;
    title: string;
    url: string;
    domain: string;
  }[];
  titlePatterns: { pattern: string; count: number; total: number }[];
  topicCoverage: { topic: string; count: number; total: number }[];
  peopleAlsoAsk: string[];
  featuredSnippetChance: { type: string; recommendation: string };
}

export interface BriefingRequest {
  hauptkeyword: string;
  nebenkeywords: string[];
  keywordCluster: BriefingKeyword[];
  internalLinkCandidates: BriefingInternalLink[];
}

export interface BriefingResponse {
  success: boolean;
  data?: ContentBriefing;
  error?: string;
}
