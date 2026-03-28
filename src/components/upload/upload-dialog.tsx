'use client';

import { useCallback } from 'react';
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
import { toast } from 'sonner';
import type { CsvType } from '@/types/csv';

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

  const handleFile = useCallback(
    async (file: File, type: CsvType) => {
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
    toast.success('Analyse läuft...');
    onOpenChange(false);
  }, [computeScoring, onOpenChange]);

  const handleReset = useCallback(() => {
    resetUpload();
    toast.info('Daten zurückgesetzt.');
  }, [resetUpload]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>GSC-Daten hochladen</DialogTitle>
          <DialogDescription>
            Lade deine Google Search Console CSV-Exporte hoch.
            Du brauchst mindestens die Seiten-CSV.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 mt-2">
          <CsvUploadZone
            label="Seiten (Pflicht)"
            type="pages"
            onFile={handleFile}
            isLoaded={!!hasPages}
            rowCount={pageCsv?.rowCount}
            errors={pageCsv?.errors?.map((e) => e.message)}
          />
          <CsvUploadZone
            label="Suchanfragen (Optional)"
            type="queries"
            onFile={handleFile}
            isLoaded={!!hasQueries}
            rowCount={queryCsv?.rowCount}
            errors={queryCsv?.errors?.map((e) => e.message)}
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
            Analysieren
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
