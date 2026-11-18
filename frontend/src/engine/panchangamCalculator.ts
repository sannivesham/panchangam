import {
  DailyPanchangamData,
  MonthlyPanchangamData,
  MonthlyDayItem,
  LocationItem,
  FestivalItem,
  AngaDetail,
  AngaWithTransition,
  MuhurthamInterval,
  GrahaPosition,
} from '../types/panchangam';
import {
  TELUGU_MONTHS,
  SAMVATSARAS,
  SAMVATSARAS_EN,
  TITHIS,
  NAKSHATRAS,
  YOGAS,
  YOGAS_EN,
  KARANAS,
  VARAS,
  RASHIS,
  RITUS,
  CITIES_DATABASE,
} from './constants';
import {
  dateToJD,
  jdToDate,
  getAyanamsa,
  getSunSiderealLongitude,
  getMoonSiderealLongitude,
  getLunarElongation,
  calculateSunTimes,
  calculateMoonTimes,
} from './ephemeris';

function formatTime(d: Date): string {
  // Format in IST (UTC + 5:30)
  const istOffset = 5.5 * 3600 * 1000;
  const istDate = new Date(d.getTime() + istOffset);

  let hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const seconds = istDate.getUTCSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
}

function formatTeluguTime(d: Date): string {
  const istOffset = 5.5 * 3600 * 1000;
  const istDate = new Date(d.getTime() + istOffset);

  let hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  let period = 'ఉదయం';
  if (hours >= 12 && hours < 16) period = 'మధ్యాహ్నం';
  else if (hours >= 16 && hours < 20) period = 'సాయంత్రం';
  else if (hours >= 20 || hours < 4) period = 'రాత్రి';

  hours = hours % 12;
  hours = hours ? hours : 12;
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${period} ${pad(hours)}:${pad(minutes)} ${ampm}`;
}

export function searchLocationsClient(query: string): LocationItem[] {
  if (!query || query.trim() === '') {
    return CITIES_DATABASE;
  }
  const q = query.toLowerCase().trim();
  return CITIES_DATABASE.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.name_telugu.includes(q) ||
      c.state.toLowerCase().includes(q)
  );
}

export function calculateDailyPanchangamClient(
  targetDateStr?: string,
  locParams: { cityId?: string; lat?: number; lon?: number; elevation?: number } = {}
): DailyPanchangamData {
  // 1. Resolve date in IST
  let dateObj: Date;
  if (targetDateStr) {
    const [y, m, d] = targetDateStr.split('-').map(Number);
    dateObj = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  } else {
    // Current IST date
    const now = new Date();
    const istOffset = 5.5 * 3600 * 1000;
    const nowIst = new Date(now.getTime() + istOffset);
    dateObj = new Date(Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate(), 0, 0, 0));
  }

  // 2. Resolve location
  let city = CITIES_DATABASE[0];
  if (locParams.cityId) {
    const found = CITIES_DATABASE.find((c) => c.id === locParams.cityId);
    if (found) city = found;
  }
  const lat = locParams.lat !== undefined ? locParams.lat : city.latitude;
  const lon = locParams.lon !== undefined ? locParams.lon : city.longitude;
  const elev = locParams.elevation !== undefined ? locParams.elevation : city.elevation_m;
  const locName = city.name;

  // 3. Sun and Moon times
  const sunTimes = calculateSunTimes(dateObj, lat, lon);
  const moonTimes = calculateMoonTimes(dateObj, lat, lon);

  const dtSunrise = sunTimes.sunrise;
  const dtSunset = sunTimes.sunset;
  const dtNextSunrise = sunTimes.nextSunrise;

  const dinamanaSec = (dtSunset.getTime() - dtSunrise.getTime()) / 1000;
  const ratrimanaSec = (dtNextSunrise.getTime() - dtSunset.getTime()) / 1000;

  // 4. Julian Day at Sunrise
  const jdSunrise = dateToJD(dtSunrise);
  const jdNextSunrise = dateToJD(dtNextSunrise);
  const ayanamsa = getAyanamsa(jdSunrise);

  const sunLonSr = getSunSiderealLongitude(jdSunrise);
  const moonLonSr = getMoonSiderealLongitude(jdSunrise);

  // 5. Five Angas at Sunrise
  // A. Vara
  const istSunrise = new Date(dtSunrise.getTime() + 5.5 * 3600 * 1000);
  const varaIdx = istSunrise.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const varaInfo = VARAS[varaIdx];

  // B. Tithi
  const elongSr = getLunarElongation(jdSunrise);
  const tithiIdxSr = Math.floor(elongSr / 12.0) + 1;
  const tithiInfo = TITHIS[tithiIdxSr - 1];

  // Find Tithi transition time (bisection)
  const targetTithiBoundary = (tithiIdxSr * 12.0) % 360.0;
  let tithiTransitionDate: Date | null = null;

  let lowJD = jdSunrise;
  let highJD = jdNextSunrise;
  const elongNextSr = getLunarElongation(jdNextSunrise);
  const tithiIdxNextSr = Math.floor(elongNextSr / 12.0) + 1;

  if (tithiIdxNextSr !== tithiIdxSr) {
    for (let i = 0; i < 20; i++) {
      const midJD = (lowJD + highJD) / 2.0;
      const midElong = getLunarElongation(midJD);
      const diff = (midElong - targetTithiBoundary + 360.0) % 360.0;
      if (diff < 180.0) {
        highJD = midJD;
      } else {
        lowJD = midJD;
      }
    }
    tithiTransitionDate = jdToDate(lowJD);
  }

  const tithiPrimary: AngaDetail = {
    index: tithiIdxSr,
    name_telugu: tithiInfo.full_te,
    name_english: tithiInfo.english,
    start_utc: dtSunrise.toISOString(),
    end_utc: tithiTransitionDate ? tithiTransitionDate.toISOString() : dtNextSunrise.toISOString(),
    start_time: formatTime(dtSunrise),
    end_time: tithiTransitionDate ? formatTime(tithiTransitionDate) : formatTime(dtNextSunrise),
    start_telugu: formatTeluguTime(dtSunrise),
    end_telugu: tithiTransitionDate ? formatTeluguTime(tithiTransitionDate) : formatTeluguTime(dtNextSunrise),
    start_date: dateObj.toISOString().split('T')[0],
    end_date: dateObj.toISOString().split('T')[0],
    paksha: tithiInfo.paksha,
    paksha_telugu: tithiInfo.paksha_te,
  };

  let tithiNext: AngaDetail | null = null;
  if (tithiTransitionDate) {
    const nextIdx = (tithiIdxSr % 30) + 1;
    const nextInfo = TITHIS[nextIdx - 1];
    tithiNext = {
      index: nextIdx,
      name_telugu: nextInfo.full_te,
      name_english: nextInfo.english,
      start_utc: tithiTransitionDate.toISOString(),
      end_utc: dtNextSunrise.toISOString(),
      start_time: formatTime(tithiTransitionDate),
      end_time: formatTime(dtNextSunrise),
      start_telugu: formatTeluguTime(tithiTransitionDate),
      end_telugu: formatTeluguTime(dtNextSunrise),
      start_date: dateObj.toISOString().split('T')[0],
      end_date: dateObj.toISOString().split('T')[0],
      paksha: nextInfo.paksha,
      paksha_telugu: nextInfo.paksha_te,
    };
  }

  const tithiAnga: AngaWithTransition = {
    primary: tithiPrimary,
    next: tithiNext,
    has_transition_today: tithiTransitionDate !== null,
  };

  // C. Nakshatra
  const nakIdxSr = Math.floor(moonLonSr / (360.0 / 27.0)) + 1;
  const nakInfo = NAKSHATRAS[nakIdxSr - 1];
  const nakBoundary = (nakIdxSr * (360.0 / 27.0)) % 360.0;
  let nakTransitionDate: Date | null = null;

  lowJD = jdSunrise;
  highJD = jdNextSunrise;
  const moonLonNextSr = getMoonSiderealLongitude(jdNextSunrise);
  const nakIdxNextSr = Math.floor(moonLonNextSr / (360.0 / 27.0)) + 1;

  if (nakIdxNextSr !== nakIdxSr) {
    for (let i = 0; i < 20; i++) {
      const midJD = (lowJD + highJD) / 2.0;
      const midMoon = getMoonSiderealLongitude(midJD);
      const diff = (midMoon - nakBoundary + 360.0) % 360.0;
      if (diff < 180.0) {
        highJD = midJD;
      } else {
        lowJD = midJD;
      }
    }
    nakTransitionDate = jdToDate(lowJD);
  }

  const nakPrimary: AngaDetail = {
    index: nakIdxSr,
    name_telugu: nakInfo.telugu,
    name_english: nakInfo.english,
    start_utc: dtSunrise.toISOString(),
    end_utc: nakTransitionDate ? nakTransitionDate.toISOString() : dtNextSunrise.toISOString(),
    start_time: formatTime(dtSunrise),
    end_time: nakTransitionDate ? formatTime(nakTransitionDate) : formatTime(dtNextSunrise),
    start_telugu: formatTeluguTime(dtSunrise),
    end_telugu: nakTransitionDate ? formatTeluguTime(nakTransitionDate) : formatTeluguTime(dtNextSunrise),
    start_date: dateObj.toISOString().split('T')[0],
    end_date: dateObj.toISOString().split('T')[0],
    ruler: nakInfo.ruler,
  };

  let nakNext: AngaDetail | null = null;
  if (nakTransitionDate) {
    const nextNakIdx = (nakIdxSr % 27) + 1;
    const nextNakInfo = NAKSHATRAS[nextNakIdx - 1];
    nakNext = {
      index: nextNakIdx,
      name_telugu: nextNakInfo.telugu,
      name_english: nextNakInfo.english,
      start_utc: nakTransitionDate.toISOString(),
      end_utc: dtNextSunrise.toISOString(),
      start_time: formatTime(nakTransitionDate),
      end_time: formatTime(dtNextSunrise),
      start_telugu: formatTeluguTime(nakTransitionDate),
      end_telugu: formatTeluguTime(dtNextSunrise),
      start_date: dateObj.toISOString().split('T')[0],
      end_date: dateObj.toISOString().split('T')[0],
      ruler: nextNakInfo.ruler,
    };
  }

  const nakshatraAnga: AngaWithTransition = {
    primary: nakPrimary,
    next: nakNext,
    has_transition_today: nakTransitionDate !== null,
  };

  // D. Yoga
  const yogaSumSr = (sunLonSr + moonLonSr) % 360.0;
  const yogaIdxSr = Math.floor(yogaSumSr / (360.0 / 27.0)) + 1;
  const yogaPrimary: AngaDetail = {
    index: yogaIdxSr,
    name_telugu: YOGAS[yogaIdxSr - 1],
    name_english: YOGAS_EN[yogaIdxSr - 1],
    start_utc: dtSunrise.toISOString(),
    end_utc: dtNextSunrise.toISOString(),
    start_time: formatTime(dtSunrise),
    end_time: formatTime(dtNextSunrise),
    start_telugu: formatTeluguTime(dtSunrise),
    end_telugu: formatTeluguTime(dtNextSunrise),
    start_date: dateObj.toISOString().split('T')[0],
    end_date: dateObj.toISOString().split('T')[0],
  };

  const yogaAnga: AngaWithTransition = {
    primary: yogaPrimary,
    next: null,
    has_transition_today: false,
  };

  // E. Karana
  const halfTithi = Math.floor(elongSr / 6.0) + 1;
  let karanaIdx = 1;
  if (halfTithi === 1) karanaIdx = 11; // Kimstughna
  else if (halfTithi >= 58) karanaIdx = halfTithi - 50; // Shakuni, Chatushpada, Naga
  else karanaIdx = ((halfTithi - 2) % 7) + 1;

  const karanaInfo = KARANAS[karanaIdx - 1];
  const karanaPrimary: AngaDetail = {
    index: karanaIdx,
    name_telugu: karanaInfo.telugu,
    name_english: karanaInfo.english,
    type: karanaInfo.type,
    half_tithi_index: halfTithi,
    start_utc: dtSunrise.toISOString(),
    end_utc: dtNextSunrise.toISOString(),
    start_time: formatTime(dtSunrise),
    end_time: formatTime(dtNextSunrise),
    start_telugu: formatTeluguTime(dtSunrise),
    end_telugu: formatTeluguTime(dtNextSunrise),
    start_date: dateObj.toISOString().split('T')[0],
    end_date: dateObj.toISOString().split('T')[0],
  };

  const karanaAnga: AngaWithTransition = {
    primary: karanaPrimary,
    next: null,
    has_transition_today: false,
  };

  // 6. Muhurthams & Daily Timings
  const oneEighthSec = dinamanaSec / 8.0;
  const diurnalMuhurthaSec = dinamanaSec / 15.0;
  const nocturnalMuhurthaSec = ratrimanaSec / 15.0;

  function makeInterval(
    nameTe: string,
    nameEn: string,
    start: Date,
    end: Date,
    auspicious: boolean,
    desc: string
  ): MuhurthamInterval {
    return {
      name_telugu: nameTe,
      name_english: nameEn,
      is_auspicious: auspicious,
      start_utc: start.toISOString(),
      end_utc: end.toISOString(),
      start_time: formatTime(start),
      end_time: formatTime(end),
      start_telugu: formatTeluguTime(start),
      end_telugu: formatTeluguTime(end),
      description: desc,
    };
  }

  // Rahu Kalam
  const rahuSegments = [8, 2, 7, 5, 6, 4, 3];
  const rahuSeg = rahuSegments[varaIdx];
  const rahuStart = new Date(dtSunrise.getTime() + (rahuSeg - 1) * oneEighthSec * 1000);
  const rahuEnd = new Date(dtSunrise.getTime() + rahuSeg * oneEighthSec * 1000);
  const rahuKalam = makeInterval("రాహుకాలం", "Rahu Kalam", rahuStart, rahuEnd, false, "ప్రయాణాలు, నూతన కార్యారంభాలకు నిషిద్ధం");

  // Yamagandam
  const yamaSegments = [5, 4, 3, 2, 1, 7, 6];
  const yamaSeg = yamaSegments[varaIdx];
  const yamaStart = new Date(dtSunrise.getTime() + (yamaSeg - 1) * oneEighthSec * 1000);
  const yamaEnd = new Date(dtSunrise.getTime() + yamaSeg * oneEighthSec * 1000);
  const yamagandam = makeInterval("యమగండం", "Yamagandam", yamaStart, yamaEnd, false, "మృత్యు భయ సూచకం, శుభకార్యాలు నిషిద్ధం");

  // Gulika Kalam (Inauspicious in South Indian tradition)
  const gulikaSegments = [7, 6, 5, 4, 3, 2, 1];
  const gulikaSeg = gulikaSegments[varaIdx];
  const gulikaStart = new Date(dtSunrise.getTime() + (gulikaSeg - 1) * oneEighthSec * 1000);
  const gulikaEnd = new Date(dtSunrise.getTime() + gulikaSeg * oneEighthSec * 1000);
  const gulikaKalam = makeInterval("గుళిక కాలం", "Gulika Kalam", gulikaStart, gulikaEnd, false, "అశుభ సమయం, శుభకార్యాలు నిషిద్ధం");

  // Abhijit Muhurtham (8th diurnal muhurtha, tained on Wednesday)
  const abhijitStart = new Date(dtSunrise.getTime() + 7 * diurnalMuhurthaSec * 1000);
  const abhijitEnd = new Date(dtSunrise.getTime() + 8 * diurnalMuhurthaSec * 1000);
  const isAbhijitAuspicious = varaIdx !== 3;
  const abhijit = makeInterval(
    "అభిజిత్ ముహూర్తం",
    "Abhijit Muhurtham",
    abhijitStart,
    abhijitEnd,
    isAbhijitAuspicious,
    isAbhijitAuspicious ? "మధ్యాహ్న కాల అత్యంత శుభ ముహూర్తం" : "బుధవారం నాడు అభిజిత్ ముహూర్తం దుర్ముహూర్తంతో కలిసి వర్జ్యమవుతుంది"
  );

  // Durmuhurtham
  const durmuhurthaSlots: Record<number, number[]> = {
    0: [14],
    1: [9, 12],
    2: [4, 11],
    3: [8],
    4: [6, 12],
    5: [4, 9],
    6: [1, 2], // Saturday 1st & 2nd right from sunrise
  };
  const dSlots = durmuhurthaSlots[varaIdx];
  const durmuhurthams: MuhurthamInterval[] = [];
  if (varaIdx === 6) {
    const dmStart = dtSunrise;
    const dmEnd = new Date(dtSunrise.getTime() + 2 * diurnalMuhurthaSec * 1000);
    durmuhurthams.push(makeInterval("దుర్ముహూర్తం", "Durmuhurtham (1st & 2nd Muhurtha)", dmStart, dmEnd, false, "సూర్యోదయం నుండి 2 ముహూర్తాలు అశుభం"));
  } else {
    for (const s of dSlots) {
      const dmStart = new Date(dtSunrise.getTime() + (s - 1) * diurnalMuhurthaSec * 1000);
      const dmEnd = new Date(dtSunrise.getTime() + s * diurnalMuhurthaSec * 1000);
      durmuhurthams.push(makeInterval("దుర్ముహూర్తం", `Durmuhurtham (${s}th Muhurtha)`, dmStart, dmEnd, false, "అశుభ సమయం"));
    }
  }

  // Brahma Muhurtham (14th nocturnal muhurtha, 96m to 48m before sunrise)
  const brahmaStart = new Date(dtSunrise.getTime() - 2 * nocturnalMuhurthaSec * 1000);
  const brahmaEnd = new Date(dtSunrise.getTime() - 1 * nocturnalMuhurthaSec * 1000);
  const brahmaMuhurtham = makeInterval("బ్రహ్మ ముహూర్తం", "Brahma Muhurtham", brahmaStart, brahmaEnd, true, "ధ్యాన, జప, సాధనలకు శ్రేష్ఠమైన సమయం");

  // Varjyam & Amrita Kalam (Muhurtha Chintamani values)
  const varjyamList: MuhurthamInterval[] = [];
  const amritaList: MuhurthamInterval[] = [];

  const nakDurationSec = nakTransitionDate
    ? (nakTransitionDate.getTime() - dtSunrise.getTime()) / 1000 + 12 * 3600
    : 24 * 3600;
  const ghatiSec = nakDurationSec / 60.0;

  // Varjyam (4 ghatis from varjyam_start_ghati)
  const vStartGhati = nakInfo.varjyam_start_ghati;
  const vStart = new Date(dtSunrise.getTime() + (vStartGhati - 1) * ghatiSec * 1000);
  const vEnd = new Date(vStart.getTime() + 4 * ghatiSec * 1000);

  if (vEnd > dtSunrise && vStart < dtNextSunrise) {
    varjyamList.push(
      makeInterval(
        `వర్జ్యం (${nakInfo.telugu})`,
        `Varjyam (${nakInfo.english})`,
        vStart,
        vEnd,
        false,
        `${nakInfo.telugu} నక్షత్ర త్యాజ్య కాలం (4 ఘడియలు)`
      )
    );
  }

  // Amrita Kalam (4 ghatis from amrita_start_ghati)
  const aStartGhati = nakInfo.amrita_start_ghati;
  const aStart = new Date(dtSunrise.getTime() + (aStartGhati - 1) * ghatiSec * 1000);
  const aEnd = new Date(aStart.getTime() + 4 * ghatiSec * 1000);

  if (aEnd > dtSunrise && aStart < dtNextSunrise) {
    amritaList.push(
      makeInterval(
        `అమృత కాలం (${nakInfo.telugu})`,
        `Amrita Kalam (${nakInfo.english})`,
        aStart,
        aEnd,
        true,
        `${nakInfo.telugu} నక్షత్ర అమృత ముహూర్తం (${aStartGhati}వ ఘడియ నుండి 4 ఘడియలు)`
      )
    );
  }

  // 7. Telugu Lunisolar Calendar: Samvatsaram, Masam, Paksham, Ayana, Ritu
  const sunRashiIdx = Math.floor(sunLonSr / 30.0) + 1;
  const moonRashiIdx = Math.floor(moonLonSr / 30.0) + 1;

  // Amanta Telugu Month based on Sun's Rashi at Amavasya
  let monthIdx = sunRashiIdx;
  const teluguMonth = TELUGU_MONTHS[monthIdx - 1];

  // 60-Year Samvatsara:
  // Base: 2024-2025 CE = Krodhi (index 38)
  const gregYear = dateObj.getUTCFullYear();
  const gregMonth = dateObj.getUTCMonth() + 1;
  let calYear = gregYear;
  // If Jan to March before Ugadi: belongs to previous year's Samvatsaram
  if (gregMonth in [1, 2, 3]) {
    calYear -= 1;
  }
  const samvatsaraIdx = ((calYear - 2024 + 38 - 1) % 60 + 60) % 60 + 1;

  const ayanaIsUttarayana = sunLonSr >= 270.0 || sunLonSr < 90.0;
  const ayanaInfo = {
    name_telugu: ayanaIsUttarayana ? "ఉత్తరాయణం" : "దక్షిణాయణం",
    name_english: ayanaIsUttarayana ? "Uttarayanam" : "Dakshinayanam",
    description: ayanaIsUttarayana ? "సూర్యుని ఉత్తర దిశ సంచారం" : "సూర్యుని దక్షిణ దిశ సంచారం",
  };

  const rituIdx = Math.floor((monthIdx - 1) / 2) + 1;
  const rituInfo = RITUS[rituIdx - 1];

  // 8. Navagrahas
  const grahas: GrahaPosition[] = [
    {
      name_english: "Sun",
      name_telugu: "సూర్యుడు",
      longitude: sunLonSr,
      speed: 1.0,
      is_retrograde: false,
      rashi: { index: sunRashiIdx, telugu: RASHIS[sunRashiIdx - 1].telugu, english: RASHIS[sunRashiIdx - 1].english, degrees: sunLonSr % 30.0 },
      nakshatra: { index: Math.floor(sunLonSr / (360.0 / 27.0)) + 1, telugu: NAKSHATRAS[Math.floor(sunLonSr / (360.0 / 27.0))].telugu, english: NAKSHATRAS[Math.floor(sunLonSr / (360.0 / 27.0))].english, pada: Math.floor((sunLonSr % (360.0 / 27.0)) / (360.0 / 108.0)) + 1 },
    },
    {
      name_english: "Moon",
      name_telugu: "చంద్రుడు",
      longitude: moonLonSr,
      speed: 12.5,
      is_retrograde: false,
      rashi: { index: moonRashiIdx, telugu: RASHIS[moonRashiIdx - 1].telugu, english: RASHIS[moonRashiIdx - 1].english, degrees: moonLonSr % 30.0 },
      nakshatra: { index: nakIdxSr, telugu: nakInfo.telugu, english: nakInfo.english, pada: Math.floor((moonLonSr % (360.0 / 27.0)) / (360.0 / 108.0)) + 1 },
    },
  ];

  // 9. Festivals & Special Vratams
  const observedFestivals: FestivalItem[] = [];

  // Ugadi (Chaitra Shukla Pratipada)
  if (monthIdx === 1 && tithiIdxSr === 1) {
    observedFestivals.push({
      id: "ugadi",
      name_telugu: "ఉగాది (తెలుగు నూతన సంవత్సరాది)",
      name_english: "Ugadi (Telugu New Year)",
      description_telugu: "చైత్ర శుద్ధ పాడ్యమి నాడు సృష్టి ఆరంభమైన పవిత్ర దినం. షడ్రుచుల ఉగాది పచ్చడి సేవనం, పంచాంగ శ్రవణం ముఖ్యం.",
      description_english: "The beginning of the Telugu New Year and the creation of the cosmos.",
      region: "ALL",
    });
  }

  // Sri Rama Navami (Chaitra Shukla Navami)
  if (monthIdx === 1 && tithiIdxSr === 9) {
    observedFestivals.push({
      id: "sri_rama_navami",
      name_telugu: "శ్రీరామనవమి (సీతారాముల కళ్యాణం)",
      name_english: "Sri Rama Navami",
      description_telugu: "శ్రీరాముని జననం మరియు సీతారాముల దివ్య కళ్యాణ మహోత్సవం.",
      description_english: "Celebration of Lord Rama's birth at Madhyahna and the divine Sita Rama Kalyanam.",
      region: "ALL",
    });
  }

  // Vinayaka Chavithi (Bhadrapada Shukla Chaturthi)
  if (monthIdx === 6 && tithiIdxSr === 4) {
    observedFestivals.push({
      id: "vinayaka_chavithi",
      name_telugu: "వినాయక చవితి (గణేశ చతుర్థి)",
      name_english: "Vinayaka Chavithi (Ganesh Chaturthi)",
      description_telugu: "భాద్రపద శుద్ధ చవితి మధ్యాహ్న కాలంలో సిద్ధి వినాయక పూజ, వరసిద్ధి వినాయక వ్రతం.",
      description_english: "Grand festival of Lord Ganesha worshipped during Madhyahna time.",
      region: "ALL",
    });
  }

  // Deepavali (Ashvayuja Amavasya)
  if (monthIdx === 7 && tithiIdxSr === 30) {
    observedFestivals.push({
      id: "deepavali_lakshmi_puja",
      name_telugu: "దీపావళి (శ్రీ మహాలక్ష్మి పూజ)",
      name_english: "Deepavali (Diwali & Lakshmi Puja)",
      description_telugu: "ఆశ్వయుజ బహుళ అమావాస్య ప్రదోష కాలంలో దీపారాధన మరియు లక్ష్మీ కుబేర పూజ.",
      description_english: "Festival of lights observed during Pradosha time with Lakshmi and Kubera puja.",
      region: "ALL",
    });
  }

  // Makara Sankranti (Sun ingress into Makara)
  if (sunRashiIdx === 10 && (sunLonSr % 30.0) < 1.0) {
    observedFestivals.push({
      id: "makara_sankranti",
      name_telugu: "మకర సంక్రాంతి (పెద్ద పండుగ)",
      name_english: "Makara Sankranti (Pedda Panduga)",
      description_telugu: "సూర్యుడు మకర రాశిలో ప్రవేశించి ఉత్తరాయణ పుణ్యకాలం ప్రారంభమయ్యే మహాపర్వదినం.",
      description_english: "The Sun's ingress into Capricorn initiating the Uttarayana holy period.",
      region: "ALL",
    });
  }

  // Ekadashi Vratam
  if (tithiIdxSr === 11 || tithiIdxSr === 26) {
    observedFestivals.push({
      id: `ekadashi_${tithiIdxSr}`,
      name_telugu: `${tithiIdxSr === 11 ? 'శుక్ల' : 'కృష్ణ'} ఏకాదశి వ్రతం`,
      name_english: `${tithiIdxSr === 11 ? 'Shukla' : 'Krishna'} Ekadashi`,
      description_telugu: "హరివాసర ఉపవాస వ్రతం. విష్ణు ప్రీతికరమైన పుణ్య దినం.",
      description_english: "Sacred day of fasting and meditation dedicated to Lord Vishnu.",
      region: "ALL",
    });
  }

  // Purnima Vratam
  if (tithiIdxSr === 15) {
    observedFestivals.push({
      id: "purnima_vratam",
      name_telugu: "పూర్ణిమ (శ్రీ సత్యనారాయణ స్వామి వ్రతం)",
      name_english: "Purnima (Satyanarayana Swamy Vratam)",
      description_telugu: "పౌర్ణమి పుణ్యస్నానాలు, శ్రీ సత్యనారాయణ స్వామి వ్రతం ఆచరించు శుభదినం.",
      description_english: "Full Moon auspicious day for Sri Satyanarayana Swamy Vrata and charity.",
      region: "ALL",
    });
  }

  // Amavasya
  if (tithiIdxSr === 30 && !observedFestivals.some((f) => f.id.includes("deepavali"))) {
    observedFestivals.push({
      id: "amavasya_vratam",
      name_telugu: "అమావాస్య (పితృ తర్పణం / దానాలు)",
      name_english: "Amavasya (Pitru Tarpana)",
      description_telugu: "పితృదేవతలకు తిలతర్పణాలు సమర్పించు పుణ్యతిథి.",
      description_english: "New Moon sacred day for ancestral prayers and charity.",
      region: "ALL",
    });
  }

  // Summary
  const samvatsaraNameTe = SAMVATSARAS[samvatsaraIdx - 1];
  const samvatsaraNameEn = SAMVATSARAS_EN[samvatsaraIdx - 1];

  const summaryTelugu = `శ్రీ ${samvatsaraNameTe} నామ సంవత్సరం, ${teluguMonth.telugu}, ${tithiInfo.paksha_te}, ${tithiInfo.telugu}, ${varaInfo.telugu}, ${nakInfo.telugu} నక్షత్రం`;
  const summaryEnglish = `Sri ${samvatsaraNameEn} Samvatsaram, ${teluguMonth.english}, ${tithiInfo.paksha} Paksha, ${tithiInfo.english}, ${varaInfo.english}, ${nakInfo.english} Nakshatram`;

  return {
    metadata: {
      date: dateObj.toISOString().split('T')[0],
      location_name: locName,
      latitude: lat,
      longitude: lon,
      elevation_meters: elev,
      timezone: "Asia/Kolkata",
      ayanamsa: {
        name: "Lahiri / Chitrapaksha",
        degrees: ayanamsa,
      },
      calculation_engine: "Drik Ganita In-Browser Astronomical Engine (Jean Meeus + Lahiri Ayanamsa)",
    },
    summary: {
      telugu: summaryTelugu,
      english: summaryEnglish,
    },
    telugu_calendar: {
      samvatsaram: {
        index: samvatsaraIdx,
        name_telugu: samvatsaraNameTe,
        name_english: samvatsaraNameEn,
      },
      masam: {
        index: monthIdx,
        name_telugu: teluguMonth.telugu,
        name_english: teluguMonth.english,
        is_adhika: false,
        is_kshaya: false,
      },
      paksham: {
        telugu: tithiInfo.paksha_te,
        english: tithiInfo.paksha,
      },
      ayanam: ayanaInfo,
      rituvu: rituInfo,
    },
    sun_moon: {
      sunrise: formatTime(dtSunrise),
      sunset: formatTime(dtSunset),
      sunrise_telugu: formatTeluguTime(dtSunrise),
      sunset_telugu: formatTeluguTime(dtSunset),
      moonrise: formatTime(moonTimes.moonrise),
      moonset: formatTime(moonTimes.moonset),
      moonrise_telugu: formatTeluguTime(moonTimes.moonrise),
      moonset_telugu: formatTeluguTime(moonTimes.moonset),
      sun_rashi: {
        index: sunRashiIdx,
        telugu: RASHIS[sunRashiIdx - 1].telugu,
        english: RASHIS[sunRashiIdx - 1].english,
        degrees: sunLonSr % 30.0,
      },
      moon_rashi: {
        index: moonRashiIdx,
        telugu: RASHIS[moonRashiIdx - 1].telugu,
        english: RASHIS[moonRashiIdx - 1].english,
        degrees: moonLonSr % 30.0,
      },
      dinamana_seconds: dinamanaSec,
      ratrimana_seconds: ratrimanaSec,
    },
    panchangam: {
      vara: varaInfo,
      tithi: tithiAnga,
      nakshatra: nakshatraAnga,
      yoga: yogaAnga,
      karana: karanaAnga,
    },
    muhurtham: {
      rahu_kalam: rahuKalam,
      yamagandam: yamagandam,
      gulika_kalam: gulikaKalam,
      abhijit_muhurtham: abhijit,
      durmuhurthams: durmuhurthams,
      brahma_muhurtham: brahmaMuhurtham,
      varjyam: varjyamList,
      amrita_kalam: amritaList,
    },
    grahas: grahas,
    festivals: observedFestivals,
  };
}

export function calculateMonthlyPanchangamClient(
  year: number,
  month: number,
  locParams: { cityId?: string; lat?: number; lon?: number; elevation?: number } = {}
): MonthlyPanchangamData {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days: MonthlyDayItem[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${year}-${pad(month)}-${pad(d)}`;
    const daily = calculateDailyPanchangamClient(dateStr, locParams);

    days.push({
      date: dateStr,
      day: d,
      weekday: daily.panchangam.vara.name_telugu,
      weekday_english: daily.panchangam.vara.name_english,
      telugu_month: daily.telugu_calendar.masam.name_telugu,
      paksha: daily.telugu_calendar.paksham.telugu,
      tithi: daily.panchangam.tithi.primary.name_telugu,
      tithi_end: daily.panchangam.tithi.primary.end_telugu,
      nakshatra: daily.panchangam.nakshatra.primary.name_telugu,
      nakshatra_end: daily.panchangam.nakshatra.primary.end_telugu,
      sunrise: daily.sun_moon.sunrise_telugu,
      sunset: daily.sun_moon.sunset_telugu,
      is_purnima: daily.panchangam.tithi.primary.index === 15,
      is_amavasya: daily.panchangam.tithi.primary.index === 30,
      is_ekadashi: daily.panchangam.tithi.primary.index === 11 || daily.panchangam.tithi.primary.index === 26,
      festivals: daily.festivals || [],
    });
  }

  return {
    year,
    month,
    location: locParams.cityId || "Hyderabad",
    total_days: daysInMonth,
    days,
  };
}

export function calculateYearlyOverviewClient(
  year: number,
  locParams: { cityId?: string; lat?: number; lon?: number; elevation?: number } = {}
): any {
  // 12 months overview
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const mData = calculateMonthlyPanchangamClient(year, m, locParams);
    months.push({
      month: m,
      month_name_telugu: TELUGU_MONTHS[m - 1].telugu,
      month_name_english: TELUGU_MONTHS[m - 1].english,
      days_count: mData.total_days,
      start_weekday: mData.days[0].weekday,
      festivals_count: mData.days.reduce((acc, d) => acc + d.festivals.length, 0),
    });
  }

  const ugadiData = calculateDailyPanchangamClient(`${year}-04-01`, locParams);

  return {
    year,
    samvatsaram: ugadiData.telugu_calendar.samvatsaram,
    months,
  };
}

export function fetchFestivalsClient(
  year?: number,
  month?: number,
  region: string = 'ALL'
): Array<{ date: string; telugu_date: string; telugu_month: string; tithi: string; festival: FestivalItem }> {
  const y = year || new Date().getFullYear();
  const monthsToScan = month ? [month] : Array.from({ length: 12 }, (_, i) => i + 1);
  const results: Array<{ date: string; telugu_date: string; telugu_month: string; tithi: string; festival: FestivalItem }> = [];

  for (const m of monthsToScan) {
    const mData = calculateMonthlyPanchangamClient(y, m);
    for (const d of mData.days) {
      for (const f of d.festivals) {
        if (region === 'ALL' || f.region === 'ALL' || f.region === region) {
          results.push({
            date: d.date,
            telugu_date: `${d.telugu_month}, ${d.paksha}, ${d.tithi}`,
            telugu_month: d.telugu_month,
            tithi: d.tithi,
            festival: f,
          });
        }
      }
    }
  }

  return results;
}
