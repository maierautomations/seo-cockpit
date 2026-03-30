import type { CsvValidationError, CsvType } from '@/types/csv';

// Header aliases: canonical name → possible CSV column names
// GSC exports vary by language, version, and export method
export const QUERY_HEADER_MAP: Record<string, string[]> = {
  keyword: [
    'Häufigste Suchanfragen',
    'Suchanfragen',
    'Suchanfrage',
    'Top queries',
    'Search query',
    'Queries',
    'Query',
    'Keyword',
    'Keywords',
  ],
  klicks: ['Klicks', 'Clicks', 'Klick'],
  impressionen: ['Impressionen', 'Impressions', 'Impression'],
  ctr: ['CTR', 'Click-Through-Rate', 'Klickrate', 'Click Through Rate'],
  position: [
    'Position',
    'Durchschn. Position',
    'Durchschnittliche Position',
    'Average position',
    'Avg. position',
    'Avg position',
  ],
};

export const PAGE_HEADER_MAP: Record<string, string[]> = {
  url: [
    'Die häufigsten Seiten',
    'Seite',
    'Seiten',
    'Page',
    'Pages',
    'URL',
    'URLs',
    'Landing page',
    'Landing pages',
    'Top pages',
    'Top-Seiten',
  ],
  klicks: ['Klicks', 'Clicks', 'Klick'],
  impressionen: ['Impressionen', 'Impressions', 'Impression'],
  ctr: ['CTR', 'Click-Through-Rate', 'Klickrate', 'Click Through Rate'],
  position: [
    'Position',
    'Durchschn. Position',
    'Durchschnittliche Position',
    'Average position',
    'Avg. position',
    'Avg position',
  ],
};

// Normalize: lowercase, trim, strip non-alpha (except umlauts)
function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

export function validateCsvHeaders(
  rawHeaders: string[],
  type: CsvType,
): CsvValidationError[] {
  const errors: CsvValidationError[] = [];
  const headerMap = type === 'queries' ? QUERY_HEADER_MAP : PAGE_HEADER_MAP;
  const normalizedRaw = rawHeaders.map(normalizeHeader);

  for (const [canonicalName, aliases] of Object.entries(headerMap)) {
    const normalizedAliases = aliases.map(normalizeHeader);
    const found = normalizedRaw.some((h) =>
      normalizedAliases.some((alias) => h === alias || h.includes(alias)),
    );

    if (!found) {
      const displayName = type === 'queries' && canonicalName === 'keyword'
        ? 'Suchanfrage'
        : type === 'pages' && canonicalName === 'url'
          ? 'Seite'
          : aliases[0];

      errors.push({
        type: 'missing-column',
        message: `Spalte "${displayName}" nicht gefunden. Gefundene Spalten: ${rawHeaders.join(', ')}`,
        column: canonicalName,
      });
    }
  }

  return errors;
}
