'use client';

import { useMemo } from 'react';
import { Circle, Clock, CheckCircle2, EyeOff } from 'lucide-react';
import { ARTICLE_STATUSES, STATUS_ORDER } from '@/lib/status-config';
import { getStatusForPage } from '@/lib/filter-pages';
import type { ScoredPage, ArticleStatus, ArticleStatusId } from '@/types/scoring';

const STATUS_ICONS = { Circle, Clock, CheckCircle2, EyeOff } as const;

interface StatusOverviewProps {
  pages: ScoredPage[];
  articleStatuses: Record<string, ArticleStatus>;
  activeStatuses?: ArticleStatusId[];
  onStatusClick?: (status: ArticleStatusId) => void;
}

export function StatusOverview({
  pages,
  articleStatuses,
  activeStatuses,
  onStatusClick,
}: StatusOverviewProps) {
  const counts = useMemo(() => {
    const result: Record<ArticleStatusId, number> = {
      'offen': 0,
      'in-bearbeitung': 0,
      'optimiert': 0,
      'ignoriert': 0,
    };
    for (const page of pages) {
      const status = getStatusForPage(page.url, articleStatuses);
      result[status]++;
    }
    return result;
  }, [pages, articleStatuses]);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {STATUS_ORDER.map((id, i) => {
        const info = ARTICLE_STATUSES[id];
        const Icon = STATUS_ICONS[info.icon];
        const count = counts[id];
        const isActive = activeStatuses?.includes(id);
        const isClickable = !!onStatusClick;

        return (
          <span key={id} className="contents">
            {i > 0 && <span className="text-border/50 text-xs mx-1">|</span>}
            <button
              onClick={() => onStatusClick?.(id)}
              disabled={!isClickable}
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors ${
                isClickable
                  ? 'hover:bg-secondary/60 cursor-pointer'
                  : 'cursor-default'
              } ${isActive ? 'bg-secondary/60 ring-1 ring-signal/20' : ''}`}
            >
              <Icon className={`w-3 h-3 ${info.color}`} />
              <span className="tabular-nums font-medium">{count}</span>
              <span className="text-muted-foreground">{info.label}</span>
            </button>
          </span>
        );
      })}
    </div>
  );
}
