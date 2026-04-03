import type { ScoredPage, CategoryId } from '@/types/scoring';
import type { KeywordEntry, DashboardOverview } from '@/types/gsc';
import type { TablesInsert, Tables } from '@/types/database';

// Sub-scores stored as JSONB in the pages table
interface SubScores {
  impressionScore: number;
  positionScore: number;
  ctrDeviationScore: number;
  keywordCountScore: number;
}

// --- App → DB ---

export function scoredPageToDbRow(
  page: ScoredPage,
  importId: string,
  userId: string,
): TablesInsert<'pages'> {
  const subScores: SubScores = {
    impressionScore: page.impressionScore,
    positionScore: page.positionScore,
    ctrDeviationScore: page.ctrDeviationScore,
    keywordCountScore: page.keywordCountScore,
  };

  return {
    import_id: importId,
    user_id: userId,
    url: page.url,
    clicks: page.klicks,
    impressions: page.impressionen,
    ctr: page.ctr,
    position: page.position,
    keyword_count: page.keywordCount,
    score: page.score,
    category: page.category,
    estimated_potential: page.estimatedPotential,
    sub_scores: JSON.parse(JSON.stringify(subScores)),
  };
}

export function keywordToDbRow(
  kw: KeywordEntry,
  pageId: string,
  importId: string,
  userId: string,
): TablesInsert<'keywords'> {
  return {
    page_id: pageId,
    import_id: importId,
    user_id: userId,
    keyword: kw.keyword,
    clicks: kw.klicks,
    impressions: kw.impressionen,
    ctr: kw.ctr,
    position: kw.position,
  };
}

// --- DB → App ---

type PageRow = Tables<'pages'>;
type KeywordRow = Tables<'keywords'>;

export function dbRowsToScoredPages(
  pageRows: PageRow[],
  keywordRows: KeywordRow[],
): ScoredPage[] {
  // Group keywords by page_id
  const keywordsByPage = new Map<string, KeywordEntry[]>();
  for (const kw of keywordRows) {
    const entries = keywordsByPage.get(kw.page_id) ?? [];
    entries.push({
      keyword: kw.keyword,
      klicks: kw.clicks ?? 0,
      impressionen: kw.impressions ?? 0,
      ctr: kw.ctr ?? 0,
      position: kw.position ?? 0,
    });
    keywordsByPage.set(kw.page_id, entries);
  }

  return pageRows.map((row) => {
    const subScores = (row.sub_scores as SubScores | null) ?? {
      impressionScore: 0,
      positionScore: 0,
      ctrDeviationScore: 0,
      keywordCountScore: 0,
    };

    return {
      url: row.url,
      klicks: row.clicks ?? 0,
      impressionen: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
      keywords: keywordsByPage.get(row.id) ?? [],
      keywordCount: row.keyword_count ?? 0,
      score: row.score ?? 0,
      category: (row.category as CategoryId) ?? 'low-priority',
      estimatedPotential: row.estimated_potential ?? 0,
      ...subScores,
    };
  });
}

export function dbRowsToOverview(pageRows: PageRow[]): DashboardOverview {
  if (pageRows.length === 0) {
    return {
      totalKlicks: 0,
      totalImpressionen: 0,
      avgCtr: 0,
      avgPosition: 0,
      totalPages: 0,
      totalKeywords: 0,
    };
  }

  const totalKlicks = pageRows.reduce((sum, p) => sum + (p.clicks ?? 0), 0);
  const totalImpressionen = pageRows.reduce((sum, p) => sum + (p.impressions ?? 0), 0);
  const totalKeywords = pageRows.reduce((sum, p) => sum + (p.keyword_count ?? 0), 0);

  const avgCtr = totalImpressionen > 0 ? totalKlicks / totalImpressionen : 0;
  const avgPosition =
    totalImpressionen > 0
      ? pageRows.reduce((sum, p) => sum + (p.position ?? 0) * (p.impressions ?? 0), 0) /
        totalImpressionen
      : 0;

  return {
    totalKlicks,
    totalImpressionen,
    avgCtr,
    avgPosition,
    totalPages: pageRows.length,
    totalKeywords,
  };
}
