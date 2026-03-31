import type {
  SerpApiResponse,
  SerpAnalysis,
  TitlePattern,
  TopicCoverage,
  GapItem,
  FeaturedSnippetChance,
} from '@/types/serp';
import { getClaudeClient } from '@/lib/claude/client';

// Pure logic: analyze title patterns from SERP results
export function analyzeTitlePatterns(results: SerpApiResponse): TitlePattern[] {
  const titles = results.organicResults.map((r) => r.title);
  const total = titles.length;
  if (total === 0) return [];

  const patterns: TitlePattern[] = [];
  const currentYear = new Date().getFullYear().toString();
  const prevYear = (new Date().getFullYear() - 1).toString();

  // Year pattern
  const withYear = titles.filter(
    (t) => t.includes(currentYear) || t.includes(prevYear),
  );
  if (withYear.length > 0) {
    patterns.push({
      pattern: `Jahreszahl (${currentYear})`,
      count: withYear.length,
      total,
      examples: withYear.slice(0, 3),
    });
  }

  // Common financial words
  const keywordPatterns: [string, string[]][] = [
    ['Prognose/Analyse', ['prognose', 'analyse', 'analysis', 'forecast']],
    ['Kursziel', ['kursziel', 'price target', 'target price']],
    ['Kaufen/Verkaufen', ['kaufen', 'verkaufen', 'buy', 'sell']],
    ['Vergleich/Test', ['vergleich', 'test', 'erfahrungen', 'review']],
    ['Aktie/Aktien', ['aktie', 'aktien', 'stock']],
    ['FAQ/Fragen', ['faq', 'fragen', 'häufig']],
  ];

  for (const [label, keywords] of keywordPatterns) {
    const matches = titles.filter((t) =>
      keywords.some((kw) => t.toLowerCase().includes(kw)),
    );
    if (matches.length >= 2) {
      patterns.push({
        pattern: label,
        count: matches.length,
        total,
        examples: matches.slice(0, 2),
      });
    }
  }

  // Sort by count descending
  patterns.sort((a, b) => b.count - a.count);

  return patterns;
}

// Determine featured snippet opportunity
export function analyzeFeaturedSnippet(
  results: SerpApiResponse,
  ownUrl?: string,
): FeaturedSnippetChance {
  if (!results.featuredSnippet) {
    return {
      type: 'none',
      recommendation: 'Kein Featured Snippet vorhanden. Chance: Strukturierten Content (Tabelle, Liste, kurze Antwort) gezielt optimieren.',
      currentSnippetUrl: null,
    };
  }

  const fs = results.featuredSnippet;
  const isOwnSnippet = ownUrl ? fs.url.includes(ownUrl) : false;

  if (isOwnSnippet) {
    return {
      type: fs.type,
      recommendation: 'Dein Artikel hält aktuell das Featured Snippet. Formatierung und Aktualität beibehalten.',
      currentSnippetUrl: fs.url,
    };
  }

  const recommendations: Record<string, string> = {
    paragraph: 'Featured Snippet (Absatz): Kurze, prägnante Antwort (40-60 Wörter) direkt nach der relevanten H2 platzieren.',
    list: 'Featured Snippet (Liste): Nummerierte oder Aufzählungsliste mit klaren Schritten/Punkten erstellen.',
    table: 'Featured Snippet (Tabelle): Kennzahlen-Tabelle prominent platzieren (KGV, Umsatz, Marge etc.).',
  };

  return {
    type: fs.type,
    recommendation: recommendations[fs.type] ?? 'Featured Snippet optimieren.',
    currentSnippetUrl: fs.url,
  };
}

// AI-powered: analyze topic coverage and gaps using Claude
export async function analyzeTopicsAndGaps(
  results: SerpApiResponse,
  ownContent?: string,
): Promise<{ topicCoverage: TopicCoverage[]; gaps: GapItem[] }> {
  const claude = getClaudeClient();

  const serpSummary = results.organicResults
    .map((r, i) => `${i + 1}. "${r.title}" — ${r.description}`)
    .join('\n');

  const ownSection = ownContent
    ? `\n\nEIGENER ARTIKEL (gekürzt):\n${ownContent.slice(0, 4000)}`
    : '';

  const prompt = `Analysiere die folgenden Top-${results.organicResults.length} Google-Suchergebnisse für "${results.keyword}" und identifiziere Themen-Muster.

SUCHERGEBNISSE:
${serpSummary}
${ownSection}

AUFGABEN:
1. THEMEN-COVERAGE: Welche Hauptthemen decken die Ergebnisse ab? Zähle wie viele der ${results.organicResults.length} Ergebnisse jedes Thema behandeln.
2. GAP-ANALYSE: ${ownContent ? 'Was haben die Top-Ergebnisse, was der eigene Artikel NICHT hat?' : 'Welche Themen sind besonders wichtig und sollten in einem Artikel vorkommen?'}

Antworte AUSSCHLIESSLICH als valides JSON:
{
  "topicCoverage": [
    { "topic": "Quartalszahlen", "count": 8, "total": 10 }
  ],
  "gaps": [
    { "topic": "Analystenkursziele", "competitorCount": 9, "total": 10, "recommendation": "Abschnitt mit aktuellen Kurszielen ergänzen" }
  ]
}

Maximal 8 Themen für Coverage, maximal 5 Gaps. Nur Themen mit count >= 3.
SPRACHE: Deutsch.`;

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0]?.type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        topicCoverage: TopicCoverage[];
        gaps: GapItem[];
      };
      return parsed;
    }
  } catch {
    // Parsing failed
  }

  return { topicCoverage: [], gaps: [] };
}

// Full SERP analysis: combines pure logic + AI
export async function analyzeSerpResults(
  results: SerpApiResponse,
  ownUrl?: string,
  ownContent?: string,
): Promise<SerpAnalysis> {
  // Pure logic (instant)
  const titlePatterns = analyzeTitlePatterns(results);
  const featuredSnippetChance = analyzeFeaturedSnippet(results, ownUrl);
  const peopleAlsoAsk = results.peopleAlsoAsk.map((q) => q.question);

  // AI analysis (Claude call)
  const { topicCoverage, gaps } = await analyzeTopicsAndGaps(
    results,
    ownContent,
  );

  return {
    keyword: results.keyword,
    analyzedAt: new Date().toISOString(),
    organicResults: results.organicResults,
    titlePatterns,
    topicCoverage,
    gaps,
    featuredSnippetChance,
    peopleAlsoAsk,
  };
}
