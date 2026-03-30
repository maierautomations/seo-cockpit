'use client';

import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { CopyBlock } from './copy-block';
import { toast } from 'sonner';
import type { AiSuggestions as AiSuggestionsType } from '@/types/analysis';

interface AiSuggestionsProps {
  suggestions: AiSuggestionsType;
}

export function AiSuggestions({ suggestions }: AiSuggestionsProps) {
  // Build full brief for one-click copy
  const buildFullBrief = useCallback(() => {
    const parts: string[] = [];

    if (suggestions.seoTitles.length > 0) {
      parts.push('## SEO-Titel-Varianten');
      suggestions.seoTitles.forEach((t, i) => parts.push(`${i + 1}. ${t}`));
    }

    if (suggestions.metaDescription) {
      parts.push('\n## Meta-Description');
      parts.push(suggestions.metaDescription);
    }

    if (suggestions.faqQuestions.length > 0) {
      parts.push('\n## FAQ');
      suggestions.faqQuestions.forEach((faq) => {
        parts.push(`**${faq.q}**`);
        parts.push(faq.a);
        parts.push('');
      });
    }

    if (suggestions.missingContent.length > 0) {
      parts.push('\n## Empfohlene Ergänzungen');
      suggestions.missingContent.forEach((c) => parts.push(`- ${c}`));
    }

    return parts.join('\n');
  }, [suggestions]);

  const handleCopyAll = useCallback(async () => {
    await navigator.clipboard.writeText(buildFullBrief());
    toast.success('Komplettes Brief kopiert');
  }, [buildFullBrief]);

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">KI-Vorschläge</CardTitle>
        <Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-1.5">
          <Copy className="w-3.5 h-3.5" />
          Alles kopieren
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* SEO Titles */}
        {suggestions.seoTitles.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              SEO-Titel ({suggestions.seoTitles.length} Varianten)
            </p>
            <div className="space-y-2">
              {suggestions.seoTitles.map((title, i) => (
                <CopyBlock key={i} content={title} label={`Variante ${i + 1}`} />
              ))}
            </div>
          </div>
        )}

        {/* Meta Description */}
        {suggestions.metaDescription && (
          <CopyBlock
            content={suggestions.metaDescription}
            label="Meta-Description"
          />
        )}

        {/* FAQ Questions */}
        {suggestions.faqQuestions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              FAQ-Block ({suggestions.faqQuestions.length} Fragen)
            </p>
            <div className="space-y-2">
              {suggestions.faqQuestions.map((faq, i) => (
                <CopyBlock
                  key={i}
                  content={`**${faq.q}**\n${faq.a}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Missing Content */}
        {suggestions.missingContent.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Empfohlene Ergänzungen
            </p>
            <div className="space-y-2">
              {suggestions.missingContent.map((item, i) => (
                <CopyBlock key={i} content={item} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
