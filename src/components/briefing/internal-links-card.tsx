'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, ExternalLink } from 'lucide-react';
import { formatNumber, formatUrl } from '@/lib/format';
import type { BriefingInternalLink } from '@/types/briefing';

interface InternalLinksCardProps {
  links: BriefingInternalLink[];
}

export function InternalLinksCard({ links }: InternalLinksCardProps) {
  if (links.length === 0) return null;

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Link2 className="w-4 h-4 text-signal/70" />
          Interne Verlinkungsziele
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          {links.map((link, i) => (
            <div key={i} className="px-5 py-3 hover:bg-secondary/30 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:text-signal transition-colors inline-flex items-center gap-1"
                  >
                    {formatUrl(link.url)}
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Anker: &ldquo;{link.anchorSuggestion}&rdquo;
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {link.matchingKeywords.map((kw, j) => (
                      <Badge
                        key={j}
                        variant="outline"
                        className="text-[10px] bg-secondary text-muted-foreground border-border/40"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {formatNumber(link.impressionen)} Imp.
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
