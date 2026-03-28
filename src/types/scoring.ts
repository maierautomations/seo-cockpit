import type { KeywordEntry } from './gsc';

export type CategoryId =
  | 'content-problem'
  | 'packaging-problem'
  | 'quick-win'
  | 'low-priority';

export interface CategoryInfo {
  id: CategoryId;
  label: string; // German UI label
  emoji: string;
  color: string; // Tailwind color class
  description: string; // German description of recommended action
}

export interface ScoredPage {
  url: string;
  klicks: number;
  impressionen: number;
  ctr: number;
  position: number;
  keywords: KeywordEntry[];
  keywordCount: number;
  // Scoring results
  score: number; // 0-100 composite score
  category: CategoryId;
  estimatedPotential: number; // estimated additional clicks/quarter
  // Sub-scores for transparency
  impressionScore: number;
  positionScore: number;
  ctrDeviationScore: number;
  keywordCountScore: number;
}
