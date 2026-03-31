'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Lightbulb, Table2, MessageSquare, Scale, Clock, Quote } from 'lucide-react';
import type { BriefingElement } from '@/types/briefing';

interface ElementsCardProps {
  elements: BriefingElement[];
}

const elementIcons: Record<string, typeof Lightbulb> = {
  infobox: Lightbulb,
  vergleichstabelle: Table2,
  faq: MessageSquare,
  'pro-contra': Scale,
  timeline: Clock,
  zitat: Quote,
};

const elementColors: Record<string, string> = {
  infobox: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  vergleichstabelle: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  faq: 'bg-signal/10 text-signal border-signal/20',
  'pro-contra': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  timeline: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  zitat: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

export function ElementsCard({ elements }: ElementsCardProps) {
  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-signal/70" />
          Empfohlene Elemente
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 space-y-3">
        {elements.map((el, i) => {
          const Icon = elementIcons[el.type] ?? Lightbulb;
          const color = elementColors[el.type] ?? 'bg-secondary text-muted-foreground border-border/40';
          return (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
              <div className={`p-1.5 rounded-md ${color.split(' ').slice(0, 1).join(' ')}`}>
                <Icon className={`w-4 h-4 ${color.split(' ').slice(1, 2).join(' ')}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{el.label}</span>
                  <Badge variant="outline" className={`text-[10px] ${color}`}>
                    {el.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{el.description}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Platzierung: {el.placement}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
