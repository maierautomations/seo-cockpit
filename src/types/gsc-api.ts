export interface GscSite {
  siteUrl: string;
  permissionLevel: 'siteOwner' | 'siteFullUser' | 'siteRestrictedUser' | 'siteUnverifiedUser';
}

export interface GscAnalyticsRow {
  keys: [string, string]; // [query, pageUrl]
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscOverviewRow {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscConnectionState {
  property: string | null;
  dateRange: { startDate: string; endDate: string } | null;
  connectedAt: string | null;
  dataSource: 'gsc' | 'csv';
  datePreset?: string;
}
