import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/api-auth';
import { persistImport } from '@/lib/supabase/persist-import';
import type { ScoredPage } from '@/types/scoring';
import type { DashboardOverview } from '@/types/gsc';

interface ImportRequest {
  pages: ScoredPage[];
  overview: DashboardOverview;
  propertyUrl?: string;
}

// POST: Persist CSV-scored data to Supabase
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const body = (await request.json()) as ImportRequest;
  const { pages, overview, propertyUrl } = body;

  if (!pages || !Array.isArray(pages) || pages.length === 0) {
    return NextResponse.json({ error: 'Keine Seiten zum Speichern.' }, { status: 400 });
  }

  try {
    const importId = await persistImport({
      userId,
      pages,
      overview,
      source: 'csv',
      propertyUrl,
    });

    return NextResponse.json({ importId });
  } catch (error) {
    console.error('CSV import persist error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Daten.' },
      { status: 500 },
    );
  }
}
