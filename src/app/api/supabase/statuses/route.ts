import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/api-auth';
import { createServiceClient } from '@/lib/supabase/server';
import type { ArticleStatusId, ArticleStatus } from '@/types/scoring';

// GET: Load all article statuses for the logged-in user
export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: rows, error } = await supabase
    .from('article_statuses')
    .select('url, status, updated_at')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to load statuses:', error);
    return NextResponse.json({ statuses: {} });
  }

  const statuses: Record<string, ArticleStatus> = {};
  for (const row of rows ?? []) {
    if (row.url && row.status) {
      statuses[row.url] = {
        status: row.status as ArticleStatusId,
        updatedAt: row.updated_at ?? new Date().toISOString(),
      };
    }
  }

  return NextResponse.json({ statuses });
}

interface StatusUpdateRequest {
  url: string;
  status: ArticleStatusId;
}

// POST: Upsert an article status
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const body = (await request.json()) as StatusUpdateRequest;
  const { url, status } = body;

  if (!url || !status) {
    return NextResponse.json({ error: 'url und status sind erforderlich.' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // Try to find existing page_id for this URL
  const { data: page } = await supabase
    .from('pages')
    .select('id')
    .eq('user_id', userId)
    .eq('url', url)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase
    .from('article_statuses')
    .upsert(
      {
        user_id: userId,
        url,
        status,
        page_id: page?.id ?? null,
        updated_at: now,
        optimized_at: status === 'optimiert' ? now : null,
      },
      { onConflict: 'user_id,url' },
    );

  if (error) {
    console.error('Failed to upsert status:', error);
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
