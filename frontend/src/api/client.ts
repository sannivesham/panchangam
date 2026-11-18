import {
  DailyPanchangamData,
  MonthlyPanchangamData,
  LocationItem,
  FestivalItem,
} from '../types/panchangam';
import {
  calculateDailyPanchangamClient,
  calculateMonthlyPanchangamClient,
  calculateYearlyOverviewClient,
  fetchFestivalsClient,
  searchLocationsClient,
} from '../engine/panchangamCalculator';

const API_BASE = import.meta.env.VITE_API_BASE || '';

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
  if (API_BASE) {
    try {
      const locQ = buildLocationQuery(locParams);
      const dateQ = dateStr ? `date=${encodeURIComponent(dateStr)}` : '';
      const query = [dateQ, locQ].filter(Boolean).join('&');
      const res = await fetch(`${API_BASE}/api/panchangam/daily?${query}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend API unavailable, using in-browser astronomical engine:", e);
    }
  } else {
    // If running in development with relative /api proxy
    try {
      const locQ = buildLocationQuery(locParams);
      const dateQ = dateStr ? `date=${encodeURIComponent(dateStr)}` : '';
      const query = [dateQ, locQ].filter(Boolean).join('&');
      const res = await fetch(`/api/panchangam/daily?${query}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
  }

  // Instant in-browser high-precision astronomical calculation (for GitHub Pages / Netlify / Offline)
  return calculateDailyPanchangamClient(dateStr, locParams);
}

export async function fetchMonthlyPanchangam(
  year: number,
  month: number,
  locParams: LocationParams = {}
): Promise<MonthlyPanchangamData> {
  if (API_BASE) {
    try {
      const locQ = buildLocationQuery(locParams);
      const res = await fetch(`${API_BASE}/api/panchangam/monthly?year=${year}&month=${month}&${locQ}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend API unavailable, using in-browser monthly calculator:", e);
    }
  } else {
    try {
      const locQ = buildLocationQuery(locParams);
      const res = await fetch(`/api/panchangam/monthly?year=${year}&month=${month}&${locQ}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
  }

  return calculateMonthlyPanchangamClient(year, month, locParams);
}

export async function fetchYearlyOverview(
  year: number,
  locParams: LocationParams = {}
): Promise<any> {
  if (API_BASE) {
    try {
      const locQ = buildLocationQuery(locParams);
      const res = await fetch(`${API_BASE}/api/panchangam/yearly?year=${year}&${locQ}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend API unavailable, using in-browser yearly calculator:", e);
    }
  } else {
    try {
      const locQ = buildLocationQuery(locParams);
      const res = await fetch(`/api/panchangam/yearly?year=${year}&${locQ}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
  }

  return calculateYearlyOverviewClient(year, locParams);
}

export async function searchLocations(query: string): Promise<LocationItem[]> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/locations/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        return data.locations || [];
      }
    } catch {
      // Fallback
    }
  } else {
    try {
      const res = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        return data.locations || [];
      }
    } catch {
      // Fallback
    }
  }

  return searchLocationsClient(query);
}

export async function fetchFestivals(
  year?: number,
  month?: number,
  region: string = 'ALL'
): Promise<FestivalItem[]> {
  if (API_BASE) {
    try {
      const parts: string[] = [`region=${encodeURIComponent(region)}`];
      if (year) parts.push(`year=${year}`);
      if (month) parts.push(`month=${month}`);
      const res = await fetch(`${API_BASE}/api/festivals?${parts.join('&')}`);
      if (res.ok) {
        const data = await res.json();
        return data.festivals || [];
      }
    } catch {
      // Fallback
    }
  } else {
    try {
      const parts: string[] = [`region=${encodeURIComponent(region)}`];
      if (year) parts.push(`year=${year}`);
      if (month) parts.push(`month=${month}`);
      const res = await fetch(`/api/festivals?${parts.join('&')}`);
      if (res.ok) {
        const data = await res.json();
        return data.festivals || [];
      }
    } catch {
      // Fallback
    }
  }

  return fetchFestivalsClient(year, month, region);
}
