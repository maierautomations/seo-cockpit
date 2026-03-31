'use client';

import { Header } from '@/components/shared/header';
import { BriefingInput } from '@/components/briefing/briefing-input';
import { BriefingProgress } from '@/components/briefing/briefing-progress';
import { BriefingResult } from '@/components/briefing/briefing-result';
import { useBriefing } from '@/hooks/use-briefing';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function BriefingPage() {
  const { briefing, loading, error, step, generateBriefing, resetBriefing } =
    useBriefing();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-8">
        {/* Input form — always show when no briefing and not loading */}
        {!briefing && !loading && (
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

        {/* Results */}
        {briefing && !loading && (
          <BriefingResult briefing={briefing} onReset={resetBriefing} />
        )}
      </main>
    </div>
  );
}
