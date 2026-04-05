'use client';

import Link from 'next/link';
import { Info } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="w-full border-b border-signal/20 bg-signal/5 px-4 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-xs text-signal">
        <Info className="h-3.5 w-3.5 shrink-0" />
        <span>
          Demo-Modus — Daten gehen beim Schliessen des Browsers verloren.{' '}
          <Link
            href="/login"
            className="font-medium underline underline-offset-2 hover:text-signal-glow"
          >
            Account erstellen
          </Link>{' '}
          um Daten dauerhaft zu speichern.
        </span>
      </div>
    </div>
  );
}
