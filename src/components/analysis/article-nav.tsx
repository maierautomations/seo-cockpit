'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArticleNavProps {
  prevUrl: string | null;
  nextUrl: string | null;
  currentIndex: number;
  total: number;
}

export function ArticleNav({ prevUrl, nextUrl, currentIndex, total }: ArticleNavProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        {prevUrl ? (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground" asChild>
            <Link href={`/article?url=${encodeURIComponent(prevUrl)}`}>
              <ChevronLeft className="w-3.5 h-3.5" />
              Vorheriger
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>

      <span className="text-xs text-muted-foreground tabular-nums">
        {currentIndex + 1} / {total}
      </span>

      <div>
        {nextUrl ? (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground" asChild>
            <Link href={`/article?url=${encodeURIComponent(nextUrl)}`}>
              Nächster
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
