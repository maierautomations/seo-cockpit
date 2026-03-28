import type { RawQueryRow, RawPageRow, PageData, KeywordEntry, DashboardOverview } from '@/types/gsc';

// Merge pages CSV data into PageData array
// Queries CSV enriches with keyword landscape info
export function mergeGscData(
  pages: RawPageRow[],
  queries: RawQueryRow[],
): PageData[] {
  // Pages CSV is the primary source — one entry per URL
  const pageDataList: PageData[] = pages.map((page) => ({
    url: page.url,
    klicks: page.klicks,
    impressionen: page.impressionen,
    ctr: page.ctr,
    position: page.position,
    keywords: [],
    keywordCount: 0,
  }));

  // Queries CSV provides keyword-level data (aggregated across all URLs)
  // Without GSC API, we can't directly map keywords to URLs from CSV exports
  // We store queries as keywords on a virtual "all" level and use the count
  // to estimate keyword diversity per page based on impression share
  const totalImpressions = pages.reduce((sum, p) => sum + p.impressionen, 0);

  if (queries.length > 0 && totalImpressions > 0) {
    // Distribute keyword count proportionally by impression share
    // This is an approximation — GSC API (Phase 3) will provide exact mapping
    for (const pageData of pageDataList) {
      const impressionShare = pageData.impressionen / totalImpressions;
      const estimatedKeywords = Math.max(1, Math.round(queries.length * impressionShare));
      pageData.keywordCount = estimatedKeywords;

      // Assign top queries proportionally as representative keywords
      const startIdx = Math.floor(
        (pageDataList.indexOf(pageData) / pageDataList.length) * queries.length,
      );
      const keywordSlice = queries.slice(startIdx, startIdx + estimatedKeywords);

      pageData.keywords = keywordSlice.map(
        (q): KeywordEntry => ({
          keyword: q.keyword,
          klicks: q.klicks,
          impressionen: q.impressionen,
          ctr: q.ctr,
          position: q.position,
        }),
      );
    }
  } else {
    // No queries CSV — set minimum keyword count of 1
    for (const pageData of pageDataList) {
      pageData.keywordCount = 1;
    }
  }

  return pageDataList;
}

// Calculate dashboard overview aggregates
export function calculateOverview(
  pages: PageData[],
  totalQueryKeywords: number,
): DashboardOverview {
  if (pages.length === 0) {
    return {
      totalKlicks: 0,
      totalImpressionen: 0,
      avgCtr: 0,
      avgPosition: 0,
      totalPages: 0,
      totalKeywords: 0,
    };
  }

  const totalKlicks = pages.reduce((sum, p) => sum + p.klicks, 0);
  const totalImpressionen = pages.reduce((sum, p) => sum + p.impressionen, 0);

  // Weighted average CTR (by impressions)
  const avgCtr =
    totalImpressionen > 0
      ? pages.reduce((sum, p) => sum + p.ctr * p.impressionen, 0) / totalImpressionen
      : 0;

  // Weighted average position (by impressions)
  const avgPosition =
    totalImpressionen > 0
      ? pages.reduce((sum, p) => sum + p.position * p.impressionen, 0) / totalImpressionen
      : 0;

  return {
    totalKlicks,
    totalImpressionen,
    avgCtr,
    avgPosition,
    totalPages: pages.length,
    totalKeywords: totalQueryKeywords,
  };
}
