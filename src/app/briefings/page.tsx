'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, ArrowRight } from 'lucide-react';

interface BriefingListItem {
  id: string;
  main_keyword: string;
  secondary_keywords: string[] | null;
  created_at: string;
}

function BriefingsList() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [briefings, setBriefings] = useState<BriefingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    fetch('/api/supabase/briefings')
      .then((res) => res.json())
      .then((data) => {
        setBriefings(data.briefings ?? []);
      })
      .catch(() => {
        // Silently fail
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn, authLoading]);

  if (!authLoading && !isLoggedIn) {
    return (
      <div className="text-center py-16 space-y-4">
        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <p className="text-muted-foreground">
          Melde dich an, um gespeicherte Briefings zu sehen.
        </p>
        <Link href="/briefing">
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Neues Briefing erstellen
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (briefings.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <p className="text-muted-foreground">
          Noch keine Briefings erstellt.
        </p>
        <Link href="/briefing">
          <Button className="gap-2 bg-signal text-background hover:bg-signal-glow">
            <Plus className="w-4 h-4" />
            Erstes Briefing erstellen
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {briefings.map((b) => (
        <Link key={b.id} href={`/briefing?id=${b.id}`}>
          <Card className="hover:border-signal/30 hover:bg-signal/5 transition-all cursor-pointer group">
            <CardContent className="flex items-center justify-between py-4 px-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-signal" />
                  <span className="font-medium text-sm">{b.main_keyword}</span>
                </div>
                <div className="flex items-center gap-2">
                  {b.secondary_keywords?.slice(0, 3).map((kw) => (
                    <Badge key={kw} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {kw}
                    </Badge>
                  ))}
                  {(b.secondary_keywords?.length ?? 0) > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{(b.secondary_keywords?.length ?? 0) - 3} weitere
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(b.created_at).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-signal transition-colors" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function BriefingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Content-Briefings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Alle generierten Briefings auf einen Blick
            </p>
          </div>
          <Link href="/briefing">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Neues Briefing
            </Button>
          </Link>
        </div>

        <BriefingsList />
      </main>
    </div>
  );
}
