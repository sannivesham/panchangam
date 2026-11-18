/**
 * High-Precision In-Browser Astronomical Calculations
 * Based on Jean Meeus Astronomical Algorithms and Lahiri (Chitrapaksha) Ayanamsa.
 */

export function dateToJD(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() +
    date.getUTCHours() / 24.0 +
    date.getUTCMinutes() / 1440.0 +
    date.getUTCSeconds() / 86400.0;

  let year = y;
  let month = m;
  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);

  return Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    d + B - 1524.5;
}

export function jdToDate(jd: number): Date {
  const z = Math.floor(jd + 0.5);
  const f = (jd + 0.5) - z;

  let alpha = Math.floor((z - 1867216.25) / 36524.25);
  let a = z + 1 + alpha - Math.floor(alpha / 4);
  let b = a + 1524;
  let c = Math.floor((b - 122.1) / 365.25);
  let d = Math.floor(365.25 * c);
  let e = Math.floor((b - d) / 30.6001);

  let day = b - d - Math.floor(30.6001 * e) + f;
  let month = e < 14 ? e - 1 : e - 13;
  let year = month > 2 ? c - 4716 : c - 4715;

  const dayInt = Math.floor(day);
  const dayFrac = day - dayInt;
  const hours = Math.floor(dayFrac * 24);
  const minutes = Math.floor((dayFrac * 24 - hours) * 60);
  const seconds = Math.floor(((dayFrac * 24 - hours) * 60 - minutes) * 60);

  return new Date(Date.UTC(year, month - 1, dayInt, hours, minutes, seconds));
}

export function getAyanamsa(jd: number): number {
  // True Chitrapaksha / Lahiri Ayanamsa: 23.85709 deg at J2000.0 (JD 2451545.0)
  // Precession rate: ~50.29 arcseconds per Julian year
  const t = (jd - 2451545.0) / 365.25;
  return 23.85709 + (50.29 / 3600.0) * t;
}

function normalize360(deg: number): number {
  let d = deg % 360.0;
  if (d < 0) d += 360.0;
  return d;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180.0;
}

function radToDeg(rad: number): number {
  return (rad * 180.0) / Math.PI;
}

export function getSunSiderealLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;

  // Geometric mean longitude of the Sun
  const L0 = normalize360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  // Mean anomaly of the Sun
  const M = degToRad(normalize360(357.52911 + 35999.05029 * T - 0.0001537 * T * T));

  // Equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);

  const sunTropical = normalize360(L0 + C);
  const ayan = getAyanamsa(jd);
  return normalize360(sunTropical - ayan);
}

export function getMoonSiderealLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;

  const L_prime = degToRad(normalize360(218.3164477 + 481267.88123421 * T));
  const D = degToRad(normalize360(297.8501921 + 445267.1114034 * T));
  const M = degToRad(normalize360(357.5291092 + 35999.0502909 * T));
  const M_prime = degToRad(normalize360(134.9633964 + 477198.8675055 * T));
  const F = degToRad(normalize360(93.2720950 + 483202.0175233 * T));

  const pert =
    6.288774 * Math.sin(M_prime) +
    1.274027 * Math.sin(2 * D - M_prime) +
    0.658314 * Math.sin(2 * D) +
    0.213618 * Math.sin(2 * M_prime) -
    0.185116 * Math.sin(M) -
    0.114332 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * D - 2 * M_prime) +
    0.057066 * Math.sin(2 * D - M - M_prime) +
    0.053322 * Math.sin(2 * D + M_prime) +
    0.046100 * Math.sin(2 * D - M) -
    0.034728 * Math.sin(D) -
    0.030383 * Math.sin(M + M_prime) +
    0.015327 * Math.sin(2 * D - 2 * F) -
    0.012528 * Math.sin(2 * D + M - M_prime) +
    0.010980 * Math.sin(2 * D - 2 * M - M_prime);

  const moonTropical = normalize360(radToDeg(L_prime) + pert);
  const ayan = getAyanamsa(jd);
  return normalize360(moonTropical - ayan);
}

export function getLunarElongation(jd: number): number {
  const moon = getMoonSiderealLongitude(jd);
  const sun = getSunSiderealLongitude(jd);
  return normalize360(moon - sun);
}

export function calculateSunTimes(
  date: Date,
  latitude: number,
  longitude: number
): { sunrise: Date; sunset: Date; nextSunrise: Date } {
  // NOAA Solar Calculations
  function getSunRiseSet(d: Date, isRise: boolean): Date {
    const lat = latitude;
    const lng = longitude;

    // Day of year
    const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 0));
    const diff = d.getTime() - start.getTime();
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Approximate time
    const lngHour = lng / 15.0;
    const t = isRise ? day + (6.0 - lngHour) / 24.0 : day + (18.0 - lngHour) / 24.0;

    // Sun's mean anomaly
    const M = degToRad((0.9856 * t) - 3.289);

    // Sun's true longitude
    let L = normalize360(radToDeg(M) + (1.916 * Math.sin(M)) + (0.020 * Math.sin(2 * M)) + 282.634);

    // Right ascension
    let RA = normalize360(radToDeg(Math.atan(0.91764 * Math.tan(degToRad(L)))));
    const Lquadrant = Math.floor(L / 90.0) * 90.0;
    const RAquadrant = Math.floor(RA / 90.0) * 90.0;
    RA = (RA + (Lquadrant - RAquadrant)) / 15.0;

    // Sun's declination
    const sinDec = 0.39782 * Math.sin(degToRad(L));
    const cosDec = Math.cos(Math.asin(sinDec));

    // Sun's local hour angle (Zenith 90.833 deg for sunrise/sunset including refraction and semi-diameter)
    const cosH = (Math.cos(degToRad(90.833)) - (sinDec * Math.sin(degToRad(lat)))) / (cosDec * Math.cos(degToRad(lat)));

    let H: number;
    if (isRise) {
      H = 360.0 - radToDeg(Math.acos(Math.max(-1.0, Math.min(1.0, cosH))));
    } else {
      H = radToDeg(Math.acos(Math.max(-1.0, Math.min(1.0, cosH))));
    }
    H = H / 15.0;

    // Local mean time
    const T_calc = H + RA - (0.06571 * t) - 6.622;
    let UT = (T_calc - lngHour) % 24.0;
    if (UT < 0) UT += 24.0;

    const res = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    res.setUTCMinutes(Math.round(UT * 60));
    return res;
  }

  const sunrise = getSunRiseSet(date, true);
  const sunset = getSunRiseSet(date, false);

  const tomorrow = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  const nextSunrise = getSunRiseSet(tomorrow, true);

  return { sunrise, sunset, nextSunrise };
}

export function calculateMoonTimes(
  date: Date,
  latitude: number,
  longitude: number
): { moonrise: Date; moonset: Date } {
  // Approximate moonrise & moonset using lunar phase offset from solar times
  const sunTimes = calculateSunTimes(date, latitude, longitude);
  const jd = dateToJD(date);
  const elong = getLunarElongation(jd);

  // Moon rises ~48-52 minutes later each day (elong / 12 * 48m approx)
  const offsetHours = (elong / 360.0) * 24.0;

  const moonrise = new Date(sunTimes.sunrise.getTime() + offsetHours * 3600 * 1000);
  const moonset = new Date(sunTimes.sunset.getTime() + offsetHours * 3600 * 1000);

  return { moonrise, moonset };
}
