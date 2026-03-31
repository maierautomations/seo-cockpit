import { fillPrompt } from '@/lib/claude/prompts';

export const BRIEFING_GENERATION_PROMPT = `Du bist ein SEO-Content-Stratege für deutschsprachige Finanzredaktionen.
Erstelle ein strukturiertes Content-Briefing für einen NEUEN Artikel.

HAUPTKEYWORD: {{hauptkeyword}}
NEBENKEYWORDS: {{nebenkeywords}}

KEYWORD-CLUSTER (aus Google Search Console, mit Impressionen):
{{keywordCluster}}

SERP-ANALYSE (Top 10 Google-Ergebnisse für "{{hauptkeyword}}"):
{{serpResults}}

TITEL-MUSTER DER TOP-10:
{{titlePatterns}}

THEMEN-COVERAGE DER TOP-10:
{{topicCoverage}}

PEOPLE ALSO ASK:
{{peopleAlsoAsk}}

FEATURED SNIPPET:
{{featuredSnippet}}

AUFGABEN:

1. HEADING-STRUKTUR: Empfehle eine H1 und 6-10 H2-Überschriften.
   - H1 muss das Hauptkeyword enthalten und zum Titel-Muster der Top-10 passen.
   - H2s müssen alle wichtigen Themen der Top-10 Coverage abdecken.
   - Journalistischer Stil, keine generischen Überschriften.

2. EMPFOHLENE ELEMENTE: Welche Content-Elemente sollte der Artikel enthalten?
   Wähle aus: infobox, vergleichstabelle, faq, pro-contra, timeline, zitat.
   Maximal 4 Elemente. Nur was für dieses Thema wirklich Sinn macht.

3. FAQ-FRAGEN: 4-6 Fragen basierend auf "People Also Ask" und Themen-Coverage.
   Gib für jede Frage einen kurzen Antwort-Hinweis (1-2 Sätze Richtung, nicht die volle Antwort).

4. YOAST-SEO-FELDER:
   - Keyphrase: Das optimale Fokus-Keyword (meist das Hauptkeyword)
   - SEO-Titel: 55-65 Zeichen, mit Keyword, journalistisch, mit Jahreszahl wenn Pattern zeigt
   - Slug: URL-freundlich, mit Keyword, kurz
   - Meta-Description: 140-160 Zeichen, neugierig machend, mit Keyword

WICHTIG: Antworte NUR mit validem JSON. Kein Text davor oder danach. Keine Markdown-Backticks. Keine Erklärungen. Nur das JSON-Objekt.

JSON-Struktur:
{
  "headings": [
    { "level": "h1", "text": "..." },
    { "level": "h2", "text": "...", "note": "optional: warum diese H2" }
  ],
  "elements": [
    { "type": "infobox|vergleichstabelle|faq|pro-contra|timeline|zitat", "label": "Anzeigename", "description": "Was rein soll", "placement": "Nach welcher H2" }
  ],
  "faqQuestions": [
    { "question": "...", "answerHint": "Kurzer Hinweis zur Antwort" }
  ],
  "yoast": {
    "keyphrase": "...",
    "seoTitle": "...",
    "slug": "...",
    "metaDescription": "..."
  }
}

REGELN:
- Sprache: Deutsch
- Stil: Sachlich-journalistisch, Du-Ansprache vermeiden, keine Anlageberatung
- H2s sollen thematisch zur SERP-Coverage passen, nicht generisch sein
- FAQ-Fragen sollen reale Nutzer-Suchintention abbilden
- Alle Zeichen-Limits STRIKT einhalten
- In JSON-Strings keine Zeilenumbrüche verwenden — alles in einer Zeile pro Feld
- Keine Kommentare im JSON`;

/**
 * Build the filled briefing prompt from SERP analysis data and keyword cluster.
 */
export function buildBriefingPrompt(vars: {
  hauptkeyword: string;
  nebenkeywords: string;
  keywordCluster: string;
  serpResults: string;
  titlePatterns: string;
  topicCoverage: string;
  peopleAlsoAsk: string;
  featuredSnippet: string;
}): string {
  return fillPrompt(BRIEFING_GENERATION_PROMPT, vars);
}
