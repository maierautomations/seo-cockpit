'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { CategoryBadge } from '@/components/shared/category-badge';
import { ScoreBar } from '@/components/shared/score-bar';
import { formatNumber, formatPercent, formatDecimal, truncateUrl } from '@/lib/format';
import type { ScoredPage } from '@/types/scoring';

interface TopCandidatesProps {
  pages: ScoredPage[];
  limit?: number;
}

export function TopCandidates({ pages, limit = 10 }: TopCandidatesProps) {
  const top = pages.slice(0, limit);

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-4 px-6">
        <CardTitle className="text-base font-semibold tracking-tight">
          Top-{limit} Optimierungskandidaten
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {top.map((page, idx) => (
            <Link
              key={page.url}
              href={`/article?url=${encodeURIComponent(page.url)}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors group"
            >
              <span className="text-xs text-muted-foreground tabular-nums w-5 shrink-0 font-mono">
                {String(idx + 1).padStart(2, '0')}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <CategoryBadge category={page.category} />
                  <span className="text-sm font-medium truncate text-foreground">
                    {truncateUrl(page.url, 55)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="tabular-nums">Pos. {formatDecimal(page.position)}</span>
                  <span className="text-border">·</span>
                  <span className="tabular-nums">{formatNumber(page.impressionen)} Imp.</span>
                  <span className="text-border">·</span>
                  <span className="tabular-nums">CTR {formatPercent(page.ctr)}</span>
                  <span className="text-border">·</span>
                  <span>{page.keywordCount} KW</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <ScoreBar score={page.score} />
                  {page.estimatedPotential > 0 && (
                    <p className="text-[11px] text-signal/70 mt-0.5 tabular-nums">
                      +{formatNumber(page.estimatedPotential)} Klicks/Q
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-signal transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
