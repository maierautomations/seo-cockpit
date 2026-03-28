import type { CategoryId, CategoryInfo } from '@/types/scoring';
import { getCtrDeviation } from './benchmarks';

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  'content-problem': {
    id: 'content-problem',
    label: 'Content-Problem',
    emoji: '🟢',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Artikel inhaltlich verbessern: Tiefe, Struktur, fehlende Elemente',
  },
  'packaging-problem': {
    id: 'packaging-problem',
    label: 'Packaging-Problem',
    emoji: '🟡',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: 'SEO-Titel und Meta-Description optimieren',
  },
  'quick-win': {
    id: 'quick-win',
    label: 'Quick Win',
    emoji: '🔵',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    description: 'Gezielte Keyword-Integration, interne Links',
  },
  'low-priority': {
    id: 'low-priority',
    label: 'Low Priority',
    emoji: '⚪',
    color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    description: 'Erstmal ignorieren oder archivieren',
  },
};

// Classify a page into a category based on its metrics
export function classifyPage(
  position: number,
  impressionen: number,
  ctr: number,
  keywordCount: number,
): CategoryId {
  const ctrDeviation = getCtrDeviation(ctr, position);

  // Content-Problem: Position 8-20, high impressions
  if (position >= 8 && position <= 20 && impressionen >= 3000) {
    return 'content-problem';
  }

  // Packaging-Problem: Position 1-10, CTR significantly below benchmark
  if (position >= 1 && position <= 10 && ctrDeviation < -0.3) {
    return 'packaging-problem';
  }

  // Quick Win: Position 6-12, moderate impressions, few keywords
  if (
    position >= 6 &&
    position <= 12 &&
    impressionen >= 500 &&
    impressionen < 3000 &&
    keywordCount <= 5
  ) {
    return 'quick-win';
  }

  // Low Priority: low impressions or very poor position
  if (impressionen < 500 || position > 20) {
    return 'low-priority';
  }

  // Default: classify by dominant signal
  if (position > 10) return 'content-problem';
  if (ctrDeviation < -0.2) return 'packaging-problem';
  return 'quick-win';
}
