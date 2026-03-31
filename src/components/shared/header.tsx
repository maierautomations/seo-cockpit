'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSeoStore } from '@/lib/store';

interface HeaderProps {
  onUploadClick?: () => void;
}

export function Header({ onUploadClick }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { gscConnection } = useSeoStore();
  const isGscConnected = gscConnection.dataSource === 'gsc';

  return (
    <header className="sticky top-0 z-[60] w-full border-b border-border/50 backdrop-blur-md bg-background/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-semibold text-lg tracking-tight text-foreground">
            SEO Cockpit
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors',
                pathname === '/'
                  ? 'text-foreground bg-secondary/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40',
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/briefing"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                pathname === '/briefing'
                  ? 'text-foreground bg-secondary/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40',
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              Briefing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {onUploadClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadClick}
              className={cn(
                'gap-2 rounded-full border-border bg-secondary/80 text-foreground backdrop-blur hover:border-signal/40 hover:bg-accent/80 transition-all',
                isGscConnected && 'text-xs opacity-70 hover:opacity-100',
              )}
            >
              <Upload className="w-3.5 h-3.5" />
              CSV hochladen
            </Button>
          )}

          {/* User avatar when authenticated */}
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? 'User'}
              title={session.user.name ?? session.user.email ?? undefined}
              className="w-8 h-8 rounded-full ring-1 ring-border/60 hover:ring-signal/40 transition-all"
            />
          )}
        </div>
      </div>
    </header>
  );
}
