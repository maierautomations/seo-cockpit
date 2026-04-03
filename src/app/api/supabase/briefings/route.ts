import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/api-auth';
import { createServiceClient } from '@/lib/supabase/server';

// GET: List all briefings or load a single one by ID
export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const supabase = createServiceClient();

  if (id) {
    // Load single briefing by ID
    const { data, error } = await supabase
      .from('briefings')
      .select('id, main_keyword, secondary_keywords, briefing_data, serp_data, created_at')
      .eq('user_id', userId)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Briefing nicht gefunden.' }, { status: 404 });
    }

    return NextResponse.json({ briefing: data });
  }

  // List all briefings (compact)
  const { data: briefings, error } = await supabase
    .from('briefings')
    .select('id, main_keyword, secondary_keywords, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to list briefings:', error);
    return NextResponse.json({ briefings: [] });
  }

  return NextResponse.json({ briefings: briefings ?? [] });
}
