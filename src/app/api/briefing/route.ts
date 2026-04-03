import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/api-auth';
import { createServiceClient } from '@/lib/supabase/server';
import type {
  BriefingRequest,
  BriefingResponse,
  ContentBriefing,
  BriefingHeading,
  BriefingElement,
  BriefingFaq,
  BriefingYoast,
} from '@/types/briefing';
import { fetchSerp } from '@/lib/serp/client';
import {
  analyzeTitlePatterns,
  analyzeFeaturedSnippet,
  analyzeTopicsAndGaps,
} from '@/lib/serp/analyzer';
import { getClaudeClient } from '@/lib/claude/client';
import { buildBriefingPrompt } from '@/lib/briefing/generate-prompt';

interface BriefingGeneration {
  headings: BriefingHeading[];
  elements: BriefingElement[];
  faqQuestions: BriefingFaq[];
  yoast: BriefingYoast;
}

/**
 * Robustly extract JSON from Claude's response text.
 * Handles markdown fences, surrounding explanation text, and truncated responses.
 */
function extractBriefingJson(raw: string): BriefingGeneration {
  let text = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  text = text.trim();

  // Find the outermost JSON object: first { to last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    console.error(
      '[briefing] No JSON object found in Claude response. First 500 chars:',
      raw.slice(0, 500),
    );
    throw new Error(
      'Briefing-Generierung fehlgeschlagen: Kein JSON in der KI-Antwort gefunden. ' +
        `Antwort beginnt mit: "${raw.slice(0, 200)}…"`,
    );
  }

  const jsonStr = text.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonStr) as BriefingGeneration;
  } catch (parseError) {
    const errMsg =
      parseError instanceof Error ? parseError.message : 'Parse-Fehler';
    console.error(
      `[briefing] JSON parse failed: ${errMsg}. Extracted JSON (first 500 chars):`,
      jsonStr.slice(0, 500),
    );
    throw new Error(
      `Briefing-JSON konnte nicht geparst werden: ${errMsg}. ` +
        `Antwort beginnt mit: "${raw.slice(0, 200)}…"`,
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BriefingRequest;
    const { hauptkeyword, nebenkeywords, keywordCluster, internalLinkCandidates } = body;

    if (!hauptkeyword?.trim()) {
      return NextResponse.json<BriefingResponse>(
        { success: false, error: 'Hauptkeyword ist erforderlich.' },
        { status: 400 },
      );
    }

    // Step 1: Fetch SERP results
    const serpResults = await fetchSerp(hauptkeyword.trim());

    if (serpResults.organicResults.length === 0) {
      return NextResponse.json<BriefingResponse>(
        { success: false, error: 'Keine SERP-Ergebnisse gefunden.' },
        { status: 404 },
      );
    }

    // Step 2: Pure logic analysis (instant)
    const titlePatterns = analyzeTitlePatterns(serpResults);
    const featuredSnippetChance = analyzeFeaturedSnippet(serpResults);
    const peopleAlsoAsk = serpResults.peopleAlsoAsk.map((q) => q.question);

    // Step 3: AI-powered topic coverage analysis (existing Claude call)
    const { topicCoverage } = await analyzeTopicsAndGaps(serpResults);

    // Step 4: Build prompt context strings
    const keywordClusterStr = keywordCluster
      .filter((k) => k.source === 'gsc')
      .map((k) => `- ${k.keyword} (${k.impressionen} Impressionen, Pos. ${k.position.toFixed(1)})`)
      .join('\n') || 'Keine GSC-Daten vorhanden.';

    const serpResultsStr = serpResults.organicResults
      .map((r, i) => `${i + 1}. "${r.title}" — ${r.description} (${r.domain})`)
      .join('\n');

    const titlePatternsStr = titlePatterns
      .map((p) => `- ${p.pattern}: ${p.count}/${p.total} Ergebnisse`)
      .join('\n') || 'Keine auffälligen Muster.';

    const topicCoverageStr = topicCoverage
      .map((t) => `- ${t.topic}: ${t.count}/${t.total} Ergebnisse`)
      .join('\n') || 'Keine Themen identifiziert.';

    const peopleAlsoAskStr = peopleAlsoAsk.length > 0
      ? peopleAlsoAsk.map((q) => `- ${q}`).join('\n')
      : 'Keine "People Also Ask"-Fragen gefunden.';

    const featuredSnippetStr = `Typ: ${featuredSnippetChance.type}\n${featuredSnippetChance.recommendation}`;

    // Step 5: Generate briefing via Claude
    const prompt = buildBriefingPrompt({
      hauptkeyword: hauptkeyword.trim(),
      nebenkeywords: nebenkeywords.filter(Boolean).join(', ') || 'Keine',
      keywordCluster: keywordClusterStr,
      serpResults: serpResultsStr,
      titlePatterns: titlePatternsStr,
      topicCoverage: topicCoverageStr,
      peopleAlsoAsk: peopleAlsoAskStr,
      featuredSnippet: featuredSnippetStr,
    });

    const claude = getClaudeClient();
    const response = await claude.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText =
      response.content[0]?.type === 'text' ? response.content[0].text : '';

    // Robust JSON extraction: strip markdown fences and surrounding text
    const parsed = extractBriefingJson(rawText);

    // Step 6: Assemble the complete briefing
    const briefing: ContentBriefing = {
      hauptkeyword: hauptkeyword.trim(),
      nebenkeywords: nebenkeywords.filter(Boolean),
      generatedAt: new Date().toISOString(),
      headings: parsed.headings,
      keywordCluster,
      elements: parsed.elements,
      faqQuestions: parsed.faqQuestions,
      yoast: parsed.yoast,
      internalLinks: internalLinkCandidates,
      serpTopResults: serpResults.organicResults.map((r) => ({
        position: r.position,
        title: r.title,
        url: r.url,
        domain: r.domain,
      })),
      titlePatterns: titlePatterns.map((p) => ({
        pattern: p.pattern,
        count: p.count,
        total: p.total,
      })),
      topicCoverage: topicCoverage.map((t) => ({
        topic: t.topic,
        count: t.count,
        total: t.total,
      })),
      peopleAlsoAsk,
      featuredSnippetChance: {
        type: featuredSnippetChance.type,
        recommendation: featuredSnippetChance.recommendation,
      },
    };

    // Persist to Supabase (non-blocking)
    let briefingId: string | null = null;
    try {
      const userId = await getAuthenticatedUserId();
      if (userId) {
        const supabase = createServiceClient();
        const { data: inserted } = await supabase
          .from('briefings')
          .insert({
            user_id: userId,
            main_keyword: briefing.hauptkeyword,
            secondary_keywords: briefing.nebenkeywords,
            briefing_data: JSON.parse(JSON.stringify(briefing)),
            serp_data: JSON.parse(JSON.stringify({
              serpTopResults: briefing.serpTopResults,
              titlePatterns: briefing.titlePatterns,
              topicCoverage: briefing.topicCoverage,
              peopleAlsoAsk: briefing.peopleAlsoAsk,
              featuredSnippetChance: briefing.featuredSnippetChance,
            })),
          })
          .select('id')
          .single();
        briefingId = inserted?.id ?? null;
      }
    } catch (persistError) {
      console.error('Failed to persist briefing:', persistError);
    }

    return NextResponse.json<BriefingResponse>({
      success: true,
      data: briefing,
      briefingId,
    } as BriefingResponse & { briefingId: string | null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json<BriefingResponse>(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
