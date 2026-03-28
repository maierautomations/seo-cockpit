'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { StructureCheck as StructureCheckType } from '@/types/analysis';

interface StructureCheckProps {
  structure: StructureCheckType;
}

type Status = 'ok' | 'warning' | 'error';

interface CheckItem {
  label: string;
  status: Status;
  detail: string;
}

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

export function StructureCheck({ structure }: StructureCheckProps) {
  const checks: CheckItem[] = [
    {
      label: 'H1',
      status: structure.h1.present
        ? structure.h1.containsKeyword
          ? 'ok'
          : 'warning'
        : 'error',
      detail: structure.h1.present
        ? structure.h1.containsKeyword
          ? `Vorhanden, enthält Keyword: "${structure.h1.text}"`
          : `Vorhanden, aber ohne Keyword: "${structure.h1.text}"`
        : 'Fehlt',
    },
    {
      label: 'H2-Struktur',
      status: structure.h2s.length >= 3 ? 'ok' : structure.h2s.length > 0 ? 'warning' : 'error',
      detail: `${structure.h2s.length} H2-Überschriften gefunden`,
    },
    {
      label: 'FAQ-Block',
      status: structure.faqBlock ? 'ok' : 'error',
      detail: structure.faqBlock ? 'Vorhanden' : 'Fehlt — stark empfohlen für SERP-Features',
    },
    {
      label: 'Infoboxen',
      status: structure.infoboxCount >= 2 ? 'ok' : structure.infoboxCount > 0 ? 'warning' : 'error',
      detail: `${structure.infoboxCount} Infobox${structure.infoboxCount !== 1 ? 'en' : ''} (Empfehlung: 2+)`,
    },
    {
      label: 'Vergleichstabelle',
      status: structure.comparisonTable ? 'ok' : 'warning',
      detail: structure.comparisonTable ? 'Vorhanden' : 'Nicht gefunden',
    },
    {
      label: 'Quellenblock',
      status: structure.sourceBlock.present
        ? structure.sourceBlock.count >= 4
          ? 'ok'
          : 'warning'
        : 'error',
      detail: structure.sourceBlock.present
        ? `${structure.sourceBlock.count} Quellen (Empfehlung: 4+)`
        : 'Fehlt',
    },
  ];

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Strukturcheck</CardTitle>
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
