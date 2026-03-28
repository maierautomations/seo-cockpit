'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MousePointerClick, Eye, BarChart3, Crosshair } from 'lucide-react';
import { formatNumber, formatCompact, formatPercent, formatDecimal } from '@/lib/format';
import type { DashboardOverview } from '@/types/gsc';

interface KpiCardsProps {
  overview: DashboardOverview;
}

const kpis = [
  {
    key: 'klicks' as const,
    label: 'Klicks',
    icon: MousePointerClick,
    format: (v: number) => formatNumber(v),
  },
  {
    key: 'impressionen' as const,
    label: 'Impressionen',
    icon: Eye,
    format: (v: number) => formatCompact(v),
  },
  {
    key: 'ctr' as const,
    label: 'Ø CTR',
    icon: BarChart3,
    format: (v: number) => formatPercent(v),
  },
  {
    key: 'position' as const,
    label: 'Ø Position',
    icon: Crosshair,
    format: (v: number) => formatDecimal(v),
  },
];

export function KpiCards({ overview }: KpiCardsProps) {
  const values = {
    klicks: overview.totalKlicks,
    impressionen: overview.totalImpressionen,
    ctr: overview.avgCtr,
    position: overview.avgPosition,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.key} className="bg-card/60 border-border/60 py-5 px-6">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Icon className="w-3.5 h-3.5 text-signal/60" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  {kpi.label}
                </span>
              </div>
              <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {kpi.format(values[kpi.key])}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
