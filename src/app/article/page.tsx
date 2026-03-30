'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useSeoStore } from '@/lib/store';
import { useArticleAnalysis } from '@/hooks/use-article-analysis';
import { useSerpAnalysis } from '@/hooks/use-serp-analysis';
import { Header } from '@/components/shared/header';
import { AnalysisHeader } from '@/components/analysis/analysis-header';
import { StructureCheck } from '@/components/analysis/structure-check';
import { SeoCheckComponent } from '@/components/analysis/seo-check';
import { ContentCheck } from '@/components/analysis/content-check';
import { AiSuggestions } from '@/components/analysis/ai-suggestions';
import { SerpResultsPanel } from '@/components/serp/serp-results-panel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

function ArticleContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url') ?? '';
  const pages = useSeoStore((s) => s.pages);
  const page = pages.find((p) => p.url === url);

  const {
    activeAnalysis,
    analysisLoading,
    analyzeArticle,
    runAiAnalysis,
  } = useArticleAnalysis();

  const {
    serpAnalysis,
    serpLoading,
    serpError,
    runSerpAnalysis,
  } = useSerpAnalysis();

  // Auto-analyze when page loads
  useEffect(() => {
    if (page && (!activeAnalysis || activeAnalysis.url !== url)) {
      analyzeArticle(page).then((res) => {
        if (!res.success) {
          toast.error(res.error ?? 'Analyse fehlgeschlagen');
        }
      });
    }
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAiAnalysis = async () => {
    const res = await runAiAnalysis();
    if (res.success) {
      toast.success('KI-Analyse abgeschlossen');
    } else {
      toast.error(res.error ?? 'KI-Analyse fehlgeschlagen');
    }
  };

  const handleSerpCheck = async () => {
    const mainKeyword = page?.keywords[0]?.keyword ?? '';
    if (!mainKeyword) {
      toast.error('Kein Keyword vorhanden fur SERP-Analyse');
      return;
    }
    const res = await runSerpAnalysis(
      mainKeyword,
      page?.url,
      activeAnalysis?.markdownContent,
    );
    if (res.success) {
      toast.success('SERP-Analyse abgeschlossen');
    } else {
      toast.error(res.error ?? 'SERP-Analyse fehlgeschlagen');
    }
  };

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">
          Artikel nicht gefunden. Bitte zuerst GSC-Daten hochladen.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-8">
      {analysisLoading && !activeAnalysis ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      ) : activeAnalysis ? (
        <>
          <AnalysisHeader analysis={activeAnalysis} page={page} />

          {/* Structure + SEO checks (instant, pure logic) */}
          <div className="grid md:grid-cols-2 gap-4">
            <StructureCheck structure={activeAnalysis.structure} />
            <SeoCheckComponent seo={activeAnalysis.seo} />
          </div>

          {/* Action buttons: AI Analysis + SERP Check */}
          {(!activeAnalysis.content || !serpAnalysis) && (
            <div className="flex flex-wrap items-center justify-center gap-3 py-2">
              {!activeAnalysis.content && !activeAnalysis.suggestions && (
                <Button
                  onClick={handleAiAnalysis}
                  disabled={analysisLoading}
                  className="gap-2 bg-signal text-background hover:bg-signal-glow font-semibold shadow-[0_0_30px_-8px_rgba(52,211,153,0.5)]"
                  size="lg"
                >
                  {analysisLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  KI-Analyse starten
                </Button>
              )}
              {!serpAnalysis && (
                <Button
                  onClick={handleSerpCheck}
                  disabled={serpLoading}
                  variant="outline"
                  className="gap-2 border-border hover:border-signal/40 hover:bg-signal/5"
                  size="lg"
                >
                  {serpLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  SERP-Check starten
                </Button>
              )}
            </div>
          )}

          {/* AI results */}
          {activeAnalysis.content && (
            <ContentCheck content={activeAnalysis.content} />
          )}
          {activeAnalysis.suggestions && (
            <AiSuggestions suggestions={activeAnalysis.suggestions} />
          )}

          {/* SERP Analysis results */}
          {serpAnalysis && (
            <>
              <Separator className="my-2" />
              <SerpResultsPanel analysis={serpAnalysis} />
            </>
          )}

          {/* SERP error */}
          {serpError && !serpAnalysis && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
              <p className="text-sm text-red-400">{serpError}</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

export default function ArticlePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header onUploadClick={() => {}} />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-signal" /></div>}>
        <ArticleContent />
      </Suspense>
    </div>
  );
}
