'use client';

import { Badge } from '@/components/ui/badge';
import { ARTICLE_STATUSES } from '@/lib/status-config';
import { Circle, Clock, CheckCircle2, EyeOff } from 'lucide-react';
import type { ArticleStatusId } from '@/types/scoring';

const ICON_MAP = {
  Circle,
  Clock,
  CheckCircle2,
  EyeOff,
} as const;

interface StatusBadgeProps {
  status: ArticleStatusId;
  updatedAt?: string;
  compact?: boolean;
  className?: string;
}

export function StatusBadge({ status, updatedAt, compact, className }: StatusBadgeProps) {
  const info = ARTICLE_STATUSES[status];
  const Icon = ICON_MAP[info.icon];

  if (compact) {
    return (
      <span className={`inline-flex items-center justify-center ${info.color} ${className ?? ''}`}>
        <Icon className="w-3.5 h-3.5" />
      </span>
    );
  }

  const dateStr =
    status === 'optimiert' && updatedAt
      ? new Date(updatedAt).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        })
      : null;

  return (
    <Badge
      variant="outline"
      className={`${info.color} border-current/20 ${info.bgColor} font-medium text-xs gap-1.5 ${className ?? ''}`}
    >
      <Icon className="w-3 h-3" />
      {info.label}
      {dateStr && (
        <span className="text-[10px] opacity-70 ml-0.5">({dateStr})</span>
      )}
    </Badge>
  );
}
