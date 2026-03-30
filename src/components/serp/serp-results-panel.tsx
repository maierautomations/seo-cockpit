'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, Target, Lightbulb, MessageCircleQuestion } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { SerpAnalysis } from '@/types/serp';

interface SerpResultsPanelProps {
  analysis: SerpAnalysis;
}

export function SerpResultsPanel({ analysis }: SerpResultsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground tracking-tight">
          SERP-Analyse: &ldquo;{analysis.keyword}&rdquo;
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {analysis.organicResults.length} Ergebnisse analysiert &middot;{' '}
          {new Date(analysis.analyzedAt).toLocaleString('de-DE')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Title patterns */}
        <TitlePatternsCard analysis={analysis} />

        {/* Topic coverage */}
        <TopicCoverageCard analysis={analysis} />
      </div>

      {/* Gap analysis */}
      {analysis.gaps.length > 0 && (
        <GapAnalysisCard analysis={analysis} />
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Featured snippet */}
        <FeaturedSnippetCard analysis={analysis} />

        {/* People also ask */}
        {analysis.peopleAlsoAsk.length > 0 && (
          <PeopleAlsoAskCard questions={analysis.peopleAlsoAsk} />
        )}
      </div>

      {/* Organic results list */}
      <OrganicResultsCard analysis={analysis} />
    </div>
  );
}

function TitlePatternsCard({ analysis }: { analysis: SerpAnalysis }) {
  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-signal/70" />
          Titel-Muster
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 space-y-2.5">
        {analysis.titlePatterns.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine deutlichen Muster erkannt.</p>
        ) : (
          analysis.titlePatterns.map((pattern, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{pattern.pattern}</span>
              <Badge variant="outline" className="text-xs tabular-nums bg-signal/5 text-signal border-signal/20">
                {pattern.count}/{pattern.total}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function TopicCoverageCard({ analysis }: { analysis: SerpAnalysis }) {
  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-signal/70" />
          Themen-Coverage der Top-{analysis.organicResults.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 space-y-2">
        {analysis.topicCoverage.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Themen erkannt.</p>
        ) : (
          analysis.topicCoverage.map((topic, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{topic.topic}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {topic.count}/{topic.total}
                </span>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-signal/60 transition-all duration-500"
                  style={{ width: `${(topic.count / topic.total) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function GapAnalysisCard({ analysis }: { analysis: SerpAnalysis }) {
  return (
    <Card className="bg-card/60 border-border/60 border-amber-500/20">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Gap-Analyse — Was deinem Artikel fehlt
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 space-y-3">
        {analysis.gaps.map((gap, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-red-400 shrink-0 mt-0.5">
              {gap.competitorCount >= 7 ? '!!' : '!'}
            </span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-foreground">{gap.topic}</span>
                <Badge variant="outline" className="text-[11px] tabular-nums text-amber-400 bg-amber-500/10 border-amber-500/20">
                  {gap.competitorCount}/{gap.total} Konkurrenten
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{gap.recommendation}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FeaturedSnippetCard({ analysis }: { analysis: SerpAnalysis }) {
  const fs = analysis.featuredSnippetChance;
  const typeLabel: Record<string, string> = {
    paragraph: 'Absatz',
    list: 'Liste',
    table: 'Tabelle',
    none: 'Keines',
  };

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-semibold">Featured Snippet</CardTitle>
      </CardHeader>
      <CardContent className="px-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Typ:</span>
          <Badge variant="outline" className="text-xs text-signal bg-signal/5 border-signal/20">
            {typeLabel[fs.type] ?? fs.type}
          </Badge>
        </div>
        <p className="text-sm text-foreground">{fs.recommendation}</p>
        {fs.currentSnippetUrl && (
          <p className="text-xs text-muted-foreground">
            Aktuell: {fs.currentSnippetUrl}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PeopleAlsoAskCard({ questions }: { questions: string[] }) {
  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <MessageCircleQuestion className="w-4 h-4 text-signal/70" />
          Nutzer fragen auch
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 space-y-1.5">
        {questions.map((q, i) => (
          <p key={i} className="text-sm text-foreground">
            <span className="text-muted-foreground mr-1.5">Q:</span>
            {q}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

function OrganicResultsCard({ analysis }: { analysis: SerpAnalysis }) {
  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-semibold">
          Top-{analysis.organicResults.length} Suchergebnisse
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {analysis.organicResults.map((result, i) => (
            <div key={i} className="px-5 py-3 hover:bg-secondary/30 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-xs text-muted-foreground tabular-nums font-mono mt-0.5 shrink-0 w-5">
                  {String(result.position).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:text-signal transition-colors inline-flex items-center gap-1"
                  >
                    {result.title}
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {result.domain}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
