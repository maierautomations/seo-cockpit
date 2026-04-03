import { NextResponse } from 'next/server';
import { getClaudeClient } from '@/lib/claude/client';
import {
  ARTICLE_ANALYSIS_PROMPT,
  OPTIMIZATION_SUGGESTIONS_PROMPT,
  fillPrompt,
} from '@/lib/claude/prompts';
import { analyzeStructure } from '@/lib/analysis/structure-analyzer';
import { analyzeSeo } from '@/lib/analysis/seo-analyzer';
import { getAuthenticatedUserId } from '@/lib/api-auth';
import { createServiceClient } from '@/lib/supabase/server';
import type {
  AnalyzeArticleRequest,
  AnalyzeArticleResponse,
  ArticleAnalysis,
  ContentAnalysis,
  AiSuggestions,
} from '@/types/analysis';
import { formatPercent, formatDecimal } from '@/lib/format';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeArticleRequest & {
      markdown: string;
      title?: string;
      metaDescription?: string;
      aiAnalysis?: boolean;
      position?: number;
      impressionen?: number;
      ctr?: number;
    };

    const {
      url,
      mainKeyword,
      markdown,
      title = '',
      metaDescription = '',
      aiAnalysis = false,
    } = body;

    if (!url || !markdown) {
      return NextResponse.json<AnalyzeArticleResponse>(
        { success: false, error: 'URL und Markdown-Content sind erforderlich.' },
        { status: 400 },
      );
    }

    // Structure analysis (pure logic, instant)
    const structure = analyzeStructure(markdown, mainKeyword);

    // SEO analysis (pure logic, instant)
    const seo = analyzeSeo({
      markdown,
      title,
      metaDescription,
      siteUrl: new URL(url).origin,
    });

    // Base analysis without AI
    const analysis: ArticleAnalysis = {
      url,
      title,
      fetchedAt: new Date().toISOString(),
      structure,
      seo,
      content: null,
      suggestions: null,
      markdownContent: markdown,
    };

    // AI analysis (only if requested — Progressive Disclosure)
    if (aiAnalysis) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return NextResponse.json<AnalyzeArticleResponse>(
          { success: false, error: 'ANTHROPIC_API_KEY ist nicht konfiguriert.' },
          { status: 500 },
        );
      }

      const claude = getClaudeClient();

      const analysisContext = {
        position: body.position as number | undefined,
        impressionen: body.impressionen as number | undefined,
        ctr: body.ctr as number | undefined,
      };

      // Run content analysis and optimization suggestions in parallel
      const [contentResult, suggestionsResult] = await Promise.all([
        runContentAnalysis(claude, markdown, mainKeyword, analysisContext),
        runOptimizationSuggestions(claude, mainKeyword, title, metaDescription, analysisContext),
      ]);

      analysis.content = contentResult;
      analysis.suggestions = suggestionsResult;

      // Persist AI analysis to Supabase (non-blocking)
      try {
        const userId = await getAuthenticatedUserId();
        if (userId) {
          const supabase = createServiceClient();

          // Look up page_id if it exists
          const { data: pageRow } = await supabase
            .from('pages')
            .select('id')
            .eq('user_id', userId)
            .eq('url', url)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          await supabase
            .from('article_analyses')
            .upsert(
              {
                user_id: userId,
                url,
                page_id: pageRow?.id ?? null,
                structure_check: JSON.parse(JSON.stringify(analysis.structure)),
                seo_check: JSON.parse(JSON.stringify(analysis.seo)),
                content_analysis: JSON.parse(JSON.stringify(contentResult)),
                suggestions: JSON.parse(JSON.stringify(suggestionsResult)),
              },
              { onConflict: 'user_id,url' },
            );
        }
      } catch (persistError) {
        console.error('Failed to persist analysis to Supabase:', persistError);
      }
    }

    return NextResponse.json<AnalyzeArticleResponse>({
      success: true,
      data: analysis,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json<AnalyzeArticleResponse>(
      { success: false, error: `Analyse fehlgeschlagen: ${message}` },
      { status: 500 },
    );
  }
}

async function runContentAnalysis(
  claude: ReturnType<typeof getClaudeClient>,
  markdown: string,
  mainKeyword: string,
  context: { keywords?: string[]; position?: number; impressionen?: number; ctr?: number },
): Promise<ContentAnalysis> {
  const prompt = fillPrompt(ARTICLE_ANALYSIS_PROMPT, {
    keyword: mainKeyword,
    position: formatDecimal(context.position ?? 0),
    impressions: String(context.impressionen ?? 0),
    ctr: formatPercent(context.ctr ?? 0),
  });

  // Truncate markdown to stay within token limits
  const truncatedContent = markdown.slice(0, 12000);

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `${prompt}\n\nARTIKEL:\n${truncatedContent}`,
      },
    ],
  });

  const text = response.content[0]?.type === 'text' ? response.content[0].text : '';

  try {
    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ContentAnalysis;
    }
  } catch {
    // Parsing failed — return empty analysis
  }

  return {
    financialData: [],
    keywordCoverage: { keyword: mainKeyword, count: 0, inH1: false, inH2: false, inMeta: false },
    contentDepth: 'adequate',
    missingTopics: [],
  };
}

async function runOptimizationSuggestions(
  claude: ReturnType<typeof getClaudeClient>,
  mainKeyword: string,
  title: string,
  metaDescription: string,
  context: { position?: number },
): Promise<AiSuggestions> {
  const prompt = fillPrompt(OPTIMIZATION_SUGGESTIONS_PROMPT, {
    keyword: mainKeyword,
    position: formatDecimal(context.position ?? 0),
    title,
    metaDescription,
  });

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const text = response.content[0]?.type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AiSuggestions;
    }
  } catch {
    // Parsing failed
  }

  return {
    seoTitles: [],
    metaDescription: '',
    faqQuestions: [],
    missingContent: [],
  };
}
