'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search } from 'lucide-react';
import { formatNumber, formatDecimal } from '@/lib/format';
import type { BriefingKeyword } from '@/types/briefing';

interface KeywordClusterCardProps {
  keywords: BriefingKeyword[];
}

export function KeywordClusterCard({ keywords }: KeywordClusterCardProps) {
  const gscCount = keywords.filter((k) => k.source === 'gsc').length;

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3 px-5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Search className="w-4 h-4 text-signal/70" />
          Keyword-Cluster
          {gscCount > 0 && (
            <Badge
              variant="outline"
              className="text-[11px] tabular-nums bg-signal/5 text-signal border-signal/20"
            >
              {gscCount} aus GSC
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40">
              <TableHead className="text-xs pl-5">Keyword</TableHead>
              <TableHead className="text-xs text-right">Impressionen</TableHead>
              <TableHead className="text-xs text-right">Position</TableHead>
              <TableHead className="text-xs text-right pr-5">Quelle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((kw, i) => (
              <TableRow key={i} className="border-border/30">
                <TableCell className="text-sm font-medium pl-5">
                  {kw.keyword}
                </TableCell>
                <TableCell className="text-sm text-right tabular-nums text-muted-foreground">
                  {kw.impressionen > 0 ? formatNumber(kw.impressionen) : '\u2014'}
                </TableCell>
                <TableCell className="text-sm text-right tabular-nums text-muted-foreground">
                  {kw.position > 0 ? formatDecimal(kw.position) : '\u2014'}
                </TableCell>
                <TableCell className="text-right pr-5">
                  <Badge
                    variant="outline"
                    className={
                      kw.source === 'gsc'
                        ? 'text-[10px] bg-signal/5 text-signal border-signal/20'
                        : 'text-[10px] bg-secondary text-muted-foreground border-border/40'
                    }
                  >
                    {kw.source === 'gsc' ? 'GSC' : 'Eingabe'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
