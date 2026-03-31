'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyBlock } from '@/components/analysis/copy-block';
import { ListTree } from 'lucide-react';
import type { BriefingHeading } from '@/types/briefing';

interface HeadingStructureCardProps {
  headings: BriefingHeading[];
}

export function HeadingStructureCard({ headings }: HeadingStructureCardProps) {
  const h1 = headings.find((h) => h.level === 'h1');
  const h2s = headings.filter((h) => h.level === 'h2');

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ListTree className="w-4 h-4 text-signal/70" />
          Heading-Struktur
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 space-y-4">
        {h1 && (
          <CopyBlock content={h1.text} label="H1" />
        )}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            H2-Gliederung
          </p>
          {h2s.map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xs text-muted-foreground tabular-nums font-mono mt-2.5 shrink-0 w-5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <CopyBlock content={h.text} />
                {h.note && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {h.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
