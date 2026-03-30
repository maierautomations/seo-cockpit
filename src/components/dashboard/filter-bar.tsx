'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ArrowUp, ArrowDown, X, Filter } from 'lucide-react';
import { Circle, Clock, CheckCircle2, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { CATEGORIES } from '@/lib/scoring/categories';
import { ARTICLE_STATUSES, STATUS_ORDER } from '@/lib/status-config';
import { DEFAULT_FILTERS } from '@/types/dashboard';
import type { DashboardFilters } from '@/types/dashboard';
import type { CategoryId, ArticleStatusId } from '@/types/scoring';

const STATUS_ICONS = { Circle, Clock, CheckCircle2, EyeOff } as const;

const CATEGORY_ORDER: CategoryId[] = [
  'content-problem',
  'packaging-problem',
  'quick-win',
  'low-priority',
];

const SORT_OPTIONS: Array<{ value: DashboardFilters['sortBy']; label: string }> = [
  { value: 'score', label: 'Score' },
  { value: 'impressionen', label: 'Impressionen' },
  { value: 'position', label: 'Position' },
  { value: 'ctr', label: 'CTR' },
  { value: 'potential', label: 'Potenzial' },
];

interface FilterBarProps {
  filters: DashboardFilters;
  onFilterChange: (partial: Partial<DashboardFilters>) => void;
  totalResults: number;
  totalPages: number;
}

export function FilterBar({ filters, onFilterChange, totalResults, totalPages }: FilterBarProps) {
  // Debounced search: local state for immediate input, debounced propagation
  const [searchLocal, setSearchLocal] = useState(filters.search);
  const [searchVersion, setSearchVersion] = useState(0);

  // Debounce: propagate local search after 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: searchLocal, page: 0 });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = useCallback((value: string) => {
    setSearchLocal(value);
    setSearchVersion((v) => v + 1);
  }, []);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.impressionRange !== DEFAULT_FILTERS.impressionRange ||
    filters.positionRange !== DEFAULT_FILTERS.positionRange ||
    filters.statuses.length > 0 ||
    filters.sortBy !== DEFAULT_FILTERS.sortBy ||
    filters.sortDir !== DEFAULT_FILTERS.sortDir ||
    filters.search !== DEFAULT_FILTERS.search;

  const toggleCategory = useCallback(
    (id: CategoryId) => {
      const next = filters.categories.includes(id)
        ? filters.categories.filter((c) => c !== id)
        : [...filters.categories, id];
      onFilterChange({ categories: next, page: 0 });
    },
    [filters.categories, onFilterChange],
  );

  const toggleStatus = useCallback(
    (id: ArticleStatusId) => {
      const next = filters.statuses.includes(id)
        ? filters.statuses.filter((s) => s !== id)
        : [...filters.statuses, id];
      onFilterChange({ statuses: next, page: 0 });
    },
    [filters.statuses, onFilterChange],
  );

  const handleReset = useCallback(() => {
    setSearchLocal('');
    onFilterChange({ ...DEFAULT_FILTERS });
  }, [onFilterChange]);

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-4 space-y-3">
      {/* Row 1: Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

        {/* Category multi-select */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-border/60 hover:border-signal/40 hover:bg-signal/5"
            >
              Kategorie
              {filters.categories.length > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-signal/20 text-signal text-[10px] font-semibold">
                  {filters.categories.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-2">
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2">Kategorie filtern</p>
            <div className="space-y-1">
              {CATEGORY_ORDER.map((id) => {
                const info = CATEGORIES[id];
                const checked = filters.categories.includes(id);
                return (
                  <label
                    key={id}
                    className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleCategory(id)}
                    />
                    <span className="text-sm shrink-0">{info.emoji}</span>
                    <span className="text-sm">{info.label}</span>
                  </label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Impressions range */}
        <Select
          value={filters.impressionRange}
          onValueChange={(v) =>
            onFilterChange({
              impressionRange: v as DashboardFilters['impressionRange'],
              page: 0,
            })
          }
        >
          <SelectTrigger className="h-8 text-xs border-border/60 min-w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Imp.</SelectItem>
            <SelectItem value=">10k">&gt; 10.000</SelectItem>
            <SelectItem value=">5k">&gt; 5.000</SelectItem>
            <SelectItem value=">1k">&gt; 1.000</SelectItem>
          </SelectContent>
        </Select>

        {/* Position range */}
        <Select
          value={filters.positionRange}
          onValueChange={(v) =>
            onFilterChange({
              positionRange: v as DashboardFilters['positionRange'],
              page: 0,
            })
          }
        >
          <SelectTrigger className="h-8 text-xs border-border/60 min-w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Pos.</SelectItem>
            <SelectItem value="1-10">Pos. 1–10</SelectItem>
            <SelectItem value="11-20">Pos. 11–20</SelectItem>
            <SelectItem value="20+">Pos. 20+</SelectItem>
          </SelectContent>
        </Select>

        {/* Status multi-select */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-border/60 hover:border-signal/40 hover:bg-signal/5"
            >
              Status
              {filters.statuses.length > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-signal/20 text-signal text-[10px] font-semibold">
                  {filters.statuses.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-52 p-2">
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2">Status filtern</p>
            <div className="space-y-1">
              {STATUS_ORDER.map((id) => {
                const info = ARTICLE_STATUSES[id];
                const Icon = STATUS_ICONS[info.icon];
                const checked = filters.statuses.includes(id);
                return (
                  <label
                    key={id}
                    className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleStatus(id)}
                    />
                    <Icon className={`w-3.5 h-3.5 ${info.color}`} />
                    <span className="text-sm">{info.label}</span>
                  </label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchLocal}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="URL oder Keyword suchen..."
            className="h-8 pl-8 text-xs border-border/60"
          />
          {searchLocal && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Sort + results info */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground shrink-0">Sortieren:</span>
        <Select
          value={filters.sortBy}
          onValueChange={(v) =>
            onFilterChange({ sortBy: v as DashboardFilters['sortBy'], page: 0 })
          }
        >
          <SelectTrigger className="h-7 text-xs border-border/60 min-w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() =>
            onFilterChange({
              sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc',
            })
          }
          title={filters.sortDir === 'asc' ? 'Aufsteigend' : 'Absteigend'}
        >
          {filters.sortDir === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5" />
          )}
        </Button>

        {/* Spacer + results info */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-muted-foreground tabular-nums">
            {totalResults} von {totalPages} Artikeln
          </span>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-signal/80 hover:text-signal transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Zurücksetzen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
