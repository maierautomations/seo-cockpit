import type { PageData } from '@/types/gsc';
import type { ScoredPage } from '@/types/scoring';
import { getExpectedCtr, getCtrDeviation } from './benchmarks';
import { classifyPage } from './categories';

// Normalize impressions to 0-100 using log scale
// Log scale prevents high-impression pages from completely dominating
function normalizeImpressions(impressions: number, maxImpressions: number): number {
  if (impressions <= 0 || maxImpressions <= 0) return 0;
  const logValue = Math.log10(impressions + 1);
  const logMax = Math.log10(maxImpressions + 1);
  return (logValue / logMax) * 100;
}

// Position score: peak at 8-15 (highest optimization potential)
// Low for position 1-3 (already ranking well) and 30+ (too far gone)
function scorePosition(position: number): number {
  if (position <= 0) return 0;
  if (position <= 3) return 20; // already good
  if (position <= 5) return 40;
  if (position <= 7) return 60;
  if (position <= 10) return 85;
  if (position <= 15) return 100; // sweet spot
  if (position <= 20) return 80;
  if (position <= 30) return 40;
  return 10; // too far gone
}

// CTR deviation score: bigger gap = bigger opportunity
function scoreCtrDeviation(ctr: number, position: number): number {
  const deviation = getCtrDeviation(ctr, position);
  // Larger negative deviation = more opportunity
  if (deviation <= -0.5) return 100;
  if (deviation <= -0.3) return 80;
  if (deviation <= -0.1) return 50;
  if (deviation <= 0.1) return 30;
  return 10; // CTR is at or above benchmark
}

// Keyword count score: more keywords = more ranking signals
function scoreKeywordCount(count: number): number {
  if (count <= 1) return 20;
  if (count <= 3) return 40;
  if (count <= 5) return 60;
  if (count <= 10) return 80;
  return 100;
}

// Estimate potential additional clicks per quarter
function estimatePotential(
  impressions: number,
  currentCtr: number,
  position: number,
): number {
  const expectedCtr = getExpectedCtr(Math.max(1, position - 3)); // assume +3 position improvement
  const ctrGain = Math.max(0, expectedCtr - currentCtr);
  // Quarterly: impressions are typically for 3 months from GSC
  return Math.round(ctrGain * impressions);
}

// Score all pages and return sorted by score descending
export function scorePages(pages: PageData[]): ScoredPage[] {
  const maxImpressions = Math.max(...pages.map((p) => p.impressionen), 1);

  const scored: ScoredPage[] = pages.map((page) => {
    const impressionScore = normalizeImpressions(page.impressionen, maxImpressions);
    const positionScore = scorePosition(page.position);
    const ctrDeviationScore = scoreCtrDeviation(page.ctr, page.position);
    const keywordCountScore = scoreKeywordCount(page.keywordCount);

    // Weighted composite score (from PRD)
    const score =
      impressionScore * 0.4 +
      positionScore * 0.3 +
      ctrDeviationScore * 0.2 +
      keywordCountScore * 0.1;

    const category = classifyPage(
      page.position,
      page.impressionen,
      page.ctr,
      page.keywordCount,
    );

    const estimatedPotential = estimatePotential(
      page.impressionen,
      page.ctr,
      page.position,
    );

    return {
      ...page,
      score,
      category,
      estimatedPotential,
      impressionScore,
      positionScore,
      ctrDeviationScore,
      keywordCountScore,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored;
}
