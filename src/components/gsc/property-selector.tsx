'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useGsc } from '@/hooks/use-gsc';
import { useSeoStore } from '@/lib/store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Globe, Calendar, ArrowRight } from 'lucide-react';

type DatePreset = '3months' | '6months' | '12months';

const DATE_PRESETS: Record<DatePreset, string> = {
  '3months': 'Letzte 3 Monate',
  '6months': 'Letzte 6 Monate',
  '12months': 'Letztes Jahr',
};

function getDateRange(preset: DatePreset): { startDate: string; endDate: string } {
  const end = new Date();
  // GSC data has a 2-3 day delay
  end.setDate(end.getDate() - 3);
  const start = new Date(end);

  switch (preset) {
    case '3months':
      start.setMonth(start.getMonth() - 3);
      break;
    case '6months':
      start.setMonth(start.getMonth() - 6);
      break;
    case '12months':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

function formatPropertyName(siteUrl: string): string {
  // sc-domain:example.com → example.com
  // https://example.com/ → example.com
  return siteUrl
    .replace(/^sc-domain:/, '')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

export function PropertySelector() {
  const { data: session } = useSession();
  const { gscConnection } = useSeoStore();
  const {
    sites,
    sitesLoading,
    dataLoading,
    error,
    loadingStep,
    loadingStepLabel,
    totalRows,
    fetchSites,
    loadData,
  } = useGsc();

  // Restore last-used property, or pick first
  const [selectedProperty, setSelectedProperty] = useState<string>(
    gscConnection.property ?? '',
  );
  const [datePreset, setDatePreset] = useState<DatePreset>('3months');

  // Fetch sites on mount
  useEffect(() => {
    if (session?.accessToken) {
      fetchSites();
    }
  }, [session?.accessToken, fetchSites]);

  // Auto-select first site when sites load
  useEffect(() => {
    if (sites.length > 0 && !selectedProperty) {
      setSelectedProperty(sites[0].siteUrl);
    }
  }, [sites, selectedProperty]);

  const steps = useMemo(() => {
    const allSteps = [
      { key: 'loading-data', label: 'Suchdaten laden' },
      { key: 'scoring', label: 'Scores berechnen' },
      { key: 'done', label: 'Fertig' },
    ] as const;

    const currentIdx = allSteps.findIndex((s) => s.key === loadingStep);

    return allSteps.map((step, idx) => ({
      ...step,
      status:
        idx < currentIdx
          ? ('completed' as const)
          : idx === currentIdx
            ? ('active' as const)
            : ('pending' as const),
    }));
  }, [loadingStep]);

  function handleLoadData() {
    if (!selectedProperty) return;
    const { startDate, endDate } = getDateRange(datePreset);
    loadData(selectedProperty, startDate, endDate);
  }

  // Loading state: progress steps
  if (dataLoading || loadingStep === 'done') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-8">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                {loadingStepLabel}
              </p>
              {totalRows !== null && loadingStep === 'done' && (
                <p className="text-xs text-muted-foreground">
                  {totalRows.toLocaleString('de-DE')} Zeilen verarbeitet
                </p>
              )}
            </div>

            {/* Step indicators */}
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      step.status === 'completed'
                        ? 'bg-signal/20 text-signal'
                        : step.status === 'active'
                          ? 'bg-signal/10 border border-signal/40'
                          : 'bg-secondary/50 border border-border/40'
                    }`}
                  >
                    {step.status === 'completed' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : step.status === 'active' ? (
                      <Loader2 className="w-3.5 h-3.5 text-signal animate-spin" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      step.status === 'completed'
                        ? 'text-signal'
                        : step.status === 'active'
                          ? 'text-foreground'
                          : 'text-muted-foreground/50'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 space-y-5">
        {/* Property selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            Property
          </label>
          {sitesLoading ? (
            <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border/60 bg-secondary/30">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
              <span className="text-sm text-muted-foreground">
                Lade Properties...
              </span>
            </div>
          ) : sites.length === 0 ? (
            <div className="h-10 px-3 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center">
              <span className="text-sm text-destructive">
                Keine Properties gefunden
              </span>
            </div>
          ) : (
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
            >
              <SelectTrigger className="h-10 bg-secondary/30 border-border/60">
                <SelectValue placeholder="Property auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.siteUrl} value={site.siteUrl}>
                    {formatPropertyName(site.siteUrl)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Date range */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            Zeitraum
          </label>
          <Select
            value={datePreset}
            onValueChange={(v) => setDatePreset(v as DatePreset)}
          >
            <SelectTrigger className="h-10 bg-secondary/30 border-border/60">
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
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Load button */}
        <Button
          onClick={handleLoadData}
          disabled={!selectedProperty || dataLoading}
          className="w-full h-11 bg-signal hover:bg-signal-dim text-background font-medium transition-all duration-200"
        >
          <span className="flex items-center gap-2">
            Daten laden
            <ArrowRight className="w-4 h-4" />
          </span>
        </Button>
      </div>
    </div>
  );
}
