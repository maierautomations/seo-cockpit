import type { ScoredPage } from '@/types/scoring';
import type { BriefingKeyword, BriefingInternalLink } from '@/types/briefing';

// Tokenize a keyword string into normalized lowercase words
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// Check if all tokens from the query appear in the target string
function allTokensMatch(queryTokens: string[], target: string): boolean {
  const lower = target.toLowerCase();
  return queryTokens.every((token) => lower.includes(token));
}

// Check if any token from the query appears in the target string
function anyTokenMatches(queryTokens: string[], target: string): boolean {
  const lower = target.toLowerCase();
  return queryTokens.some((token) => lower.includes(token));
}

/**
 * Match keywords from GSC data against user-provided keywords.
 * Runs client-side against the Zustand store's pages data.
 */
export function matchKeywordCluster(
  hauptkeyword: string,
  nebenkeywords: string[],
  pages: ScoredPage[],
): BriefingKeyword[] {
  const allSearchTerms = [hauptkeyword, ...nebenkeywords];
  const seen = new Set<string>();
  const results: BriefingKeyword[] = [];

  // Add user-input keywords as 'input' source
  for (const kw of allSearchTerms) {
    const kwLower = kw.toLowerCase().trim();
    if (kwLower && !seen.has(kwLower)) {
      seen.add(kwLower);
      results.push({
        keyword: kw.trim(),
        impressionen: 0,
        position: 0,
        source: 'input',
      });
    }
  }

  // Search through all GSC keywords across all pages
  const hauptTokens = tokenize(hauptkeyword);
  const nebenTokenSets = nebenkeywords
    .filter((n) => n.trim())
    .map(tokenize);

  for (const page of pages) {
    for (const entry of page.keywords) {
      const kwLower = entry.keyword.toLowerCase();
      if (seen.has(kwLower)) {
        // Update impressions for input keywords that also appear in GSC
        const existing = results.find(
          (r) => r.keyword.toLowerCase() === kwLower,
        );
        if (existing && existing.source === 'input') {
          existing.impressionen = entry.impressionen;
          existing.position = entry.position;
          existing.source = 'gsc';
        }
        continue;
      }

      // Match: all tokens of hauptkeyword appear in this GSC keyword,
      // OR all tokens of any nebenkeyword appear in it
      const matchesHaupt = allTokensMatch(hauptTokens, entry.keyword);
      const matchesNeben = nebenTokenSets.some((tokens) =>
        allTokensMatch(tokens, entry.keyword),
      );

      if (matchesHaupt || matchesNeben) {
        seen.add(kwLower);
        results.push({
          keyword: entry.keyword,
          impressionen: entry.impressionen,
          position: entry.position,
          source: 'gsc',
        });
      }
    }
  }

  // Sort: input keywords first, then GSC matches by impressions descending
  return results.sort((a, b) => {
    if (a.source === 'input' && b.source !== 'input') return -1;
    if (b.source === 'input' && a.source !== 'input') return 1;
    return b.impressionen - a.impressionen;
  });
}

/**
 * Find internal link candidates from GSC pages that share keyword overlap.
 * Returns top N pages sorted by impressions.
 */
export function findInternalLinkCandidates(
  hauptkeyword: string,
  nebenkeywords: string[],
  pages: ScoredPage[],
  maxResults = 8,
): BriefingInternalLink[] {
  const allTokens = tokenize(
    [hauptkeyword, ...nebenkeywords].join(' '),
  );
  const candidates: BriefingInternalLink[] = [];

  for (const page of pages) {
    const matching = page.keywords.filter((kw) =>
      anyTokenMatches(allTokens, kw.keyword),
    );

    if (matching.length === 0) continue;

    candidates.push({
      url: page.url,
      anchorSuggestion: matching[0].keyword,
      matchingKeywords: matching.map((m) => m.keyword).slice(0, 3),
      impressionen: page.impressionen,
    });
  }

  return candidates
    .sort((a, b) => b.impressionen - a.impressionen)
    .slice(0, maxResults);
}
