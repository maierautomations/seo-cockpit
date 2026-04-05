'use client';

import { useSession } from 'next-auth/react';
import { useGsc } from '@/hooks/use-gsc';
import { useSeoStore } from '@/lib/store';
import { type DatePreset, DATE_PRESETS, getDateRange } from '@/lib/gsc/date-presets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogOut, Globe, Loader2 } from 'lucide-react';
import { formatNumber, formatCompact } from '@/lib/format';

function formatPropertyName(siteUrl: string): string {
  return siteUrl
    .replace(/^sc-domain:/, '')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

export function GscStatusBanner() {
  const { data: session } = useSession();
  const { gscConnection, overview } = useSeoStore();
  const { loadData, disconnect, dataLoading, totalRows } = useGsc();

  if (gscConnection.dataSource !== 'gsc' || !gscConnection.property) {
    return null;
  }

  function handleRefresh() {
    if (!gscConnection.property || !gscConnection.dateRange) return;
    loadData(
      gscConnection.property,
      gscConnection.dateRange.startDate,
      gscConnection.dateRange.endDate,
      gscConnection.datePreset,
    );
  }

  function handleDatePresetChange(preset: string) {
    if (!gscConnection.property) return;
    const { startDate, endDate } = getDateRange(preset as DatePreset);
    loadData(gscConnection.property, startDate, endDate, preset);
  }

  const totalPages = overview?.totalPages ?? 0;
  const isDataCapped = totalRows !== null && totalRows >= 100_000;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-signal/15 bg-signal/[0.04] px-4 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        {/* User avatar */}
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt=""
            className="w-6 h-6 rounded-full ring-1 ring-signal/20 shrink-0"
          />
        )}

        <div className="flex items-center gap-2 text-sm min-w-0">
          <Globe className="w-3.5 h-3.5 text-signal shrink-0" />
          <span className="text-foreground font-medium truncate">
            {formatPropertyName(gscConnection.property)}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {formatNumber(totalPages)} Seiten
            {isDataCapped && ' (Top 100k Keywords)'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Date range selector */}
        <Select
          value={gscConnection.datePreset ?? '3months'}
          onValueChange={handleDatePresetChange}
          disabled={dataLoading}
        >
          <SelectTrigger className="h-7 w-auto min-w-[130px] px-2.5 text-xs border-none bg-transparent text-muted-foreground hover:text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(DATE_PRESETS) as [DatePreset, string][]).map(
              ([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={dataLoading}
          className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
        >
          {dataLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span className="ml-1.5">Aktualisieren</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnect()}
          className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="ml-1.5">Trennen</span>
        </Button>
      </div>
    </div>
  );
}
