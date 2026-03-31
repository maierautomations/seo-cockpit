'use client';

import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import type { BriefingStep } from '@/hooks/use-briefing';

interface BriefingProgressProps {
  step: BriefingStep;
}

const steps: { key: BriefingStep; label: string }[] = [
  { key: 'keywords', label: 'Keyword-Cluster wird erstellt\u2026' },
  { key: 'serp', label: 'SERP-Daten werden geladen\u2026' },
  { key: 'generating', label: 'Briefing wird generiert\u2026' },
];

const stepOrder: BriefingStep[] = ['keywords', 'serp', 'generating', 'done'];

function getStepState(
  currentStep: BriefingStep,
  checkStep: BriefingStep,
): 'done' | 'active' | 'pending' {
  const currentIdx = stepOrder.indexOf(currentStep);
  const checkIdx = stepOrder.indexOf(checkStep);
  if (checkIdx < currentIdx) return 'done';
  if (checkIdx === currentIdx) return 'active';
  return 'pending';
}

export function BriefingProgress({ step }: BriefingProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-signal/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-signal animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full bg-signal/5 animate-ping" />
      </div>

      <div className="space-y-3 w-full max-w-xs">
        {steps.map((s) => {
          const state = getStepState(step, s.key);
          return (
            <div key={s.key} className="flex items-center gap-3">
              {state === 'done' ? (
                <CheckCircle2 className="w-5 h-5 text-signal shrink-0" />
              ) : state === 'active' ? (
                <Loader2 className="w-5 h-5 text-signal animate-spin shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
              )}
              <span
                className={
                  state === 'pending'
                    ? 'text-sm text-muted-foreground/40'
                    : state === 'active'
                      ? 'text-sm text-foreground font-medium'
                      : 'text-sm text-muted-foreground'
                }
              >
                {state === 'done' ? s.label.replace('\u2026', '') : s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
