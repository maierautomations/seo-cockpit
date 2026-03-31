import type { ContentBriefing } from '@/types/briefing';

/**
 * Convert a ContentBriefing to a downloadable Markdown string.
 */
export function briefingToMarkdown(briefing: ContentBriefing): string {
  const lines: string[] = [];

  // Header
  lines.push(`# Content-Briefing: ${briefing.hauptkeyword}`);
  lines.push(`*Generiert am ${new Date(briefing.generatedAt).toLocaleDateString('de-DE')}*`);
  lines.push('');

  if (briefing.nebenkeywords.length > 0) {
    lines.push(`**Nebenkeywords:** ${briefing.nebenkeywords.join(', ')}`);
    lines.push('');
  }

  // Heading structure
  lines.push('---');
  lines.push('');
  lines.push('## Heading-Struktur');
  lines.push('');

  const h1 = briefing.headings.find((h) => h.level === 'h1');
  if (h1) {
    lines.push(`**H1:** ${h1.text}`);
    lines.push('');
  }

  lines.push('### H2-Gliederung');
  lines.push('');
  const h2s = briefing.headings.filter((h) => h.level === 'h2');
  h2s.forEach((h, i) => {
    const note = h.note ? ` *(${h.note})*` : '';
    lines.push(`${i + 1}. ${h.text}${note}`);
  });
  lines.push('');

  // Keyword cluster
  lines.push('---');
  lines.push('');
  lines.push('## Keyword-Cluster');
  lines.push('');
  lines.push('| Keyword | Impressionen | Position | Quelle |');
  lines.push('|---------|-------------|----------|--------|');
  for (const kw of briefing.keywordCluster) {
    const imp = kw.impressionen > 0 ? kw.impressionen.toLocaleString('de-DE') : '—';
    const pos = kw.position > 0 ? kw.position.toFixed(1).replace('.', ',') : '—';
    lines.push(`| ${kw.keyword} | ${imp} | ${pos} | ${kw.source === 'gsc' ? 'GSC' : 'Eingabe'} |`);
  }
  lines.push('');

  // Recommended elements
  lines.push('---');
  lines.push('');
  lines.push('## Empfohlene Elemente');
  lines.push('');
  for (const el of briefing.elements) {
    lines.push(`- **${el.label}** (${el.type}): ${el.description}`);
    lines.push(`  Platzierung: ${el.placement}`);
  }
  lines.push('');

  // FAQ
  lines.push('---');
  lines.push('');
  lines.push('## FAQ-Fragen');
  lines.push('');
  for (const faq of briefing.faqQuestions) {
    lines.push(`### ${faq.question}`);
    lines.push(`*Antwort-Hinweis:* ${faq.answerHint}`);
    lines.push('');
  }

  // Yoast SEO
  lines.push('---');
  lines.push('');
  lines.push('## Yoast SEO');
  lines.push('');
  lines.push(`- **Keyphrase:** ${briefing.yoast.keyphrase}`);
  lines.push(`- **SEO-Titel:** ${briefing.yoast.seoTitle}`);
  lines.push(`- **Slug:** /${briefing.yoast.slug}`);
  lines.push(`- **Meta-Description:** ${briefing.yoast.metaDescription}`);
  lines.push('');

  // Internal links
  if (briefing.internalLinks.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## Interne Verlinkung');
    lines.push('');
    lines.push('| URL | Anker-Vorschlag | Impressionen |');
    lines.push('|-----|-----------------|-------------|');
    for (const link of briefing.internalLinks) {
      const imp = link.impressionen.toLocaleString('de-DE');
      lines.push(`| ${link.url} | ${link.anchorSuggestion} | ${imp} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Trigger a browser download of the briefing as .md file.
 */
export function downloadBriefingMarkdown(briefing: ContentBriefing): void {
  const markdown = briefingToMarkdown(briefing);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const slug = briefing.yoast.slug || briefing.hauptkeyword.toLowerCase().replace(/\s+/g, '-');
  const a = document.createElement('a');
  a.href = url;
  a.download = `briefing-${slug}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
