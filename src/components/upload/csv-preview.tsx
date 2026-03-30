'use client';

interface CsvPreviewProps {
  headers: string[];
  rows: string[][];
  delimiter: string;
}

export function CsvPreview({ headers, rows, delimiter }: CsvPreviewProps) {
  if (headers.length === 0) return null;

  const delimiterLabel = delimiter === '\t' ? 'Tab' : delimiter === ';' ? 'Semikolon' : 'Komma';

  return (
    <div className="mt-3 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
      <div className="px-3 py-1.5 border-b border-border/40 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground font-medium">
          Vorschau ({rows.length} von ? Zeilen)
        </span>
        <span className="text-[11px] text-muted-foreground">
          Trennzeichen: {delimiterLabel}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/30">
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-1.5 text-left font-medium text-signal/80 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-border/20 last:border-0">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1 text-muted-foreground whitespace-nowrap max-w-[200px] truncate">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
