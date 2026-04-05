import { PAGE_TYPE_PRESETS } from '@/lib/page-type-config';
import type { PageTypeSettings, UrlPrefixGroup } from '@/types/page-type-filter';
import type { ScoredPage } from '@/types/scoring';
import type { DashboardOverview } from '@/types/gsc';

/**
 * Filter pages by active page type preset + custom rules.
 * When includePatterns is non-empty, only URLs containing any pattern pass.
 * Custom exclude rules then remove matches, custom include rules add back.
 */
export function filterPagesByType(
  pages: ScoredPage[],
  settings: PageTypeSettings,
): ScoredPage[] {
  const preset = PAGE_TYPE_PRESETS[settings.activePreset];
  if (!preset) return pages;

  const includePatterns = preset.includePatterns;
  const customIncludes = settings.customRules
    .filter((r) => r.type === 'include')
    .map((r) => r.pattern);
  const customExcludes = settings.customRules
    .filter((r) => r.type === 'exclude')
    .map((r) => r.pattern);

  // Combine preset + custom includes
  const allIncludes = [...includePatterns, ...customIncludes];

  // If no include patterns at all → show everything (minus excludes)
  if (allIncludes.length === 0 && customExcludes.length === 0) {
    return pages;
  }

  return pages.filter((page) => {
    const path = extractPath(page.url);

    // Check excludes first — if any exclude matches, reject
    if (customExcludes.some((pattern) => path.includes(pattern))) {
      return false;
    }

    // If no include patterns, accept everything (only excludes are active)
    if (allIncludes.length === 0) {
      return true;
    }

    // Accept if any include pattern matches
    return allIncludes.some((pattern) => path.includes(pattern));
  });
}

/**
 * Recompute DashboardOverview from a filtered pages array.
 * Mirrors the logic from dbRowsToOverview in mappers.ts but operates
 * on ScoredPage[] (German field names).
 */
export function computeOverviewFromPages(pages: ScoredPage[]): DashboardOverview {
  if (pages.length === 0) {
    return {
      totalKlicks: 0,
      totalImpressionen: 0,
      avgCtr: 0,
      avgPosition: 0,
      totalPages: 0,
      totalKeywords: 0,
    };
  }

  const totalKlicks = pages.reduce((sum, p) => sum + p.klicks, 0);
  const totalImpressionen = pages.reduce((sum, p) => sum + p.impressionen, 0);
  const totalKeywords = pages.reduce((sum, p) => sum + p.keywordCount, 0);

  const avgCtr = totalImpressionen > 0 ? totalKlicks / totalImpressionen : 0;
  const avgPosition =
    totalImpressionen > 0
      ? pages.reduce((sum, p) => sum + p.position * p.impressionen, 0) / totalImpressionen
      : 0;

  return {
    totalKlicks,
    totalImpressionen,
    avgCtr,
    avgPosition,
    totalPages: pages.length,
    totalKeywords,
  };
}

/**
 * Analyze URL prefixes in the pages array for the settings dialog.
 * Extracts the first path segment and groups by it.
 */
export function analyzeUrlPrefixes(pages: ScoredPage[]): UrlPrefixGroup[] {
  const groups = new Map<string, { count: number; exampleUrl: string }>();

  for (const page of pages) {
    const path = extractPath(page.url);
    const prefix = getFirstPathSegment(path);

    const existing = groups.get(prefix);
    if (existing) {
      existing.count++;
    } else {
      groups.set(prefix, { count: 1, exampleUrl: page.url });
    }
  }

  return Array.from(groups.entries())
    .map(([prefix, data]) => ({
      prefix,
      count: data.count,
      exampleUrl: data.exampleUrl,
    }))
    .sort((a, b) => b.count - a.count);
}

// Extract path from URL (handles full URLs and relative paths)
function extractPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    // Already a path or relative URL
    return url.startsWith('/') ? url : `/${url}`;
  }
}

// Get first path segment: "/artikel/foo/bar" → "/artikel/"
function getFirstPathSegment(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return '/';
  return `/${segments[0]}/`;
}
