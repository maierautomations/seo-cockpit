import type { SerpApiResponse, SerpResult, FeaturedSnippet, PeopleAlsoAsk } from '@/types/serp';

// Abstracted SERP client — swap provider without touching calling code
// Currently supports: ValueSERP
// Future: SerpAPI, DataForSEO, etc.

type SerpProvider = 'valueserp';

interface SerpClientConfig {
  provider: SerpProvider;
  apiKey: string;
}

function getConfig(): SerpClientConfig {
  const apiKey = process.env.VALUESERP_API_KEY;
  if (!apiKey) {
    throw new Error('VALUESERP_API_KEY ist nicht konfiguriert.');
  }
  return { provider: 'valueserp', apiKey };
}

// Fetch SERP results for a keyword
export async function fetchSerp(keyword: string): Promise<SerpApiResponse> {
  const config = getConfig();

  switch (config.provider) {
    case 'valueserp':
      return fetchValueSerp(keyword, config.apiKey);
    default:
      throw new Error(`Unbekannter SERP-Provider: ${config.provider}`);
  }
}

// ValueSERP implementation
// Docs: https://www.valueserp.com/docs/search-api/searches/google
async function fetchValueSerp(keyword: string, apiKey: string): Promise<SerpApiResponse> {
  const params = new URLSearchParams({
    api_key: apiKey,
    q: keyword,
    location: 'Germany',
    gl: 'de',
    hl: 'de',
    google_domain: 'google.de',
    num: '10',
    output: 'json',
    include_fields: 'organic_results,answer_box,related_questions',
  });

  const response = await fetch(
    `https://api.valueserp.com/search?${params.toString()}`,
    { signal: AbortSignal.timeout(20000) },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ValueSERP API error (${response.status}): ${text}`);
  }

  const raw = (await response.json()) as ValueSerpRawResponse;

  return normalizeValueSerp(keyword, raw);
}

// ValueSERP raw response types (only what we use)
interface ValueSerpRawResponse {
  organic_results?: ValueSerpOrganic[];
  answer_box?: ValueSerpAnswerBox;
  related_questions?: ValueSerpRelatedQuestion[];
  search_information?: { total_results?: number };
}

interface ValueSerpOrganic {
  position: number;
  title: string;
  link: string;
  domain: string;
  snippet: string;
}

interface ValueSerpAnswerBox {
  type?: string;
  title?: string;
  answer?: string;
  snippet?: string;
  link?: string;
  list?: string[];
  table?: string[][];
}

interface ValueSerpRelatedQuestion {
  question: string;
}

// Normalize ValueSERP response to our abstracted format
function normalizeValueSerp(keyword: string, raw: ValueSerpRawResponse): SerpApiResponse {
  const organicResults: SerpResult[] = (raw.organic_results ?? []).map((r) => ({
    position: r.position,
    title: r.title,
    url: r.link,
    description: r.snippet,
    domain: r.domain,
  }));

  let featuredSnippet: FeaturedSnippet | null = null;
  if (raw.answer_box) {
    const ab = raw.answer_box;
    let type: FeaturedSnippet['type'] = 'paragraph';
    if (ab.list && ab.list.length > 0) type = 'list';
    if (ab.table && ab.table.length > 0) type = 'table';

    featuredSnippet = {
      type,
      title: ab.title ?? '',
      content: ab.answer ?? ab.snippet ?? '',
      url: ab.link ?? '',
    };
  }

  const peopleAlsoAsk: PeopleAlsoAsk[] = (raw.related_questions ?? []).map((q) => ({
    question: q.question,
  }));

  return {
    keyword,
    organicResults,
    featuredSnippet,
    peopleAlsoAsk,
    totalResults: raw.search_information?.total_results ?? 0,
  };
}
