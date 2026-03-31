import type { GscSite, GscAnalyticsRow } from '@/types/gsc-api';

const GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3';
const MAX_ROWS_PER_REQUEST = 25000;
const MAX_TOTAL_ROWS = 100000; // Safety cap: 4 pagination calls

export async function fetchGscSites(accessToken: string): Promise<GscSite[]> {
  const response = await fetch(`${GSC_API_BASE}/sites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new GscApiError(
      (error as { error?: { message?: string } }).error?.message ??
        `GSC API error: ${response.status}`,
      response.status,
    );
  }

  const data = (await response.json()) as {
    siteEntry?: Array<{ siteUrl: string; permissionLevel: string }>;
  };

  // Only return properties where the user has sufficient access
  return (data.siteEntry ?? [])
    .filter((site) =>
      ['siteOwner', 'siteFullUser'].includes(site.permissionLevel),
    )
    .map((site) => ({
      siteUrl: site.siteUrl,
      permissionLevel: site.permissionLevel as GscSite['permissionLevel'],
    }));
}

export async function fetchGscSearchAnalytics(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
): Promise<GscAnalyticsRow[]> {
  const allRows: GscAnalyticsRow[] = [];
  let startRow = 0;

  while (startRow < MAX_TOTAL_ROWS) {
    const response = await fetch(
      `${GSC_API_BASE}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['query', 'page'],
          rowLimit: MAX_ROWS_PER_REQUEST,
          startRow,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new GscApiError(
        (error as { error?: { message?: string } }).error?.message ??
          `GSC API error: ${response.status}`,
        response.status,
      );
    }

    const data = (await response.json()) as { rows?: GscAnalyticsRow[] };
    const rows = data.rows ?? [];

    allRows.push(...rows);

    // End of data: fewer rows than requested
    if (rows.length < MAX_ROWS_PER_REQUEST) break;

    startRow += MAX_ROWS_PER_REQUEST;
  }

  return allRows;
}

export class GscApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'GscApiError';
  }
}
