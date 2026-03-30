import type { ScoredPage, ArticleStatus, ArticleStatusId } from '@/types/scoring';
import type { DashboardFilters } from '@/types/dashboard';

export function getStatusForPage(
  url: string,
  statuses: Record<string, ArticleStatus>,
): ArticleStatusId {
  return statuses[url]?.status ?? 'offen';
}

export function filterAndSortPages(
  pages: ScoredPage[],
  statuses: Record<string, ArticleStatus>,
  filters: DashboardFilters,
): ScoredPage[] {
  const searchLower = filters.search.toLowerCase();

  let result = pages.filter((page) => {
    // Status filter
    if (filters.statuses.length > 0) {
      const pageStatus = getStatusForPage(page.url, statuses);
      if (!filters.statuses.includes(pageStatus)) return false;
    }

    // Category filter
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(page.category)) return false;
    }

    // Impression range filter
    if (filters.impressionRange !== 'all') {
      const threshold =
        filters.impressionRange === '>10k' ? 10_000 :
        filters.impressionRange === '>5k' ? 5_000 : 1_000;
      if (page.impressionen < threshold) return false;
    }

    // Position range filter
    if (filters.positionRange !== 'all') {
      if (filters.positionRange === '1-10' && (page.position < 1 || page.position > 10)) return false;
      if (filters.positionRange === '11-20' && (page.position < 11 || page.position > 20)) return false;
      if (filters.positionRange === '20+' && page.position <= 20) return false;
    }

    // Text search (URL + keywords)
    if (searchLower) {
      const urlMatch = page.url.toLowerCase().includes(searchLower);
      const keywordMatch = page.keywords.some((k) =>
        k.keyword.toLowerCase().includes(searchLower),
      );
      if (!urlMatch && !keywordMatch) return false;
    }

    return true;
  });

  // Sort
  const dir = filters.sortDir === 'asc' ? 1 : -1;
  result = [...result].sort((a, b) => {
    let diff: number;
    switch (filters.sortBy) {
      case 'score':
        diff = a.score - b.score;
        break;
      case 'impressionen':
        diff = a.impressionen - b.impressionen;
        break;
      case 'position':
        diff = a.position - b.position;
        break;
      case 'ctr':
        diff = a.ctr - b.ctr;
        break;
      case 'potential':
        diff = a.estimatedPotential - b.estimatedPotential;
        break;
      default:
        diff = a.score - b.score;
    }
    return diff * dir;
  });

  return result;
}
