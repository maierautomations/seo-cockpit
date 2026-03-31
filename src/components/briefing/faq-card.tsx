'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyBlock } from '@/components/analysis/copy-block';
import { MessageCircleQuestion } from 'lucide-react';
import type { BriefingFaq } from '@/types/briefing';

interface FaqCardProps {
  faqQuestions: BriefingFaq[];
}

export function FaqCard({ faqQuestions }: FaqCardProps) {
  // Build a single copyable FAQ block
  const fullFaqText = faqQuestions
    .map((faq) => `Q: ${faq.question}\nA: ${faq.answerHint}`)
    .join('\n\n');

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <MessageCircleQuestion className="w-4 h-4 text-signal/70" />
          FAQ-Fragen
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 space-y-3">
        {faqQuestions.map((faq, i) => (
          <div key={i}>
            <CopyBlock
              content={`Q: ${faq.question}\nA: ${faq.answerHint}`}
              label={`Frage ${i + 1}`}
            />
          </div>
        ))}
        {faqQuestions.length > 1 && (
          <CopyBlock
            content={fullFaqText}
            label="Alle FAQ kopieren"
            className="mt-4 pt-4 border-t border-border/30"
          />
        )}
      </CardContent>
    </Card>
  );
}
