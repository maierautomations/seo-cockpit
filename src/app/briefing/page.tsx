'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/shared/header';
import { BriefingInput } from '@/components/briefing/briefing-input';
import { BriefingProgress } from '@/components/briefing/briefing-progress';
import { BriefingResult } from '@/components/briefing/briefing-result';
import { useBriefing } from '@/hooks/use-briefing';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Loader2, Plus } from 'lucide-react';
import type { ContentBriefing } from '@/types/briefing';

function BriefingContent() {
  const searchParams = useSearchParams();
  const briefingId = searchParams.get('id');

  const { briefing, loading, error, step, generateBriefing, resetBriefing } =
    useBriefing();

  // Load saved briefing from Supabase if ID provided
  const [savedBriefing, setSavedBriefing] = useState<ContentBriefing | null>(null);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => {
    if (!briefingId) {
      setSavedBriefing(null);
      return;
    }

    setSavedLoading(true);
    fetch(`/api/supabase/briefings?id=${encodeURIComponent(briefingId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.briefing?.briefing_data) {
          setSavedBriefing(data.briefing.briefing_data as ContentBriefing);
        }
      })
      .catch(() => {
        // Silently fail
      })
      .finally(() => setSavedLoading(false));
  }, [briefingId]);

  const activeBriefing = savedBriefing ?? briefing;

  const handleReset = () => {
    setSavedBriefing(null);
    resetBriefing();
    // Remove ?id from URL without navigation
    window.history.replaceState(null, '', '/briefing');
  };

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-8">
      {/* Loading saved briefing */}
      {savedLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-64" />
        </div>
      )}

      {/* Input form — show when no briefing and not loading */}
      {!activeBriefing && !loading && !savedLoading && (
        <BriefingInput onGenerate={generateBriefing} loading={loading} />
      )}

      {/* Error display */}
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading progress */}
      {loading && <BriefingProgress step={step} />}

      {/* Results (from generation or saved) */}
      {activeBriefing && !loading && !savedLoading && (
        <>
          {savedBriefing && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Gespeichertes Briefing</p>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
              >
                <Plus className="w-3 h-3" />
                Neues Briefing
              </Button>
            </div>
          )}
          <BriefingResult briefing={activeBriefing} onReset={handleReset} />
        </>
      )}
    </main>
  );
}

export default function BriefingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-signal" /></div>}>
        <BriefingContent />
      </Suspense>
    </div>
  );
}
