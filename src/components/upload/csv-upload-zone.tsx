'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CsvPreview } from './csv-preview';
import type { CsvType } from '@/types/csv';

interface PreviewData {
  headers: string[];
  rows: string[][];
  delimiter: string;
}

interface CsvUploadZoneProps {
  label: string;
  type: CsvType;
  onFile: (file: File, type: CsvType) => Promise<void>;
  isLoaded: boolean;
  rowCount?: number;
  errors?: string[];
  preview?: PreviewData | null;
}

export function CsvUploadZone({
  label,
  type,
  onFile,
  isLoaded,
  rowCount,
  errors,
  preview,
}: CsvUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        await onFile(file, type);
      } finally {
        setIsProcessing(false);
      }
    },
    [onFile, type],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const hasErrors = errors && errors.length > 0;

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer',
          isDragOver && 'border-signal/50 bg-signal/5',
          isLoaded && !hasErrors && 'border-emerald-500/30 bg-emerald-500/5',
          hasErrors && 'border-red-500/30 bg-red-500/5',
          !isLoaded && !hasErrors && !isDragOver && 'border-border/60 hover:border-signal/30 hover:bg-card/50',
        )}
      >
        <input
          type="file"
          accept=".csv,.tsv,.txt"
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-signal/20 border-t-signal rounded-full animate-spin shrink-0" />
            <p className="text-sm text-muted-foreground">Wird verarbeitet...</p>
          </div>
        ) : isLoaded && !hasErrors ? (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{rowCount} Zeilen geladen</p>
            </div>
          </div>
        ) : hasErrors ? (
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-red-400">{label}</p>
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-red-400/80 mt-0.5">{err}</p>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border/60 flex items-center justify-center shrink-0">
              {type === 'queries' ? (
                <FileText className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Upload className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">CSV hierher ziehen oder klicken</p>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && preview.headers.length > 0 && (
        <CsvPreview headers={preview.headers} rows={preview.rows} delimiter={preview.delimiter} />
      )}
    </div>
  );
}
