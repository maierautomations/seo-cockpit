const numberFormatter = new Intl.NumberFormat('de-DE');
const compactFormatter = new Intl.NumberFormat('de-DE', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

// Format number with German locale: 14200 → "14.200"
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

// Format compact: 14200 → "14,2 Tsd."
export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

// Format decimal with German locale: 12.7 → "12,7"
export function formatDecimal(value: number, digits = 1): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

// Format as percentage: 0.013 → "1,3 %"
export function formatPercent(value: number, digits = 1): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

// Format URL for display: strip protocol and trailing slash
export function formatUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

// Truncate URL for list display
export function truncateUrl(url: string, maxLength = 50): string {
  const formatted = formatUrl(url);
  if (formatted.length <= maxLength) return formatted;
  return formatted.slice(0, maxLength - 1) + '\u2026';
}
