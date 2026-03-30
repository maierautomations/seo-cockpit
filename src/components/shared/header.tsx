'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
}

export function Header({ onUploadClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-[60] w-full border-b border-border/50 backdrop-blur-md bg-background/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="font-semibold text-lg tracking-tight text-foreground">
          SEO Cockpit
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={onUploadClick}
          className="gap-2 rounded-full border-border bg-secondary/80 text-foreground backdrop-blur hover:border-signal/40 hover:bg-accent/80 transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          CSV hochladen
        </Button>
      </div>
    </header>
  );
}
