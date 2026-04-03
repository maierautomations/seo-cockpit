import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchGscSearchAnalytics, GscApiError } from '@/lib/gsc/client';
import { transformGscData } from '@/lib/gsc/transformer';
import { scorePages } from '@/lib/scoring/engine';
import { calculateOverview } from '@/lib/csv/merger';
import { persistImport } from '@/lib/supabase/persist-import';

interface GscDataRequest {
  siteUrl: string;
  startDate: string;
  endDate: string;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json(
      { error: 'Nicht angemeldet. Bitte zuerst mit Google verbinden.' },
      { status: 401 },
    );
  }

  if (session.error === 'RefreshTokenError') {
    return NextResponse.json(
      { error: 'Sitzung abgelaufen. Bitte erneut verbinden.' },
      { status: 403 },
    );
  }

  const body = (await request.json()) as GscDataRequest;
  const { siteUrl, startDate, endDate } = body;

  if (!siteUrl || !startDate || !endDate) {
    return NextResponse.json(
      { error: 'siteUrl, startDate und endDate sind erforderlich.' },
      { status: 400 },
    );
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return NextResponse.json(
      { error: 'Ungültiges Datumsformat. Erwartet: YYYY-MM-DD.' },
      { status: 400 },
    );
  }

  try {
    // Fetch raw analytics data (with pagination)
    const rows = await fetchGscSearchAnalytics(
      session.accessToken,
      siteUrl,
      startDate,
      endDate,
    );

    // Transform to PageData[] (real keyword-to-URL mapping)
    const pageData = transformGscData(rows);

    // Score pages (same engine as CSV flow)
    const scoredPages = scorePages(pageData);

    // Calculate overview KPIs
    const totalKeywords = pageData.reduce((sum, p) => sum + p.keywordCount, 0);
    const overview = calculateOverview(pageData, totalKeywords);

    // Persist to Supabase (non-blocking)
    let importId: string | null = null;
    if (session.supabaseUserId) {
      try {
        importId = await persistImport({
          userId: session.supabaseUserId,
          pages: scoredPages,
          overview,
          source: 'gsc',
          propertyUrl: siteUrl,
          dateRangeStart: startDate,
          dateRangeEnd: endDate,
        });
      } catch (error) {
        console.error('Supabase persist error (non-blocking):', error);
      }
    }

    return NextResponse.json({
      pages: scoredPages,
      overview,
      totalRows: rows.length,
      importId,
    });
  } catch (error) {
    if (error instanceof GscApiError) {
      const message =
        error.statusCode === 403
          ? 'Kein Zugriff auf diese Property. Bitte Berechtigungen in der Google Search Console prüfen.'
          : error.statusCode === 429
            ? 'API-Limit erreicht. Bitte in einigen Minuten erneut versuchen.'
            : error.message;
      return NextResponse.json(
        { error: message },
        { status: error.statusCode },
      );
    }
    console.error('GSC data fetch error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Suchdaten.' },
      { status: 500 },
    );
  }
}
