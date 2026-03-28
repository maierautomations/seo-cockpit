'use client';

import { useCallback } from 'react';
import { useSeoStore } from '@/lib/store';
import { parseQueryCsv, parsePageCsv } from '@/lib/csv/parser';
import { mergeGscData, calculateOverview } from '@/lib/csv/merger';
import { scorePages } from '@/lib/scoring/engine';
import type { CsvType } from '@/types/csv';

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
    reader.readAsText(file, 'UTF-8');
  });
}

// Detect CSV type by inspecting headers
function detectCsvType(text: string): CsvType | null {
  const firstLine = text.split('\n')[0]?.toLowerCase() ?? '';
  if (firstLine.includes('suchanfrage') || firstLine.includes('query') || firstLine.includes('keyword')) {
    return 'queries';
  }
  if (firstLine.includes('seite') || firstLine.includes('page') || firstLine.includes('url')) {
    return 'pages';
  }
  return null;
}

export function useCsvUpload() {
  const {
    queryCsv,
    pageCsv,
    setQueryCsv,
    setPageCsv,
    setPages,
    setOverview,
    resetUpload,
  } = useSeoStore();

  const processFile = useCallback(
    async (file: File, explicitType?: CsvType) => {
      const text = await readFileAsText(file);
      const detectedType = explicitType ?? detectCsvType(text);

      if (!detectedType) {
        return {
          success: false,
          error: 'CSV-Typ konnte nicht erkannt werden. Bitte Datei als "Suchanfragen" oder "Seiten" markieren.',
        };
      }

      if (detectedType === 'queries') {
        const result = parseQueryCsv(text);
        setQueryCsv(result);
        return { success: result.success, type: detectedType, result };
      } else {
        const result = parsePageCsv(text);
        setPageCsv(result);
        return { success: result.success, type: detectedType, result };
      }
    },
    [setQueryCsv, setPageCsv],
  );

  const computeScoring = useCallback(() => {
    const store = useSeoStore.getState();
    const { queryCsv: qCsv, pageCsv: pCsv } = store;

    if (!pCsv?.success || pCsv.data.length === 0) return;

    const queryData = qCsv?.success ? qCsv.data : [];
    const merged = mergeGscData(pCsv.data, queryData);
    const scored = scorePages(merged);
    const overview = calculateOverview(merged, queryData.length);

    setPages(scored);
    setOverview(overview);
  }, [setPages, setOverview]);

  const hasPages = pageCsv?.success && pageCsv.data.length > 0;
  const hasQueries = queryCsv?.success && queryCsv.data.length > 0;
  const isReady = hasPages;

  return {
    processFile,
    computeScoring,
    resetUpload,
    hasPages,
    hasQueries,
    isReady,
    queryCsv,
    pageCsv,
  };
}
