import { NextResponse } from 'next/server';
import { fetchSerp } from '@/lib/serp/client';
import { analyzeSerpResults } from '@/lib/serp/analyzer';
import type { SerpAnalysisRequest, SerpAnalysisResponse } from '@/types/serp';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SerpAnalysisRequest;
    const { keyword, ownUrl, ownContent } = body;

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json<SerpAnalysisResponse>(
        { success: false, error: 'Keyword ist erforderlich.' },
        { status: 400 },
      );
    }

    // Fetch SERP results
    const serpResults = await fetchSerp(keyword.trim());

    if (serpResults.organicResults.length === 0) {
      return NextResponse.json<SerpAnalysisResponse>(
        { success: false, error: 'Keine Suchergebnisse gefunden.' },
        { status: 404 },
      );
    }

    // Analyze results (pure logic + Claude for topic/gap analysis)
    const analysis = await analyzeSerpResults(
      serpResults,
      ownUrl,
      ownContent,
    );

    return NextResponse.json<SerpAnalysisResponse>({
      success: true,
      data: analysis,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json<SerpAnalysisResponse>(
      { success: false, error: `SERP-Analyse fehlgeschlagen: ${message}` },
      { status: 500 },
    );
  }
}
