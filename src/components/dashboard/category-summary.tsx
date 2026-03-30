'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES } from '@/lib/scoring/categories';
import type { ScoredPage } from '@/types/scoring';
import type { CategoryId } from '@/types/scoring';

interface CategorySummaryProps {
  pages: ScoredPage[];
  activeCategories?: CategoryId[];
  onCategoryClick?: (category: CategoryId) => void;
}

const CATEGORY_ORDER: CategoryId[] = [
  'content-problem',
  'packaging-problem',
  'quick-win',
  'low-priority',
];

const CATEGORY_COLORS: Record<CategoryId, string> = {
  'content-problem': 'bg-emerald-500',
  'packaging-problem': 'bg-amber-500',
  'quick-win': 'bg-blue-500',
  'low-priority': 'bg-slate-500',
};

export function CategorySummary({ pages, activeCategories, onCategoryClick }: CategorySummaryProps) {
  const counts = pages.reduce(
    (acc, page) => {
      acc[page.category] = (acc[page.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<CategoryId, number>,
  );

  const total = pages.length;

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-4 px-6">
        <CardTitle className="text-base font-semibold tracking-tight">Verteilung</CardTitle>
      </CardHeader>
      <CardContent className="px-6 space-y-4">
        {CATEGORY_ORDER.map((id) => {
          const info = CATEGORIES[id];
          const count = counts[id] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;

          const isActive = activeCategories?.includes(id);
          const isClickable = !!onCategoryClick;

          return (
            <div
              key={id}
              onClick={() => onCategoryClick?.(id)}
              className={`rounded-lg px-2 py-2 -mx-2 transition-colors ${
                isClickable ? 'cursor-pointer hover:bg-secondary/50' : ''
              } ${isActive ? 'bg-secondary/60 ring-1 ring-signal/20' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{info.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{info.label}</span>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {count} Artikel
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${CATEGORY_COLORS[id]} transition-all duration-700 ease-out`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Total */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Gesamt</span>
            <span className="text-sm font-medium text-foreground tabular-nums">
              {total} Seiten
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
