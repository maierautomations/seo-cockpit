'use client';

import { useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CsvUploadZone } from './csv-upload-zone';
import { useCsvUpload } from '@/hooks/use-csv-upload';
import { previewCsv } from '@/lib/csv/parser';
import { toast } from 'sonner';
import type { CsvType } from '@/types/csv';

interface PreviewData {
  headers: string[];
  rows: string[][];
  delimiter: string;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const {
    processFile,
    computeScoring,
    resetUpload,
    hasPages,
    hasQueries,
    isReady,
    queryCsv,
    pageCsv,
  } = useCsvUpload();

  const [pagePreview, setPagePreview] = useState<PreviewData | null>(null);
  const [queryPreview, setQueryPreview] = useState<PreviewData | null>(null);

  const handleFile = useCallback(
    async (file: File, type: CsvType) => {
      // Read file text for preview
      const text = await file.text();
      const preview = previewCsv(text, 5);

      if (type === 'pages') {
        setPagePreview(preview);
      } else {
        setQueryPreview(preview);
      }

      const result = await processFile(file, type);
      if (result.success) {
        toast.success(
          type === 'queries'
            ? `Suchanfragen geladen (${result.result?.rowCount} Zeilen)`
            : `Seiten geladen (${result.result?.rowCount} Zeilen)`,
        );
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    [processFile],
  );

  const handleAnalyze = useCallback(() => {
    computeScoring();
    toast.success('Analyse gestartet');
    onOpenChange(false);
  }, [computeScoring, onOpenChange]);

  const handleReset = useCallback(() => {
    resetUpload();
    setPagePreview(null);
    setQueryPreview(null);
    toast.info('Daten zurückgesetzt.');
  }, [resetUpload]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>GSC-Daten hochladen</DialogTitle>
          <DialogDescription>
            Lade deine Google Search Console CSV-Exporte hoch.
            Mindestens die Seiten-CSV wird benötigt.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mt-2">
          <CsvUploadZone
            label="Seiten (Pflicht)"
            type="pages"
            onFile={handleFile}
            isLoaded={!!hasPages}
            rowCount={pageCsv?.rowCount}
            errors={pageCsv?.errors?.map((e) => e.message)}
            preview={pagePreview}
          />
          <CsvUploadZone
            label="Suchanfragen (Optional)"
            type="queries"
            onFile={handleFile}
            isLoaded={!!hasQueries}
            rowCount={queryCsv?.rowCount}
            errors={queryCsv?.errors?.map((e) => e.message)}
            preview={queryPreview}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Zurücksetzen
          </Button>
          <Button
            onClick={handleAnalyze}
            disabled={!isReady}
            className="bg-signal text-background hover:bg-signal-glow font-medium"
          >
            Analyse starten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
