import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/api-auth';
import { createServiceClient } from '@/lib/supabase/server';

// GET: Load cached analysis for a URL
export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ analysis: null });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ analysis: null });
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('article_analyses')
    .select('structure_check, seo_check, content_analysis, suggestions, created_at')
    .eq('user_id', userId)
    .eq('url', url)
    .single();

  if (error || !data) {
    return NextResponse.json({ analysis: null });
  }

  return NextResponse.json({
    analysis: {
      structure: data.structure_check,
      seo: data.seo_check,
      content: data.content_analysis,
      suggestions: data.suggestions,
      cachedAt: data.created_at,
    },
  });
}
