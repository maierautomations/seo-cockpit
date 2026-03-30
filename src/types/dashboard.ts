import type { CategoryId, ArticleStatusId } from './scoring';

export interface DashboardFilters {
  categories: CategoryId[];
  impressionRange: 'all' | '>10k' | '>5k' | '>1k';
  positionRange: 'all' | '1-10' | '11-20' | '20+';
  statuses: ArticleStatusId[];
  sortBy: 'score' | 'impressionen' | 'position' | 'ctr' | 'potential';
  sortDir: 'asc' | 'desc';
  search: string;
  page: number;
  pageSize: number;
}

export const DEFAULT_FILTERS: DashboardFilters = {
  categories: [],
  impressionRange: 'all',
  positionRange: 'all',
  statuses: [],
  sortBy: 'score',
  sortDir: 'desc',
  search: '',
  page: 0,
  pageSize: 25,
};
