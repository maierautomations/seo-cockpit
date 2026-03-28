// CTR benchmarks by position range
// Sources: Sistrix, Backlinko, Advanced Web Ranking
// These are configurable — can be adjusted per industry/site
export const CTR_BENCHMARKS: Record<number, number> = {
  1: 0.315,  // ~28-35%
  2: 0.165,  // ~15-18%
  3: 0.11,   // ~10-12%
  4: 0.07,   // ~6-8%
  5: 0.065,
  6: 0.04,   // ~2-5%
  7: 0.035,
  8: 0.03,
  9: 0.025,
  10: 0.02,
};

// Get expected CTR for a given position
export function getExpectedCtr(position: number): number {
  const rounded = Math.round(position);

  if (rounded <= 0) return CTR_BENCHMARKS[1]!;
  if (rounded <= 10) return CTR_BENCHMARKS[rounded] ?? 0.02;

  // Beyond position 10: rapid decay
  if (rounded <= 20) return 0.01;
  if (rounded <= 30) return 0.005;
  return 0.002;
}

// Calculate CTR deviation: how much the actual CTR differs from the benchmark
// Returns a value from -1 (far below) to +1 (far above)
export function getCtrDeviation(actualCtr: number, position: number): number {
  const expected = getExpectedCtr(position);
  if (expected === 0) return 0;
  return (actualCtr - expected) / expected;
}
