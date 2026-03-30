'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { formatNumber, formatPercent, formatDecimal } from '@/lib/format';
import type { KeywordEntry } from '@/types/gsc';

interface KeywordTableProps {
  keywords: KeywordEntry[];
}

export function KeywordTable({ keywords }: KeywordTableProps) {
  const sorted = useMemo(
    () => [...keywords].sort((a, b) => b.impressionen - a.impressionen),
    [keywords],
  );

  if (sorted.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Keywords aus GSC
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {sorted.length} Keywords
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-xs pl-6">Keyword</TableHead>
              <TableHead className="text-xs text-right">Imp.</TableHead>
              <TableHead className="text-xs text-right">Pos.</TableHead>
              <TableHead className="text-xs text-right pr-6">CTR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((kw, i) => (
              <TableRow key={`${kw.keyword}-${i}`} className="border-border/30">
                <TableCell className="pl-6 text-sm font-medium max-w-[300px] truncate">
                  {kw.keyword}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                  {formatNumber(kw.impressionen)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                  {formatDecimal(kw.position)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm text-muted-foreground pr-6">
                  {formatPercent(kw.ctr)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
