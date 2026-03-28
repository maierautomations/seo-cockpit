import Papa from 'papaparse';
import type { RawQueryRow, RawPageRow } from '@/types/gsc';
import type { CsvParseResult, CsvValidationError, CsvType } from '@/types/csv';
import { validateCsvHeaders, QUERY_HEADER_MAP, PAGE_HEADER_MAP } from './validator';

// German number format: "14.200" → 14200, "11,3" → 11.3
function parseGermanNumber(value: string): number {
  const cleaned = value
    .trim()
    .replace(/\./g, '')   // remove thousands separator
    .replace(',', '.');    // decimal comma → decimal point
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// German CTR format: "1,3 %" or "1,3%" → 0.013
function parseGermanCtr(value: string): number {
  const cleaned = value.trim().replace('%', '').trim();
  const num = parseGermanNumber(cleaned);
  return num / 100;
}

// Strip BOM from UTF-8 CSV exports
function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

// Detect delimiter: semicolon (German default) or tab or comma
function detectDelimiter(text: string): string {
  const firstLine = text.split('\n')[0] ?? '';
  if (firstLine.includes('\t')) return '\t';
  if (firstLine.includes(';')) return ';';
  return ',';
}

// Normalize a header string for matching
function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-zäöü]/g, '');
}

// Map raw CSV headers to canonical field names
function mapHeaders(
  rawHeaders: string[],
  headerMap: Record<string, string[]>,
): Record<string, string> | null {
  const mapping: Record<string, string> = {};

  for (const [canonicalName, aliases] of Object.entries(headerMap)) {
    const normalizedAliases = aliases.map(normalizeHeader);
    const match = rawHeaders.find((h) =>
      normalizedAliases.includes(normalizeHeader(h)),
    );
    if (match) {
      mapping[canonicalName] = match;
    }
  }

  return Object.keys(mapping).length === Object.keys(headerMap).length
    ? mapping
    : null;
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
  const headerErrors = validateCsvHeaders(rawHeaders, 'queries');
  if (headerErrors.length > 0) {
    return { success: false, data: [], errors: headerErrors, rowCount: 0, skippedRows: 0 };
  }

  const mapping = mapHeaders(rawHeaders, QUERY_HEADER_MAP);
  if (!mapping) {
    return { success: false, data: [], errors: [{ type: 'missing-column', message: 'Spalten konnten nicht zugeordnet werden.' }], rowCount: 0, skippedRows: 0 };
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

    const klicks = parseGermanNumber(row[mapping.klicks] ?? '0');
    const impressionen = parseGermanNumber(row[mapping.impressionen] ?? '0');
    const ctr = parseGermanCtr(row[mapping.ctr] ?? '0');
    const position = parseGermanNumber(row[mapping.position] ?? '0');

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
  const headerErrors = validateCsvHeaders(rawHeaders, 'pages');
  if (headerErrors.length > 0) {
    return { success: false, data: [], errors: headerErrors, rowCount: 0, skippedRows: 0 };
  }

  const mapping = mapHeaders(rawHeaders, PAGE_HEADER_MAP);
  if (!mapping) {
    return { success: false, data: [], errors: [{ type: 'missing-column', message: 'Spalten konnten nicht zugeordnet werden.' }], rowCount: 0, skippedRows: 0 };
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

    const klicks = parseGermanNumber(row[mapping.klicks] ?? '0');
    const impressionen = parseGermanNumber(row[mapping.impressionen] ?? '0');
    const ctr = parseGermanCtr(row[mapping.ctr] ?? '0');
    const position = parseGermanNumber(row[mapping.position] ?? '0');

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
