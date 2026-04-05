'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Check, X, Eye, Filter, FolderTree } from 'lucide-react';
import { analyzeUrlPrefixes, filterPagesByType } from '@/lib/page-type-filter';
import { PAGE_TYPE_PRESETS } from '@/lib/page-type-config';
import type { ScoredPage } from '@/types/scoring';
import type { PageTypeSettings, UrlFilterRule } from '@/types/page-type-filter';

interface PageTypeSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allPages: ScoredPage[];
  settings: PageTypeSettings;
  onSave: (settings: PageTypeSettings) => void;
}

export function PageTypeSettingsDialog({
  open,
  onOpenChange,
  allPages,
  settings,
  onSave,
}: PageTypeSettingsDialogProps) {
  const [draft, setDraft] = useState<UrlFilterRule[]>(settings.customRules);
  const [newPattern, setNewPattern] = useState('');

  // Reset draft when dialog opens
  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(settings.customRules);
      setNewPattern('');
    }
    onOpenChange(nextOpen);
  }, [settings.customRules, onOpenChange]);

  // URL prefix analysis
  const prefixGroups = useMemo(
    () => analyzeUrlPrefixes(allPages),
    [allPages],
  );

  // Live preview: how many pages pass with current draft rules
  const previewSettings: PageTypeSettings = useMemo(
    () => ({ activePreset: settings.activePreset, customRules: draft }),
    [settings.activePreset, draft],
  );

  const previewCount = useMemo(
    () => filterPagesByType(allPages, previewSettings).length,
    [allPages, previewSettings],
  );

  const activePreset = PAGE_TYPE_PRESETS[settings.activePreset];

  // Determine if a prefix is included by current preset + draft rules
  const getPrefixStatus = useCallback(
    (prefix: string): 'included' | 'excluded' | 'neutral' => {
      const includePatterns = activePreset?.includePatterns ?? [];
      const draftIncludes = draft.filter((r) => r.type === 'include').map((r) => r.pattern);
      const draftExcludes = draft.filter((r) => r.type === 'exclude').map((r) => r.pattern);

      // Check if explicitly excluded by custom rule
      if (draftExcludes.some((p) => prefix.includes(p) || p.includes(prefix))) {
        return 'excluded';
      }

      // Check if included by preset or custom include
      const allIncludes = [...includePatterns, ...draftIncludes];
      if (allIncludes.length === 0) return 'neutral'; // "alle" preset
      if (allIncludes.some((p) => prefix.includes(p) || p.includes(prefix))) {
        return 'included';
      }

      return 'excluded';
    },
    [activePreset, draft],
  );

  const addRule = useCallback((pattern: string, type: UrlFilterRule['type']) => {
    if (!pattern.trim()) return;
    const normalized = pattern.startsWith('/') ? pattern : `/${pattern}`;
    setDraft((prev) => [...prev, { pattern: normalized, type }]);
    setNewPattern('');
  }, []);

  const removeRule = useCallback((index: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    onSave({ ...settings, customRules: draft });
    onOpenChange(false);
  }, [settings, draft, onSave, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-signal" />
            URL-Filter Einstellungen
          </DialogTitle>
          <DialogDescription>
            Aktiver Filter: <span className="text-foreground font-medium">{activePreset?.label}</span>
            {' — '}
            {activePreset?.description}
          </DialogDescription>
        </DialogHeader>

        {/* URL Structure Analysis */}
        <div className="space-y-3 mt-1">
          <div className="flex items-center gap-2">
            <FolderTree className="w-3.5 h-3.5 text-muted-foreground" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              URL-Struktur
            </h3>
          </div>

          <div className="rounded-lg border border-border/40 bg-card/30 overflow-hidden">
            {prefixGroups.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3">Keine Seiten geladen.</p>
            ) : (
              <div className="divide-y divide-border/20">
                {prefixGroups.map((group) => {
                  const status = getPrefixStatus(group.prefix);
                  return (
                    <div
                      key={group.prefix}
                      className="flex items-center gap-3 px-3 py-2 text-sm"
                    >
                      {/* Status indicator */}
                      <div className="shrink-0">
                        {status === 'included' ? (
                          <div className="w-5 h-5 rounded-full bg-signal/15 flex items-center justify-center">
                            <Check className="w-3 h-3 text-signal" />
                          </div>
                        ) : status === 'excluded' ? (
                          <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
                            <X className="w-3 h-3 text-destructive" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-secondary/40 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      {/* Prefix name */}
                      <code className="text-xs font-mono text-foreground/80 min-w-[100px]">
                        {group.prefix}
                      </code>

                      {/* Count */}
                      <span className="text-xs text-muted-foreground tabular-nums ml-auto">
                        {group.count.toLocaleString('de-DE')} Seiten
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <Separator className="opacity-30" />

        {/* Custom Rules */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Eigene Regeln
          </h3>

          {draft.length > 0 && (
            <div className="space-y-1.5">
              {draft.map((rule, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md border border-border/30 bg-card/20 px-2.5 py-1.5"
                >
                  <Badge
                    variant={rule.type === 'include' ? 'default' : 'destructive'}
                    className={
                      rule.type === 'include'
                        ? 'bg-signal/15 text-signal border-signal/20'
                        : ''
                    }
                  >
                    {rule.type === 'include' ? 'Include' : 'Exclude'}
                  </Badge>
                  <code className="text-xs font-mono text-foreground/80 flex-1">
                    {rule.pattern}
                  </code>
                  <button
                    onClick={() => removeRule(i)}
                    className="text-muted-foreground/50 hover:text-destructive transition-colors p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new rule */}
          <div className="flex items-center gap-2">
            <Input
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              placeholder="/pfad/"
              className="h-8 text-xs font-mono border-border/50 flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPattern.trim()) {
                  addRule(newPattern, 'include');
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1 border-signal/30 text-signal hover:bg-signal/10"
              onClick={() => addRule(newPattern, 'include')}
              disabled={!newPattern.trim()}
            >
              <Plus className="w-3 h-3" />
              Include
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => addRule(newPattern, 'exclude')}
              disabled={!newPattern.trim()}
            >
              <Plus className="w-3 h-3" />
              Exclude
            </Button>
          </div>
        </div>

        <Separator className="opacity-30" />

        {/* Preview + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="w-3.5 h-3.5" />
            <span>
              <span className="text-foreground font-medium tabular-nums">
                {previewCount.toLocaleString('de-DE')}
              </span>
              {' '}von{' '}
              <span className="tabular-nums">
                {allPages.length.toLocaleString('de-DE')}
              </span>
              {' '}Seiten nach Filter
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button
              size="sm"
              className="bg-signal text-background hover:bg-signal-glow font-medium"
              onClick={handleSave}
            >
              Speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
