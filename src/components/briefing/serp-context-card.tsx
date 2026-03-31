'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Globe, TrendingUp, Target, ExternalLink } from 'lucide-react';
import type { ContentBriefing } from '@/types/briefing';

interface SerpContextCardProps {
  briefing: ContentBriefing;
}

export function SerpContextCard({ briefing }: SerpContextCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-card/60 border-border/60 border-dashed">
      <CardHeader className="pb-0 px-5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Globe className="w-4 h-4" />
            SERP-Kontext
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <span>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </span>
          </Button>
        </button>
        {!expanded && (
          <p className="text-xs text-muted-foreground/60 mt-1 pb-4">
            {briefing.serpTopResults.length} Ergebnisse &middot;{' '}
            {briefing.titlePatterns.length} Titel-Muster &middot;{' '}
            {briefing.topicCoverage.length} Themen &middot;{' '}
            {briefing.peopleAlsoAsk.length} Fragen
          </p>
        )}
      </CardHeader>
      {expanded && (
        <CardContent className="px-5 pt-4 space-y-6">
          {/* Title patterns */}
          {briefing.titlePatterns.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Titel-Muster
              </h4>
              <div className="space-y-1.5">
                {briefing.titlePatterns.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{p.pattern}</span>
                    <Badge
                      variant="outline"
                      className="text-[11px] tabular-nums bg-signal/5 text-signal border-signal/20"
                    >
                      {p.count}/{p.total}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topic coverage */}
          {briefing.topicCoverage.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Target className="w-3.5 h-3.5" />
                Themen-Coverage
              </h4>
              <div className="space-y-2">
                {briefing.topicCoverage.map((t, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{t.topic}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {t.count}/{t.total}
                      </span>
                    </div>
                    <div className="h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-signal/60 transition-all duration-500"
                        style={{ width: `${(t.count / t.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People also ask */}
          {briefing.peopleAlsoAsk.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Nutzer fragen auch
              </h4>
              <div className="space-y-1">
                {briefing.peopleAlsoAsk.map((q, i) => (
                  <p key={i} className="text-sm text-foreground">
                    <span className="text-muted-foreground mr-1.5">Q:</span>
                    {q}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Featured snippet */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Featured Snippet
            </h4>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">Typ:</span>
              <Badge variant="outline" className="text-xs text-signal bg-signal/5 border-signal/20">
                {briefing.featuredSnippetChance.type}
              </Badge>
            </div>
            <p className="text-sm text-foreground">{briefing.featuredSnippetChance.recommendation}</p>
          </div>

          {/* Top results */}
          {briefing.serpTopResults.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Top-{briefing.serpTopResults.length} Suchergebnisse
              </h4>
              <div className="space-y-2">
                {briefing.serpTopResults.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums font-mono mt-0.5 shrink-0 w-5">
                      {String(r.position).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground hover:text-signal transition-colors inline-flex items-center gap-1"
                      >
                        {r.title}
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                      </a>
                      <p className="text-xs text-muted-foreground">{r.domain}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
