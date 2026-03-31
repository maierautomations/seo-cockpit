'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';
import { HeadingStructureCard } from './heading-structure-card';
import { KeywordClusterCard } from './keyword-cluster-card';
import { ElementsCard } from './elements-card';
import { FaqCard } from './faq-card';
import { YoastCard } from './yoast-card';
import { InternalLinksCard } from './internal-links-card';
import { SerpContextCard } from './serp-context-card';
import { downloadBriefingMarkdown } from '@/lib/briefing/to-markdown';
import type { ContentBriefing } from '@/types/briefing';

interface BriefingResultProps {
  briefing: ContentBriefing;
  onReset: () => void;
}

export function BriefingResult({ briefing, onReset }: BriefingResultProps) {
  const handleExport = useCallback(() => {
    downloadBriefingMarkdown(briefing);
  }, [briefing]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Briefing: &ldquo;{briefing.hauptkeyword}&rdquo;
          </h2>
          {briefing.nebenkeywords.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Nebenkeywords: {briefing.nebenkeywords.join(', ')}
            </p>
          )}
          <p className="text-xs text-muted-foreground/60 mt-1">
            Generiert am{' '}
            {new Date(briefing.generatedAt).toLocaleString('de-DE')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2 border-border hover:border-signal/40 hover:bg-signal/5"
          >
            <Download className="w-3.5 h-3.5" />
            Als Markdown exportieren
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Neues Briefing
          </Button>
        </div>
      </div>

      {/* Section cards */}
      <HeadingStructureCard headings={briefing.headings} />

      <div className="grid md:grid-cols-2 gap-4">
        <KeywordClusterCard keywords={briefing.keywordCluster} />
        <ElementsCard elements={briefing.elements} />
      </div>

      <FaqCard faqQuestions={briefing.faqQuestions} />

      <YoastCard yoast={briefing.yoast} />

      <InternalLinksCard links={briefing.internalLinks} />

      <SerpContextCard briefing={briefing} />
    </div>
  );
}
