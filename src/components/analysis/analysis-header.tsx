'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { CategoryBadge } from '@/components/shared/category-badge';
import { formatNumber, formatPercent, formatDecimal } from '@/lib/format';
import type { ArticleAnalysis } from '@/types/analysis';
import type { ScoredPage } from '@/types/scoring';

interface AnalysisHeaderProps {
  analysis: ArticleAnalysis;
  page?: ScoredPage;
}

export function AnalysisHeader({ analysis, page }: AnalysisHeaderProps) {
  return (
    <div className="space-y-4">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-signal transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Zurück zum Dashboard
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {analysis.title || 'Artikel-Analyse'}
        </h1>
        <a
          href={analysis.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-signal transition-colors inline-flex items-center gap-1"
        >
          {analysis.url}
          <ExternalLink className="w-3 h-3" />
        </a>
        {page && (
          <div className="flex items-center gap-3 pt-1">
            <CategoryBadge category={page.category} />
            <span className="text-sm text-muted-foreground tabular-nums">
              Pos. {formatDecimal(page.position)}
            </span>
            <span className="text-border">·</span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {formatNumber(page.impressionen)} Imp.
            </span>
            <span className="text-border">·</span>
            <span className="text-sm text-muted-foreground tabular-nums">
              CTR {formatPercent(page.ctr)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
