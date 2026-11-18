import {
  DailyPanchangamData,
  MonthlyPanchangamData,
  LocationItem,
  FestivalItem,
} from '../types/panchangam';

const API_BASE = ''; // Uses Vite proxy in development

export interface LocationParams {
  cityId?: string;
  lat?: number;
  lon?: number;
  elevation?: number;
}

function buildLocationQuery(params: LocationParams): string {
  const parts: string[] = [];
  if (params.cityId) {
    parts.push(`city_id=${encodeURIComponent(params.cityId)}`);
  }
  if (params.lat !== undefined && params.lon !== undefined) {
    parts.push(`lat=${params.lat}`);
    parts.push(`lon=${params.lon}`);
  }
  if (params.elevation !== undefined) {
    parts.push(`elevation=${params.elevation}`);
  }
  return parts.length > 0 ? parts.join('&') : 'city_id=hyderabad';
}

export async function fetchDailyPanchangam(
  dateStr?: string,
  locParams: LocationParams = {}
): Promise<DailyPanchangamData> {
  const locQ = buildLocationQuery(locParams);
  const dateQ = dateStr ? `date=${encodeURIComponent(dateStr)}` : '';
  const query = [dateQ, locQ].filter(Boolean).join('&');

  const res = await fetch(`${API_BASE}/api/panchangam/daily?${query}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch daily panchangam: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchMonthlyPanchangam(
  year: number,
  month: number,
  locParams: LocationParams = {}
): Promise<MonthlyPanchangamData> {
  const locQ = buildLocationQuery(locParams);
  const res = await fetch(
    `${API_BASE}/api/panchangam/monthly?year=${year}&month=${month}&${locQ}`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch monthly panchangam: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchYearlyOverview(
  year: number,
  locParams: LocationParams = {}
): Promise<any> {
  const locQ = buildLocationQuery(locParams);
  const res = await fetch(`${API_BASE}/api/panchangam/yearly?year=${year}&${locQ}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch yearly overview: ${res.statusText}`);
  }
  return res.json();
}

export async function searchLocations(query: string): Promise<LocationItem[]> {
  const res = await fetch(`${API_BASE}/api/locations/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error(`Location search failed: ${res.statusText}`);
  }
  const data = await res.json();
  return data.locations || [];
}

export async function fetchFestivals(
  year?: number,
  month?: number,
  region: string = 'ALL'
): Promise<any[]> {
  const parts: string[] = [`region=${encodeURIComponent(region)}`];
  if (year) parts.push(`year=${year}`);
  if (month) parts.push(`month=${month}`);

  const res = await fetch(`${API_BASE}/api/festivals?${parts.join('&')}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch festivals: ${res.statusText}`);
  }
  const data = await res.json();
  return data.festivals || [];
}
