'use client';

import { useSession } from 'next-auth/react';
import { useGsc } from '@/hooks/use-gsc';
import { useSeoStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogOut, Globe, Loader2 } from 'lucide-react';

function formatPropertyName(siteUrl: string): string {
  return siteUrl
    .replace(/^sc-domain:/, '')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

export function GscStatusBanner() {
  const { data: session } = useSession();
  const { gscConnection } = useSeoStore();
  const { loadData, disconnect, dataLoading } = useGsc();

  if (gscConnection.dataSource !== 'gsc' || !gscConnection.property) {
    return null;
  }

  function handleRefresh() {
    if (!gscConnection.property || !gscConnection.dateRange) return;
    loadData(
      gscConnection.property,
      gscConnection.dateRange.startDate,
      gscConnection.dateRange.endDate,
    );
  }

  const connectedAt = gscConnection.connectedAt
    ? new Date(gscConnection.connectedAt).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

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
          {connectedAt && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-muted-foreground text-xs whitespace-nowrap">
                {connectedAt}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
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
