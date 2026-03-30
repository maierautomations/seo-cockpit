import Papa from 'papaparse';
import type { RawQueryRow, RawPageRow } from '@/types/gsc';
import type { CsvParseResult, CsvValidationError, CsvType } from '@/types/csv';
import { validateCsvHeaders, QUERY_HEADER_MAP, PAGE_HEADER_MAP } from './validator';

// Detect number format: German (1.234,56) vs English (1,234.56)
// GSC exports use English format even on German UI
function detectNumberFormat(rows: Record<string, string>[]): 'german' | 'english' {
  // Look at CTR and Position columns for clues
  for (const row of rows.slice(0, 5)) {
    for (const val of Object.values(row)) {
      const cleaned = val.replace('%', '').trim();
      // If we see "22.93" or "5.1" — English format (decimal point)
      // If we see "22,93" or "5,1" — German format (decimal comma)
      // Key: in German format, dots are thousands separators (1.234)
      // In English format, dots are decimal points (5.43)
      if (/^\d{1,3}\.\d{1,2}$/.test(cleaned)) {
        // Like "5.43" or "22.93" — this is English decimal
        return 'english';
      }
      if (/^\d{1,3},\d{1,2}$/.test(cleaned)) {
        // Like "5,43" or "22,93" — this is German decimal
        return 'german';
      }
    }
  }
  // Default: check if any value has German thousands dots (1.234)
  for (const row of rows.slice(0, 5)) {
    for (const val of Object.values(row)) {
      if (/^\d{1,3}\.\d{3}/.test(val.trim())) {
        return 'german'; // "14.200" = German thousands separator
      }
    }
  }
  return 'english';
}

// Parse number: handles both German and English formats
function parseNumber(value: string, format: 'german' | 'english'): number {
  let cleaned = value.trim().replace('%', '').trim();

  if (format === 'german') {
    // German: "14.200" → 14200, "11,3" → 11.3
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // English: "14,200" → 14200, "11.3" → 11.3
    cleaned = cleaned.replace(/,/g, '');
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Parse CTR: "22.93%" → 0.2293, "1,3%" → 0.013
function parseCtr(value: string, format: 'german' | 'english'): number {
  const num = parseNumber(value, format);
  // If the value had a %, the number is already a percentage
  if (value.includes('%')) {
    return num / 100;
  }
  // If no %, check if it looks like a decimal already (< 1)
  return num < 1 ? num : num / 100;
}

// Strip BOM from UTF-8 CSV exports
function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

// Detect delimiter: try tab, semicolon, comma
function detectDelimiter(text: string): string {
  const firstLine = text.split('\n')[0] ?? '';
  const tabCount = (firstLine.match(/\t/g) ?? []).length;
  const semiCount = (firstLine.match(/;/g) ?? []).length;
  const commaCount = (firstLine.match(/,/g) ?? []).length;

  // Pick the one with the most occurrences (most likely delimiter)
  if (tabCount >= semiCount && tabCount >= commaCount && tabCount > 0) return '\t';
  if (semiCount >= commaCount && semiCount > 0) return ';';
  return ',';
}

// Normalize a header string for matching
function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

// Map raw CSV headers to canonical field names
function mapHeaders(
  rawHeaders: string[],
  headerMap: Record<string, string[]>,
): Record<string, string> | null {
  const mapping: Record<string, string> = {};

  for (const [canonicalName, aliases] of Object.entries(headerMap)) {
    const normalizedAliases = aliases.map(normalizeHeader);
    const match = rawHeaders.find((h) => {
      const nh = normalizeHeader(h);
      return normalizedAliases.some((alias) => nh === alias || nh.includes(alias));
    });
    if (match) {
      mapping[canonicalName] = match;
    }
  }

  return Object.keys(mapping).length === Object.keys(headerMap).length
    ? mapping
    : null;
}

// Debug: log first rows for troubleshooting
function logDebugInfo(
  type: string,
  headers: string[],
  firstRow: Record<string, string> | undefined,
  delimiter: string,
  format: string,
) {
  if (typeof console !== 'undefined') {
    console.log(`[CSV Parser] Type: ${type}`);
    console.log(`[CSV Parser] Delimiter: "${delimiter === '\t' ? 'TAB' : delimiter}"`);
    console.log(`[CSV Parser] Number format: ${format}`);
    console.log(`[CSV Parser] Headers: [${headers.map(h => `"${h}"`).join(', ')}]`);
    if (firstRow) {
      console.log(`[CSV Parser] First row:`, firstRow);
    }
  }
}

export function parseQueryCsv(text: string): CsvParseResult<RawQueryRow> {
  const cleaned = stripBom(text);
  const delimiter = detectDelimiter(cleaned);
  const errors: CsvValidationError[] = [];

  const parsed = Papa.parse<Record<string, string>>(cleaned, {
    header: true,
    delimiter,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (parsed.data.length === 0) {
    return { success: false, data: [], errors: [{ type: 'empty-file', message: 'CSV-Datei ist leer.' }], rowCount: 0, skippedRows: 0 };
  }

  const rawHeaders = parsed.meta.fields ?? [];
  const numFormat = detectNumberFormat(parsed.data);

  logDebugInfo('queries', rawHeaders, parsed.data[0], delimiter, numFormat);

  const headerErrors = validateCsvHeaders(rawHeaders, 'queries');
  if (headerErrors.length > 0) {
    return { success: false, data: [], errors: headerErrors, rowCount: 0, skippedRows: 0 };
  }

  const mapping = mapHeaders(rawHeaders, QUERY_HEADER_MAP);
  if (!mapping) {
    return { success: false, data: [], errors: [{ type: 'missing-column', message: `Spalten konnten nicht zugeordnet werden. Gefunden: ${rawHeaders.join(', ')}` }], rowCount: 0, skippedRows: 0 };
  }

  let skippedRows = 0;
  const data: RawQueryRow[] = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    if (!row) continue;

    const keyword = row[mapping.keyword]?.trim();
    if (!keyword) {
      skippedRows++;
      continue;
    }

    const klicks = parseNumber(row[mapping.klicks] ?? '0', numFormat);
    const impressionen = parseNumber(row[mapping.impressionen] ?? '0', numFormat);
    const ctr = parseCtr(row[mapping.ctr] ?? '0', numFormat);
    const position = parseNumber(row[mapping.position] ?? '0', numFormat);

    data.push({ keyword, klicks, impressionen, ctr, position });
  }

  return {
    success: true,
    data,
    errors,
    rowCount: data.length,
    skippedRows,
  };
}

export function parsePageCsv(text: string): CsvParseResult<RawPageRow> {
  const cleaned = stripBom(text);
  const delimiter = detectDelimiter(cleaned);
  const errors: CsvValidationError[] = [];

  const parsed = Papa.parse<Record<string, string>>(cleaned, {
    header: true,
    delimiter,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (parsed.data.length === 0) {
    return { success: false, data: [], errors: [{ type: 'empty-file', message: 'CSV-Datei ist leer.' }], rowCount: 0, skippedRows: 0 };
  }

  const rawHeaders = parsed.meta.fields ?? [];
  const numFormat = detectNumberFormat(parsed.data);

  logDebugInfo('pages', rawHeaders, parsed.data[0], delimiter, numFormat);

  const headerErrors = validateCsvHeaders(rawHeaders, 'pages');
  if (headerErrors.length > 0) {
    return { success: false, data: [], errors: headerErrors, rowCount: 0, skippedRows: 0 };
  }

  const mapping = mapHeaders(rawHeaders, PAGE_HEADER_MAP);
  if (!mapping) {
    return { success: false, data: [], errors: [{ type: 'missing-column', message: `Spalten konnten nicht zugeordnet werden. Gefunden: ${rawHeaders.join(', ')}` }], rowCount: 0, skippedRows: 0 };
  }

  let skippedRows = 0;
  const data: RawPageRow[] = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    if (!row) continue;

    const url = row[mapping.url]?.trim();
    if (!url) {
      skippedRows++;
      continue;
    }

    const klicks = parseNumber(row[mapping.klicks] ?? '0', numFormat);
    const impressionen = parseNumber(row[mapping.impressionen] ?? '0', numFormat);
    const ctr = parseCtr(row[mapping.ctr] ?? '0', numFormat);
    const position = parseNumber(row[mapping.position] ?? '0', numFormat);

    data.push({ url, klicks, impressionen, ctr, position });
  }

  return {
    success: true,
    data,
    errors,
    rowCount: data.length,
    skippedRows,
  };
}

// Export for preview: parse first N rows without full validation
export function previewCsv(text: string, maxRows = 3): { headers: string[]; rows: string[][]; delimiter: string } {
  const cleaned = stripBom(text);
  const delimiter = detectDelimiter(cleaned);

  const parsed = Papa.parse<string[]>(cleaned, {
    header: false,
    delimiter,
    preview: maxRows + 1, // +1 for header
    skipEmptyLines: true,
  });

  const headers = parsed.data[0] ?? [];
  const rows = parsed.data.slice(1);

  return { headers, rows, delimiter };
}
