import type { RawQueryRow, RawPageRow } from './gsc';

export type CsvType = 'queries' | 'pages';

export interface CsvValidationError {
  type: 'missing-column' | 'invalid-format' | 'empty-file' | 'wrong-delimiter';
  message: string;
  column?: string;
  row?: number;
}

export interface CsvParseResult<T> {
  success: boolean;
  data: T[];
  errors: CsvValidationError[];
  rowCount: number;
  skippedRows: number;
}

export interface UploadState {
  queries: CsvParseResult<RawQueryRow> | null;
  pages: CsvParseResult<RawPageRow> | null;
}
