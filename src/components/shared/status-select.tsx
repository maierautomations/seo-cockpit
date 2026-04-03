'use client';

import { useSeoStore } from '@/lib/store';
import { ARTICLE_STATUSES, STATUS_ORDER } from '@/lib/status-config';
import { StatusBadge } from './status-badge';
import { Circle, Clock, CheckCircle2, EyeOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { ArticleStatusId } from '@/types/scoring';

const ICON_MAP = {
  Circle,
  Clock,
  CheckCircle2,
  EyeOff,
} as const;

interface StatusSelectProps {
  url: string;
  className?: string;
  onStatusChange?: (url: string, status: ArticleStatusId) => void;
}

export function StatusSelect({ url, className, onStatusChange }: StatusSelectProps) {
  const articleStatuses = useSeoStore((s) => s.articleStatuses);
  const setArticleStatus = useSeoStore((s) => s.setArticleStatus);
  const currentStatus: ArticleStatusId = articleStatuses[url]?.status ?? 'offen';

  const handleChange = (statusId: ArticleStatusId) => {
    if (onStatusChange) {
      onStatusChange(url, statusId);
    } else {
      setArticleStatus(url, statusId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-secondary/60 transition-colors cursor-pointer outline-none ${className ?? ''}`}
      >
        <StatusBadge status={currentStatus} compact />
        <svg className="w-3 h-3 text-muted-foreground opacity-60" viewBox="0 0 12 12" fill="none">
          <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        <DropdownMenuLabel>Status ändern</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUS_ORDER.map((statusId) => {
          const info = ARTICLE_STATUSES[statusId];
          const Icon = ICON_MAP[info.icon];
          const isActive = statusId === currentStatus;

          return (
            <DropdownMenuItem
              key={statusId}
              onClick={() => handleChange(statusId)}
              className={isActive ? 'bg-secondary/50' : ''}
            >
              <Icon className={`w-3.5 h-3.5 ${info.color}`} />
              <span className={isActive ? 'font-medium' : ''}>{info.label}</span>
              {isActive && (
                <span className="ml-auto text-xs text-muted-foreground">aktiv</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
