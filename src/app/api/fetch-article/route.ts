import { NextResponse } from 'next/server';
import type { FetchArticleResponse } from '@/types/analysis';

export async function POST(request: Request) {
  try {
    const { url } = (await request.json()) as { url: string };

    if (!url || !url.startsWith('http')) {
      return NextResponse.json<FetchArticleResponse>(
        { success: false, error: 'Ungültige URL.' },
        { status: 400 },
      );
    }

    // Strategy: Use Firecrawl API if key available, else fallback to direct fetch
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;

    if (firecrawlKey) {
      return await fetchViaFirecrawl(url, firecrawlKey);
    }

    return await fetchDirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json<FetchArticleResponse>(
      { success: false, error: `Artikel konnte nicht geladen werden: ${message}` },
      { status: 500 },
    );
  }
}

async function fetchViaFirecrawl(
  url: string,
  apiKey: string,
): Promise<NextResponse<FetchArticleResponse>> {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
      onlyMainContent: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json<FetchArticleResponse>(
      { success: false, error: `Firecrawl-Fehler: ${errorText}` },
      { status: 502 },
    );
  }

  const result = (await response.json()) as {
    success: boolean;
    data?: {
      markdown?: string;
      html?: string;
      metadata?: {
        title?: string;
        description?: string;
      };
    };
  };

  if (!result.success || !result.data) {
    return NextResponse.json<FetchArticleResponse>(
      { success: false, error: 'Firecrawl konnte die Seite nicht verarbeiten.' },
      { status: 502 },
    );
  }

  return NextResponse.json<FetchArticleResponse>({
    success: true,
    markdown: result.data.markdown ?? '',
    html: result.data.html ?? '',
    title: result.data.metadata?.title ?? '',
    metaDescription: result.data.metadata?.description ?? '',
  });
}

async function fetchDirect(
  url: string,
): Promise<NextResponse<FetchArticleResponse>> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; SEOCockpit/1.0; +https://seo-cockpit.app)',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    return NextResponse.json<FetchArticleResponse>(
      { success: false, error: `HTTP ${response.status}: ${response.statusText}` },
      { status: 502 },
    );
  }

  const html = await response.text();

  // Extract title from <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? '';

  // Extract meta description
  const metaMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
  );
  const metaDescription = metaMatch?.[1]?.trim() ?? '';

  // Basic HTML to markdown conversion (simplified)
  const markdown = htmlToBasicMarkdown(html);

  return NextResponse.json<FetchArticleResponse>({
    success: true,
    markdown,
    html,
    title,
    metaDescription,
  });
}

// Minimal HTML → markdown for fallback (no cheerio dependency)
function htmlToBasicMarkdown(html: string): string {
  let text = html;

  // Remove script/style
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');

  // Headings
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');

  // Paragraphs and line breaks
  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Links
  text = text.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Images
  text = text.replace(
    /<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi,
    '![$1]($2)',
  );
  text = text.replace(
    /<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi,
    '![$2]($1)',
  );

  // Lists
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1');

  // Bold/italic
  text = text.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
  text = text.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');

  // Remove remaining tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');

  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}
