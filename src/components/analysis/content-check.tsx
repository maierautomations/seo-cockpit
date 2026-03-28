'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { ContentAnalysis } from '@/types/analysis';

interface ContentCheckProps {
  content: ContentAnalysis;
}

export function ContentCheck({ content }: ContentCheckProps) {
  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Content-Analyse (KI)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Financial data check */}
        {content.financialData.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Finanzdaten-Check
            </p>
            <div className="space-y-1.5">
              {content.financialData.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  {item.status === 'ok' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                  ) : item.status === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-sm">{item.text}</span>
                    {item.note && (
                      <span className="text-xs text-muted-foreground ml-1.5">
                        — {item.note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keyword coverage */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Keyword-Abdeckung
          </p>
          <div className="text-sm space-y-1">
            <p>
              Keyword &quot;{content.keywordCoverage.keyword}&quot;:{' '}
              <span className="font-medium">{content.keywordCoverage.count}x</span> im Text
            </p>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>
                H1: {content.keywordCoverage.inH1 ? '✓' : '✗'}
              </span>
              <span>
                H2: {content.keywordCoverage.inH2 ? '✓' : '✗'}
              </span>
              <span>
                Meta: {content.keywordCoverage.inMeta ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>

        {/* Content depth */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
            Inhaltliche Tiefe
          </p>
          <p className="text-sm">
            {content.contentDepth === 'deep'
              ? '✅ Tiefgehend'
              : content.contentDepth === 'adequate'
                ? '⚠️ Ausreichend'
                : '❌ Oberflächlich'}
          </p>
        </div>

        {/* Missing topics */}
        {content.missingTopics.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Fehlende Themen
            </p>
            <ul className="space-y-1">
              {content.missingTopics.map((topic, i) => (
                <li key={i} className="text-sm flex items-start gap-1.5">
                  <span className="text-red-500 shrink-0">•</span>
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
