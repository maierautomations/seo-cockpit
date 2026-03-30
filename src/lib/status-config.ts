import type { ArticleStatusId } from '@/types/scoring';

export interface StatusInfo {
  id: ArticleStatusId;
  label: string;
  icon: 'Circle' | 'Clock' | 'CheckCircle2' | 'EyeOff';
  color: string;
  bgColor: string;
}

export const ARTICLE_STATUSES: Record<ArticleStatusId, StatusInfo> = {
  'offen': {
    id: 'offen',
    label: 'Offen',
    icon: 'Circle',
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
  },
  'in-bearbeitung': {
    id: 'in-bearbeitung',
    label: 'In Bearbeitung',
    icon: 'Clock',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
  },
  'optimiert': {
    id: 'optimiert',
    label: 'Optimiert',
    icon: 'CheckCircle2',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
  },
  'ignoriert': {
    id: 'ignoriert',
    label: 'Ignoriert',
    icon: 'EyeOff',
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
  },
};

export const STATUS_ORDER: ArticleStatusId[] = [
  'offen',
  'in-bearbeitung',
  'optimiert',
  'ignoriert',
];
