'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { CategoryBadge } from '@/components/shared/category-badge';
import { ScoreBar } from '@/components/shared/score-bar';
import { StatusSelect } from '@/components/shared/status-select';
import { formatNumber, formatCompact, formatPercent, formatDecimal, truncateUrl } from '@/lib/format';
import type { ScoredPage } from '@/types/scoring';
import type { DashboardFilters } from '@/types/dashboard';

interface ArticleListProps {
  pages: ScoredPage[];
  filters: DashboardFilters;
  onFilterChange: (partial: Partial<DashboardFilters>) => void;
}

type SortableColumn = DashboardFilters['sortBy'];

const SORTABLE_COLUMNS: Array<{ key: SortableColumn; label: string }> = [
  { key: 'position', label: 'Pos.' },
  { key: 'impressionen', label: 'Imp.' },
  { key: 'ctr', label: 'CTR' },
  { key: 'score', label: 'Score' },
  { key: 'potential', label: 'Potenzial' },
];

export function ArticleList({ pages, filters, onFilterChange }: ArticleListProps) {
  const searchParams = useSearchParams();
  const demoSuffix = searchParams.get('demo') === 'true' ? '&demo=true' : '';
  const { page, pageSize } = filters;
  const totalPages = Math.max(1, Math.ceil(pages.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * pageSize;
  const visiblePages = pages.slice(start, start + pageSize);

  const handleSort = (key: SortableColumn) => {
    if (filters.sortBy === key) {
      onFilterChange({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      onFilterChange({ sortBy: key, sortDir: 'desc', page: 0 });
    }
  };

  const renderSortIcon = (key: SortableColumn) => {
    if (filters.sortBy !== key) {
      return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />;
    }
    return filters.sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-signal" />
    ) : (
      <ArrowDown className="w-3 h-3 text-signal" />
    );
  };

  if (pages.length === 0) {
    return (
      <div className="rounded-xl border border-border/40 bg-card/40 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Keine Artikel gefunden. Passe die Filter an.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/40 hover:bg-transparent">
            <TableHead className="w-[52px] text-xs">Status</TableHead>
            <TableHead className="text-xs">Kategorie</TableHead>
            <TableHead className="text-xs min-w-[200px]">URL</TableHead>
            {SORTABLE_COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                className="text-xs text-right cursor-pointer group select-none"
                onClick={() => handleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  {col.label}
                  {renderSortIcon(col.key)}
                </span>
              </TableHead>
            ))}
            <TableHead className="text-xs text-right">KW</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visiblePages.map((p) => (
            <TableRow
              key={p.url}
              className="border-border/30 group/row"
            >
              <TableCell className="py-2.5" onClick={(e) => e.stopPropagation()}>
                <StatusSelect url={p.url} />
              </TableCell>
              <TableCell className="py-2.5">
                <CategoryBadge category={p.category} />
              </TableCell>
              <TableCell className="py-2.5">
                <Link
                  href={`/article?url=${encodeURIComponent(p.url)}${demoSuffix}`}
                  className="text-sm text-foreground hover:text-signal transition-colors truncate block max-w-[320px]"
                  title={p.url}
                >
                  {truncateUrl(p.url, 45)}
                </Link>
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm text-muted-foreground py-2.5">
                {formatDecimal(p.position)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm text-muted-foreground py-2.5">
                {formatCompact(p.impressionen)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm text-muted-foreground py-2.5">
                {formatPercent(p.ctr)}
              </TableCell>
              <TableCell className="text-right py-2.5">
                <ScoreBar score={p.score} />
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm py-2.5">
                {p.estimatedPotential > 0 ? (
                  <span className="text-signal/70">+{formatNumber(p.estimatedPotential)}</span>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums text-xs text-muted-foreground py-2.5">
                {p.keywordCount}
              </TableCell>
              <TableCell className="py-2.5">
                <Link
                  href={`/article?url=${encodeURIComponent(p.url)}${demoSuffix}`}
                  className="text-muted-foreground group-hover/row:text-signal transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            disabled={currentPage === 0}
            onClick={() => onFilterChange({ page: currentPage - 1 })}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Zurück
          </Button>

          <span className="text-xs text-muted-foreground tabular-nums">
            Seite {currentPage + 1} von {totalPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            disabled={currentPage >= totalPages - 1}
            onClick={() => onFilterChange({ page: currentPage + 1 })}
          >
            Weiter
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
