'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { SeoCheck as SeoCheckType } from '@/types/analysis';

interface SeoCheckProps {
  seo: SeoCheckType;
}

type Status = 'ok' | 'warning' | 'error';

function StatusIcon({ status }: { status: Status }) {
  switch (status) {
    case 'ok':
      return <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />;
    case 'error':
      return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
  }
}

export function SeoCheckComponent({ seo }: SeoCheckProps) {
  const titleStatus: Status = seo.seoTitle.inRange
    ? 'ok'
    : seo.seoTitle.length > 0
      ? 'warning'
      : 'error';

  const metaStatus: Status = seo.metaDescription.present
    ? seo.metaDescription.length >= 140 && seo.metaDescription.length <= 160
      ? 'ok'
      : 'warning'
    : 'error';

  const altStatus: Status = seo.altTexts.missing === 0
    ? 'ok'
    : seo.altTexts.missing <= 2
      ? 'warning'
      : 'error';

  const linkStatus: Status = seo.internalLinks.count >= 3
    ? 'ok'
    : seo.internalLinks.count > 0
      ? 'warning'
      : 'error';

  const checks = [
    {
      label: 'SEO-Titel',
      status: titleStatus,
      detail: `${seo.seoTitle.length} Zeichen (Ziel: 55–65)${seo.seoTitle.text ? `: "${seo.seoTitle.text}"` : ''}`,
    },
    {
      label: 'Meta-Description',
      status: metaStatus,
      detail: seo.metaDescription.present
        ? `${seo.metaDescription.length} Zeichen (Ziel: 140–160)`
        : 'Fehlt',
    },
    {
      label: 'Alt-Texte',
      status: altStatus,
      detail: seo.altTexts.total === 0
        ? 'Keine Bilder gefunden'
        : `${seo.altTexts.missing} von ${seo.altTexts.total} Bildern ohne Alt-Text`,
    },
    {
      label: 'Interne Links',
      status: linkStatus,
      detail: `${seo.internalLinks.count} interne Links gefunden`,
    },
  ];

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">SEO-Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {checks.map((check) => (
          <div key={check.label} className="flex items-start gap-2.5">
            <StatusIcon status={check.status} />
            <div>
              <p className="text-sm font-medium">{check.label}</p>
              <p className="text-xs text-muted-foreground">{check.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
