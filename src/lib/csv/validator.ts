import type { CsvValidationError, CsvType } from '@/types/csv';

// Header aliases: canonical name → possible CSV column names (DE, EN, variations)
export const QUERY_HEADER_MAP: Record<string, string[]> = {
  keyword: ['Suchanfrage', 'Top queries', 'Search query', 'Query', 'Keyword', 'Suchanfragen'],
  klicks: ['Klicks', 'Clicks', 'Klick'],
  impressionen: ['Impressionen', 'Impressions', 'Impression'],
  ctr: ['CTR', 'Click-Through-Rate', 'Klickrate'],
  position: ['Position', 'Durchschn. Position', 'Average position', 'Avg. position'],
};

export const PAGE_HEADER_MAP: Record<string, string[]> = {
  url: ['Seite', 'Page', 'URL', 'Seiten', 'Landing page', 'Top pages'],
  klicks: ['Klicks', 'Clicks', 'Klick'],
  impressionen: ['Impressionen', 'Impressions', 'Impression'],
  ctr: ['CTR', 'Click-Through-Rate', 'Klickrate'],
  position: ['Position', 'Durchschn. Position', 'Average position', 'Avg. position'],
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-zäöü]/g, '');
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
    const found = normalizedRaw.some((h) => normalizedAliases.includes(h));

    if (!found) {
      const displayName = type === 'queries' && canonicalName === 'keyword'
        ? 'Suchanfrage'
        : type === 'pages' && canonicalName === 'url'
          ? 'Seite'
          : aliases[0];

      errors.push({
        type: 'missing-column',
        message: `Spalte "${displayName}" nicht gefunden. Erwartet: ${aliases.join(', ')}`,
        column: canonicalName,
      });
    }
  }

  return errors;
}
