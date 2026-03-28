import type { StructureCheck, HeadingInfo } from '@/types/analysis';

// Regex patterns for markdown structure analysis
const H1_REGEX = /^#\s+(.+)$/gm;
const H2_REGEX = /^##\s+(.+)$/gm;
const H3_REGEX = /^###\s+(.+)$/gm;
const FAQ_PATTERNS = [
  /\bfaq\b/i,
  /häufig\s+(gestellte\s+)?fragen/i,
  /fragen\s+und\s+antworten/i,
  /\bQ&A\b/i,
  /frequently\s+asked/i,
];
const TABLE_REGEX = /\|.+\|.+\|/gm;

// Detect infoboxes: common patterns in financial articles
const INFOBOX_PATTERNS = [
  /[💡📦ℹ️📊📈📉🔍]/g,
  /(?:info|hinweis|tipp|definition|erklärung)\s*[:：]/gi,
  />\s*\*\*(?:Info|Hinweis|Tipp|Definition)/gm,
];

// Source/reference block detection
const SOURCE_PATTERNS = [
  /(?:quellen?|sources?|referenz)\s*[:：]/gi,
  /^\*\s*quelle/gim,
  /\[(?:\d+)\]/g, // citation markers [1], [2]
];

export function analyzeStructure(
  markdown: string,
  mainKeyword: string,
): StructureCheck {
  const keywordLower = mainKeyword.toLowerCase();

  // H1
  const h1Matches = [...markdown.matchAll(H1_REGEX)];
  const h1Text = h1Matches[0]?.[1]?.trim() ?? '';
  const h1 = {
    present: h1Matches.length > 0,
    containsKeyword: h1Text.toLowerCase().includes(keywordLower),
    text: h1Text,
  };

  // H2s
  const h2Matches = [...markdown.matchAll(H2_REGEX)];
  const h2s: HeadingInfo[] = h2Matches.map((m) => ({
    text: m[1]?.trim() ?? '',
    containsKeyword: (m[1] ?? '').toLowerCase().includes(keywordLower),
  }));

  // H3s
  const h3Matches = [...markdown.matchAll(H3_REGEX)];
  const h3s = h3Matches.map((m) => ({ text: m[1]?.trim() ?? '' }));

  // FAQ block
  const faqBlock = FAQ_PATTERNS.some((p) => p.test(markdown));

  // Infoboxes
  let infoboxCount = 0;
  for (const pattern of INFOBOX_PATTERNS) {
    const matches = markdown.match(pattern);
    if (matches) infoboxCount += matches.length;
  }
  // Cap at a reasonable max
  infoboxCount = Math.min(infoboxCount, 10);

  // Comparison table
  const tableMatches = markdown.match(TABLE_REGEX);
  const comparisonTable = (tableMatches?.length ?? 0) >= 3; // at least 3 rows = a real table

  // Source block
  let sourceCount = 0;
  for (const pattern of SOURCE_PATTERNS) {
    const matches = markdown.match(pattern);
    if (matches) sourceCount += matches.length;
  }
  const sourceBlock = {
    present: sourceCount > 0,
    count: sourceCount,
  };

  return {
    h1,
    h2s,
    h3s,
    faqBlock,
    infoboxCount,
    comparisonTable,
    sourceBlock,
  };
}
