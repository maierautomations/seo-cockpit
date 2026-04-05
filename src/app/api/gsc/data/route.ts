import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchGscSearchAnalytics, fetchGscOverview, GscApiError } from '@/lib/gsc/client';
import { transformGscData } from '@/lib/gsc/transformer';
import { scorePages } from '@/lib/scoring/engine';
import { calculateOverview } from '@/lib/csv/merger';
import type { DashboardOverview } from '@/types/gsc';

interface GscDataRequest {
  siteUrl: string;
  startDate: string;
  endDate: string;
}

export async function POST(request: Request) {
  const session = await auth();

  console.log('[GSC /api/gsc/data] Session state:', {
    hasToken: !!session?.accessToken,
    tokenLength: session?.accessToken?.length ?? 0,
    error: session?.error ?? null,
  });

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
  console.log('[GSC /api/gsc/data] Request:', { siteUrl, startDate, endDate });

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
    // Fetch overview (no dimensions = exact GSC UI numbers) + detail data in parallel
    const [overviewResult, rows] = await Promise.all([
      fetchGscOverview(session.accessToken, siteUrl, startDate, endDate)
        .catch((err) => {
          console.warn('[GSC /api/gsc/data] Overview call failed, will fall back:', err);
          return null;
        }),
      fetchGscSearchAnalytics(session.accessToken, siteUrl, startDate, endDate),
    ]);

    console.log('[GSC /api/gsc/data] Fetched rows:', rows.length);
    if (overviewResult) {
      console.log('[GSC /api/gsc/data] Overview:', overviewResult);
    }

    // Transform to PageData[] (real keyword-to-URL mapping)
    const pageData = transformGscData(rows);

    // Score pages (same engine as CSV flow)
    const scoredPages = scorePages(pageData);

    // Build overview: prefer dimension-less API data (matches GSC UI),
    // fall back to calculated overview from page data
    const totalKeywords = pageData.reduce((sum, p) => sum + p.keywordCount, 0);
    let overview: DashboardOverview;

    if (overviewResult) {
      overview = {
        totalKlicks: overviewResult.clicks,
        totalImpressionen: overviewResult.impressions,
        avgCtr: overviewResult.ctr,
        avgPosition: overviewResult.position,
        totalPages: pageData.length,
        totalKeywords,
      };
    } else {
      overview = calculateOverview(pageData, totalKeywords);
    }

    return NextResponse.json({
      pages: scoredPages,
      overview,
      totalRows: rows.length,
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
    console.error('[GSC /api/gsc/data] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Suchdaten.' },
      { status: 500 },
    );
  }
}
