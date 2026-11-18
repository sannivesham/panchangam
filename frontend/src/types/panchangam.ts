export interface AngaDetail {
  index: number;
  name_telugu: string;
  name_english: string;
  start_utc: string;
  end_utc: string;
  start_time: string;
  end_time: string;
  start_telugu: string;
  end_telugu: string;
  start_date: string;
  end_date: string;
  paksha?: string;
  paksha_telugu?: string;
  ruler?: string;
  type?: string;
  half_tithi_index?: number;
}

export interface AngaWithTransition {
  primary: AngaDetail;
  next: AngaDetail | null;
  has_transition_today: boolean;
}

export interface MuhurthamInterval {
  name_telugu: string;
  name_english: string;
  is_auspicious: boolean;
  start_utc: string;
  end_utc: string;
  start_time: string;
  end_time: string;
  start_telugu: string;
  end_telugu: string;
  description: string;
}

export interface FestivalItem {
  id: string;
  name_telugu: string;
  name_english: string;
  description_telugu: string;
  description_english: string;
  region: string;
  month_index?: number;
  paksha?: string;
  tithi_index?: number;
}

export interface GrahaPosition {
  name_english: string;
  name_telugu: string;
  longitude: number;
  speed: number;
  is_retrograde: boolean;
  rashi: {
    index: number;
    telugu: string;
    english: string;
    degrees: number;
  };
  nakshatra: {
    index: number;
    telugu: string;
    english: string;
    pada: number;
  };
}

export interface DailyPanchangamData {
  metadata: {
    date: string;
    location_name: string;
    latitude: number;
    longitude: number;
    elevation_meters: number;
    timezone: string;
    ayanamsa: {
      name: string;
      degrees: number;
    };
    calculation_engine: string;
  };
  summary: {
    telugu: string;
    english: string;
  };
  telugu_calendar: {
    samvatsaram: {
      index: number;
      name_telugu: string;
      name_english: string;
    };
    masam: {
      index: number;
      name_telugu: string;
      name_english: string;
      is_adhika: boolean;
      is_kshaya: boolean;
    };
    paksham: {
      telugu: string;
      english: string;
    };
    ayanam: {
      name_telugu: string;
      name_english: string;
      description: string;
    };
    rituvu: {
      index: number;
      telugu: string;
      english: string;
      season: string;
    };
  };
  sun_moon: {
    sunrise: string;
    sunset: string;
    sunrise_telugu: string;
    sunset_telugu: string;
    moonrise: string;
    moonset: string;
    moonrise_telugu: string;
    moonset_telugu: string;
    sun_rashi: {
      index: number;
      telugu: string;
      english: string;
      degrees: number;
    };
    moon_rashi: {
      index: number;
      telugu: string;
      english: string;
      degrees: number;
    };
    dinamana_seconds: number;
    ratrimana_seconds: number;
  };
  panchangam: {
    vara: {
      index: number;
      name_telugu: string;
      name_english: string;
      ruler: string;
    };
    tithi: AngaWithTransition;
    nakshatra: AngaWithTransition;
    yoga: AngaWithTransition;
    karana: AngaWithTransition;
  };
  muhurtham: {
    rahu_kalam: MuhurthamInterval;
    yamagandam: MuhurthamInterval;
    gulika_kalam: MuhurthamInterval;
    abhijit_muhurtham: MuhurthamInterval;
    durmuhurthams: MuhurthamInterval[];
    brahma_muhurtham: MuhurthamInterval;
    varjyam: MuhurthamInterval[];
    amrita_kalam: MuhurthamInterval[];
  };
  grahas: GrahaPosition[];
  festivals?: FestivalItem[];
}

export interface MonthlyDayItem {
  date: string;
  day: number;
  weekday: string;
  weekday_english: string;
  telugu_month: string;
  paksha: string;
  tithi: string;
  tithi_end: string;
  nakshatra: string;
  nakshatra_end: string;
  sunrise: string;
  sunset: string;
  is_purnima: boolean;
  is_amavasya: boolean;
  is_ekadashi: boolean;
  festivals: FestivalItem[];
}

export interface MonthlyPanchangamData {
  year: number;
  month: number;
  location: string;
  total_days: number;
  days: MonthlyDayItem[];
}

export interface LocationItem {
  id: string;
  name: string;
  name_telugu: string;
  state: string;
  state_telugu: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  timezone: string;
  is_default?: boolean;
}
