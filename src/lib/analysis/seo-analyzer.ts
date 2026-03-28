import type { SeoCheck } from '@/types/analysis';

interface SeoAnalyzerInput {
  html?: string;
  title?: string;
  metaDescription?: string;
  markdown: string;
  siteUrl?: string; // for internal link detection
}

// Extract internal links from markdown
function findInternalLinks(markdown: string, siteUrl?: string): string[] {
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  const links: string[] = [];

  for (const match of markdown.matchAll(linkRegex)) {
    const href = match[2] ?? '';
    // Internal if relative or same domain
    if (
      href.startsWith('/') ||
      href.startsWith('#') ||
      (siteUrl && href.includes(siteUrl))
    ) {
      links.push(href);
    }
  }

  return links;
}

// Count images and missing alt texts from markdown
function analyzeImages(markdown: string): { total: number; missing: number } {
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let total = 0;
  let missing = 0;

  for (const match of markdown.matchAll(imgRegex)) {
    total++;
    const alt = match[1] ?? '';
    if (alt.trim() === '') missing++;
  }

  return { total, missing };
}

export function analyzeSeo(input: SeoAnalyzerInput): SeoCheck {
  const {
    title = '',
    metaDescription = '',
    markdown,
    siteUrl,
  } = input;

  // Meta description
  const metaDesc = {
    present: metaDescription.length > 0,
    length: metaDescription.length,
    text: metaDescription,
  };

  // SEO title
  const seoTitle = {
    length: title.length,
    text: title,
    inRange: title.length >= 55 && title.length <= 65,
  };

  // Alt texts
  const altTexts = analyzeImages(markdown);

  // Internal links
  const internalLinkUrls = findInternalLinks(markdown, siteUrl);
  const internalLinks = {
    count: internalLinkUrls.length,
    urls: internalLinkUrls,
  };

  return {
    metaDescription: metaDesc,
    seoTitle,
    altTexts,
    internalLinks,
  };
}
