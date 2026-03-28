import { Progress } from '@/components/ui/progress';

interface ScoreBarProps {
  score: number; // 0-100
  className?: string;
}

export function ScoreBar({ score, className }: ScoreBarProps) {
  const color =
    score >= 70
      ? '[&>div]:bg-emerald-500'
      : score >= 40
        ? '[&>div]:bg-amber-500'
        : '[&>div]:bg-slate-500';

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Progress value={score} className={`h-1.5 w-16 bg-secondary ${color}`} />
      <span className="text-xs text-muted-foreground tabular-nums font-mono">
        {Math.round(score)}
      </span>
    </div>
  );
}
