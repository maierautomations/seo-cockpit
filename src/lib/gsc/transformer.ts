import type { GscAnalyticsRow } from '@/types/gsc-api';
import type { PageData, KeywordEntry } from '@/types/gsc';

// Transform raw GSC API rows (query×page dimension) into PageData[].
// Unlike the CSV merger, this provides REAL keyword-to-URL mapping.
export function transformGscData(rows: GscAnalyticsRow[]): PageData[] {
  // Group rows by page URL
  const pageMap = new Map<string, GscAnalyticsRow[]>();

  for (const row of rows) {
    const pageUrl = row.keys[1];
    const existing = pageMap.get(pageUrl);
    if (existing) {
      existing.push(row);
    } else {
      pageMap.set(pageUrl, [row]);
    }
  }

  const pages: PageData[] = [];

  for (const [url, pageRows] of pageMap) {
    // Aggregate page-level metrics
    let totalClicks = 0;
    let totalImpressions = 0;
    let weightedPosition = 0;
    let weightedCtr = 0;

    const keywords: KeywordEntry[] = [];

    for (const row of pageRows) {
      totalClicks += row.clicks;
      totalImpressions += row.impressions;
      weightedPosition += row.position * row.impressions;
      weightedCtr += row.ctr * row.impressions;

      keywords.push({
        keyword: row.keys[0],
        klicks: row.clicks,
        impressionen: row.impressions,
        ctr: row.ctr,
        position: row.position,
      });
    }

    // Sort keywords by impressions (most important first)
    keywords.sort((a, b) => b.impressionen - a.impressionen);

    pages.push({
      url,
      klicks: totalClicks,
      impressionen: totalImpressions,
      ctr: totalImpressions > 0 ? weightedCtr / totalImpressions : 0,
      position: totalImpressions > 0 ? weightedPosition / totalImpressions : 0,
      keywords,
      keywordCount: keywords.length,
    });
  }

  return pages;
}
