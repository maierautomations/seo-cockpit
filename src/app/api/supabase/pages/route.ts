import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/api-auth';
import { createServiceClient } from '@/lib/supabase/server';
import { dbRowsToScoredPages, dbRowsToOverview } from '@/lib/supabase/mappers';

// GET: Load the most recent import's pages + keywords for the logged-in user
export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Get most recent import
  const { data: latestImport, error: importError } = await supabase
    .from('gsc_imports')
    .select('id, source, property_url, date_range_start, date_range_end, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (importError || !latestImport) {
    // No import found — not an error, just empty
    return NextResponse.json({ pages: [], overview: null, importId: null });
  }

  // Load pages for this import
  const { data: pageRows, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('import_id', latestImport.id)
    .eq('user_id', userId);

  if (pageError || !pageRows) {
    console.error('Failed to load pages:', pageError);
    return NextResponse.json({ pages: [], overview: null, importId: null });
  }

  // Load keywords for this import
  const { data: keywordRows, error: kwError } = await supabase
    .from('keywords')
    .select('*')
    .eq('import_id', latestImport.id)
    .eq('user_id', userId);

  if (kwError) {
    console.error('Failed to load keywords:', kwError);
  }

  const pages = dbRowsToScoredPages(pageRows, keywordRows ?? []);
  const overview = dbRowsToOverview(pageRows);

  return NextResponse.json({
    pages,
    overview,
    importId: latestImport.id,
    source: latestImport.source,
    propertyUrl: latestImport.property_url,
    dateRangeStart: latestImport.date_range_start,
    dateRangeEnd: latestImport.date_range_end,
  });
}
