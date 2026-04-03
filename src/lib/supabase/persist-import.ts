import type { ScoredPage } from '@/types/scoring';
import type { DashboardOverview } from '@/types/gsc';
import { createServiceClient } from '@/lib/supabase/server';
import { scoredPageToDbRow, keywordToDbRow } from '@/lib/supabase/mappers';

interface PersistImportParams {
  userId: string;
  pages: ScoredPage[];
  overview: DashboardOverview;
  source: 'gsc' | 'csv';
  propertyUrl?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

// Batch insert helper — chunks array into groups to avoid payload limits
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// Persists a GSC/CSV import to Supabase: gsc_imports + pages + keywords.
// Returns the import ID, or null on failure.
export async function persistImport(params: PersistImportParams): Promise<string | null> {
  const { userId, pages, overview, source, propertyUrl, dateRangeStart, dateRangeEnd } = params;
  const supabase = createServiceClient();

  // 1. Create import record
  const { data: importRecord, error: importError } = await supabase
    .from('gsc_imports')
    .insert({
      user_id: userId,
      property_url: propertyUrl ?? null,
      source,
      date_range_start: dateRangeStart ?? null,
      date_range_end: dateRangeEnd ?? null,
      total_pages: overview.totalPages,
      total_keywords: overview.totalKeywords,
    })
    .select('id')
    .single();

  if (importError || !importRecord) {
    console.error('Failed to create gsc_imports record:', importError);
    return null;
  }

  const importId = importRecord.id;

  // 2. Batch-insert pages
  const pageRows = pages.map((p) => scoredPageToDbRow(p, importId, userId));
  const pageChunks = chunk(pageRows, 500);
  const pageIdMap = new Map<string, string>(); // url → page.id

  for (const batch of pageChunks) {
    const { data: insertedPages, error: pageError } = await supabase
      .from('pages')
      .insert(batch)
      .select('id, url');

    if (pageError) {
      console.error('Failed to insert pages batch:', pageError);
      continue;
    }

    if (insertedPages) {
      for (const p of insertedPages) {
        pageIdMap.set(p.url, p.id);
      }
    }
  }

  // 3. Batch-insert keywords
  const allKeywordRows = pages.flatMap((page) => {
    const pageId = pageIdMap.get(page.url);
    if (!pageId) return [];
    return page.keywords.map((kw) => keywordToDbRow(kw, pageId, importId, userId));
  });

  const keywordChunks = chunk(allKeywordRows, 500);
  for (const batch of keywordChunks) {
    const { error: kwError } = await supabase.from('keywords').insert(batch);
    if (kwError) {
      console.error('Failed to insert keywords batch:', kwError);
    }
  }

  return importId;
}
