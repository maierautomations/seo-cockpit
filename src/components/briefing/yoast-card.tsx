'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyBlock } from '@/components/analysis/copy-block';
import { Tag } from 'lucide-react';
import type { BriefingYoast } from '@/types/briefing';

interface YoastCardProps {
  yoast: BriefingYoast;
}

export function YoastCard({ yoast }: YoastCardProps) {
  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Tag className="w-4 h-4 text-signal/70" />
          Yoast SEO
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 space-y-3">
        <CopyBlock content={yoast.keyphrase} label="Keyphrase" />
        <CopyBlock
          content={yoast.seoTitle}
          label={`SEO-Titel (${yoast.seoTitle.length} Zeichen)`}
        />
        <CopyBlock content={`/${yoast.slug}`} label="Slug" />
        <CopyBlock
          content={yoast.metaDescription}
          label={`Meta-Description (${yoast.metaDescription.length} Zeichen)`}
        />
      </CardContent>
    </Card>
  );
}
