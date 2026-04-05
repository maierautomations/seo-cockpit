export type DatePreset = '7d' | '28d' | '3months' | '6months' | '12months';

export const DATE_PRESETS: Record<DatePreset, string> = {
  '7d': 'Letzte 7 Tage',
  '28d': 'Letzte 28 Tage',
  '3months': 'Letzte 3 Monate',
  '6months': 'Letzte 6 Monate',
  '12months': 'Letztes Jahr',
};

export function getDateRange(preset: DatePreset): { startDate: string; endDate: string } {
  const end = new Date();
  // GSC data has a 2-3 day delay
  end.setDate(end.getDate() - 3);
  const start = new Date(end);

  switch (preset) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '28d':
      start.setDate(start.getDate() - 28);
      break;
    case '3months':
      start.setMonth(start.getMonth() - 3);
      break;
    case '6months':
      start.setMonth(start.getMonth() - 6);
      break;
    case '12months':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}
