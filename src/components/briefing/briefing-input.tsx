'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Plus, X } from 'lucide-react';

interface BriefingInputProps {
  onGenerate: (hauptkeyword: string, nebenkeywords: string[]) => void;
  loading: boolean;
}

export function BriefingInput({ onGenerate, loading }: BriefingInputProps) {
  const [hauptkeyword, setHauptkeyword] = useState('');
  const [nebenkeywords, setNebenkeywords] = useState<string[]>(['']);

  const addNebenkeyword = useCallback(() => {
    if (nebenkeywords.length < 3) {
      setNebenkeywords((prev) => [...prev, '']);
    }
  }, [nebenkeywords.length]);

  const removeNebenkeyword = useCallback((index: number) => {
    setNebenkeywords((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateNebenkeyword = useCallback((index: number, value: string) => {
    setNebenkeywords((prev) => prev.map((kw, i) => (i === index ? value : kw)));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!hauptkeyword.trim()) return;
    onGenerate(hauptkeyword.trim(), nebenkeywords.filter((kw) => kw.trim()));
  }, [hauptkeyword, nebenkeywords, onGenerate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && hauptkeyword.trim()) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit, hauptkeyword],
  );

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Content-Briefing erstellen
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Gib ein Hauptkeyword ein und erhalte ein datengetriebenes Briefing
          f&uuml;r einen neuen Artikel &mdash; basierend auf SERP-Analyse und
          deinen GSC-Daten.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hauptkeyword */}
        <div>
          <label
            htmlFor="hauptkeyword"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Hauptkeyword
          </label>
          <Input
            id="hauptkeyword"
            placeholder='z.B. "ServiceNow Aktie"'
            value={hauptkeyword}
            onChange={(e) => setHauptkeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="mt-1.5 bg-secondary/40 border-border/60 focus-visible:border-signal/40 focus-visible:ring-signal/20"
          />
        </div>

        {/* Nebenkeywords */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nebenkeywords (optional)
            </label>
            {nebenkeywords.length < 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={addNebenkeyword}
                disabled={loading}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-3 h-3 mr-1" />
                Hinzuf&uuml;gen
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {nebenkeywords.map((kw, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder={`Nebenkeyword ${i + 1}`}
                  value={kw}
                  onChange={(e) => updateNebenkeyword(i, e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className="bg-secondary/40 border-border/60 focus-visible:border-signal/40 focus-visible:ring-signal/20"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeNebenkeyword(i)}
                  disabled={loading}
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!hauptkeyword.trim() || loading}
          className="w-full gap-2 bg-signal text-background hover:bg-signal/90 shadow-[0_0_20px_rgba(var(--signal-rgb),0.15)] transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Briefing generieren
        </Button>
      </CardContent>
    </Card>
  );
}
