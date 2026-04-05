import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/api-auth';
import { createServiceClient } from '@/lib/supabase/server';

export interface ArticleSnapshot {
  id: string;
  url: string;
  mainKeyword: string | null;
  positionAtOptimization: number | null;
  ctrAtOptimization: number | null;
  impressionsAtOptimization: number | null;
  clicksAtOptimization: number | null;
  optimizedAt: string;
}

// GET: Load snapshots for a specific URL (or all snapshots for the user)
export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  const supabase = createServiceClient();

  let query = supabase
    .from('article_snapshots')
    .select('id, url, main_keyword, position_at_optimization, ctr_at_optimization, impressions_at_optimization, clicks_at_optimization, optimized_at')
    .eq('user_id', userId)
    .order('optimized_at', { ascending: false });

  if (url) {
    query = query.eq('url', url);
  }

  const { data: rows, error } = await query;

  if (error) {
    console.error('Failed to load snapshots:', error);
    return NextResponse.json({ snapshots: [] });
  }

  const snapshots: ArticleSnapshot[] = (rows ?? []).map((row) => ({
    id: row.id,
    url: row.url,
    mainKeyword: row.main_keyword,
    positionAtOptimization: row.position_at_optimization,
    ctrAtOptimization: row.ctr_at_optimization,
    impressionsAtOptimization: row.impressions_at_optimization,
    clicksAtOptimization: row.clicks_at_optimization,
    optimizedAt: row.optimized_at,
  }));

  return NextResponse.json({ snapshots });
}
