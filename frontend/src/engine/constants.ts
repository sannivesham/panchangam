import { LocationItem, FestivalItem } from '../types/panchangam';

export const TELUGU_MONTHS = [
  { index: 1, telugu: "చైత్రము", english: "Chaitramu", rashi_ingress: 1 },
  { index: 2, telugu: "వైశాఖము", english: "Vaishakhamu", rashi_ingress: 2 },
  { index: 3, telugu: "జ్యేష్ఠము", english: "Jyeshthamu", rashi_ingress: 3 },
  { index: 4, telugu: "ఆషాఢము", english: "Ashadhamu", rashi_ingress: 4 },
  { index: 5, telugu: "శ్రావణము", english: "Shravanamu", rashi_ingress: 5 },
  { index: 6, telugu: "భాద్రపదము", english: "Bhadrapadamu", rashi_ingress: 6 },
  { index: 7, telugu: "ఆశ్వయుజము", english: "Ashvayujamu", rashi_ingress: 7 },
  { index: 8, telugu: "కార్తీకము", english: "Karthikamu", rashi_ingress: 8 },
  { index: 9, telugu: "మార్గశిరము", english: "Margashiramu", rashi_ingress: 9 },
  { index: 10, telugu: "పుష్యము", english: "Pushyamu", rashi_ingress: 10 },
  { index: 11, telugu: "మాఘము", english: "Maghamu", rashi_ingress: 11 },
  { index: 12, telugu: "ఫాల్గుణము", english: "Phalgunamu", rashi_ingress: 12 },
];

export const SAMVATSARAS = [
  "ప్రభవ", "విభవ", "శుక్ల", "ప్రమోదూత", "ప్రజోత్పత్తి", "ఆంగీరస", "శ్రీముఖ", "భావ", "యువ", "ధాత",
  "ఈశ్వర", "బహుధాన్య", "ప్రమాది", "విక్రమ", "వృష", "చిత్రభాను", "స్వభాను", "తారణ", "పార్థివ", "వ్యయ",
  "సర్వజిత్తు", "సర్వధారి", "విరోధి", "వికృతి", "ఖర", "నందన", "విజయ", "జయ", "మన్మథ", "దుర్ముఖి",
  "హేవళంబి", "విళంబి", "వికారి", "శార్వరి", "ప్లవ", "శుభకృతు", "శోభకృతు", "క్రోధి", "విశ్వావసు", "పరాభవ",
  "ప్లవంగ", "కీలక", "సౌమ్య", "సాధారణ", "విరోధికృతు", "పరీధావి", "ప్రమాదీచ", "ఆనంద", "రాక్షస", "నల",
  "పింగళ", "కాళయుక్తి", "సిద్ధార్థి", "రౌద్రి", "దుర్మతి", "దుందుభి", "రుధిరోద్గారి", "రక్తాక్షి", "క్రోధన", "క్షయ"
];

export const SAMVATSARAS_EN = [
  "Prabhava", "Vibhava", "Shukla", "Pramodoota", "Prajotpatti", "Aangirasa", "Srimukha", "Bhava", "Yuva", "Dhata",
  "Eeshwara", "Bahudhanya", "Pramadhi", "Vikrama", "Vrusha", "Chitrabhanu", "Swabhanu", "Tarana", "Parthiva", "Vyaya",
  "Sarvajittu", "Sarvadhari", "Virodhi", "Vikruti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukhi",
  "Hevalambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrutu", "Shobhakrutu", "Krodhi", "Vishvavasu", "Parabhava",
  "Plavanga", "Keelaka", "Saumya", "Sadharana", "Virodhikrutu", "Paridhavi", "Pramadicha", "Ananda", "Rakshasa", "Nala",
  "Pingala", "Kalayukti", "Siddharthi", "Raudri", "Durmati", "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Kshaya"
];

export const TITHIS = [
  { index: 1, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "పాడ్యమి", full_te: "శుక్ల పాడ్యమి", english: "Shukla Pratipada" },
  { index: 2, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "విదియ", full_te: "శుక్ల విదియ", english: "Shukla Dwitiya" },
  { index: 3, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "తదియ", full_te: "శుక్ల తదియ", english: "Shukla Tritiya" },
  { index: 4, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "చవితి", full_te: "శుక్ల చవితి", english: "Shukla Chaturthi" },
  { index: 5, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "పంచమి", full_te: "శుక్ల పంచమి", english: "Shukla Panchami" },
  { index: 6, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "షష్ఠి", full_te: "శుక్ల షష్ఠి", english: "Shukla Shashthi" },
  { index: 7, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "సప్తమి", full_te: "శుక్ల సప్తమి", english: "Shukla Saptami" },
  { index: 8, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "అష్టమి", full_te: "శుక్ల అష్టమి", english: "Shukla Ashtami" },
  { index: 9, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "నవమి", full_te: "శుక్ల నవమి", english: "Shukla Navami" },
  { index: 10, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "దశమి", full_te: "శుక్ల దశమి", english: "Shukla Dashami" },
  { index: 11, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "ఏకాదశి", full_te: "శుక్ల ఏకాదశి", english: "Shukla Ekadashi" },
  { index: 12, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "ద్వాదశి", full_te: "శుక్ల ద్వాదశి", english: "Shukla Dwadashi" },
  { index: 13, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "త్రయోదశి", full_te: "శుక్ల త్రయోదశి", english: "Shukla Trayodashi" },
  { index: 14, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "చతుర్దశి", full_te: "శుక్ల చతుర్దశి", english: "Shukla Chaturdashi" },
  { index: 15, paksha: "Shukla", paksha_te: "శుక్ల పక్షం", telugu: "పూర్ణిమ", full_te: "పూర్ణిమ", english: "Purnima" },
  { index: 16, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "పాడ్యమి", full_te: "బహుళ పాడ్యమి", english: "Krishna Pratipada" },
  { index: 17, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "విదియ", full_te: "బహుళ విదియ", english: "Krishna Dwitiya" },
  { index: 18, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "తదియ", full_te: "బహుళ తదియ", english: "Krishna Tritiya" },
  { index: 19, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "చవితి", full_te: "బహుళ చవితి", english: "Krishna Chaturthi" },
  { index: 20, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "పంచమి", full_te: "బహుళ పంచమి", english: "Krishna Panchami" },
  { index: 21, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "షష్ఠి", full_te: "బహుళ షష్ఠి", english: "Krishna Shashthi" },
  { index: 22, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "సప్తమి", full_te: "బహుళ సప్తమి", english: "Krishna Saptami" },
  { index: 23, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "అష్టమి", full_te: "బహుళ అష్టమి", english: "Krishna Ashtami" },
  { index: 24, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "నవమి", full_te: "బహుళ నవమి", english: "Krishna Navami" },
  { index: 25, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "దశమి", full_te: "బహుళ దశమి", english: "Krishna Dashami" },
  { index: 26, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "ఏకాదశి", full_te: "బహుళ ఏకాదశి", english: "Krishna Ekadashi" },
  { index: 27, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "ద్వాదశి", full_te: "బహుళ ద్వాదశి", english: "Krishna Dwadashi" },
  { index: 28, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "త్రయోదశి", full_te: "బహుళ త్రయోదశి", english: "Krishna Trayodashi" },
  { index: 29, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "చతుర్దశి", full_te: "బహుళ చతుర్దశి", english: "Krishna Chaturdashi" },
  { index: 30, paksha: "Krishna", paksha_te: "కృష్ణ (బహుళ) పక్షం", telugu: "అమావాస్య", full_te: "అమావాస్య", english: "Amavasya" },
];

export const NAKSHATRAS = [
  { index: 1, telugu: "అశ్విని", english: "Ashwini", ruler: "Ketu", varjyam_start_ghati: 50, amrita_start_ghati: 54 },
  { index: 2, telugu: "భరణి", english: "Bharani", ruler: "Venus", varjyam_start_ghati: 24, amrita_start_ghati: 52 },
  { index: 3, telugu: "కృత్తిక", english: "Krittika", ruler: "Sun", varjyam_start_ghati: 30, amrita_start_ghati: 38 },
  { index: 4, telugu: "రోహిణి", english: "Rohini", ruler: "Moon", varjyam_start_ghati: 40, amrita_start_ghati: 35 },
  { index: 5, telugu: "మృగశిర", english: "Mrigashira", ruler: "Mars", varjyam_start_ghati: 14, amrita_start_ghati: 54 },
  { index: 6, telugu: "ఆరుద్ర", english: "Ardra", ruler: "Rahu", varjyam_start_ghati: 21, amrita_start_ghati: 44 },
  { index: 7, telugu: "పునర్వసు", english: "Punarvasu", ruler: "Jupiter", varjyam_start_ghati: 30, amrita_start_ghati: 56 },
  { index: 8, telugu: "పుష్యమి", english: "Pushyami", ruler: "Saturn", varjyam_start_ghati: 20, amrita_start_ghati: 54 },
  { index: 9, telugu: "ఆశ్లేష", english: "Ashlesha", ruler: "Mercury", varjyam_start_ghati: 32, amrita_start_ghati: 44 },
  { index: 10, telugu: "మఖ", english: "Magha", ruler: "Ketu", varjyam_start_ghati: 30, amrita_start_ghati: 40 },
  { index: 11, telugu: "పుబ్బ (పూర్వ ఫల్గుణి)", english: "Purva Phalguni", ruler: "Venus", varjyam_start_ghati: 20, amrita_start_ghati: 45 },
  { index: 12, telugu: "ఉత్తర (ఉత్తర ఫల్గుణి)", english: "Uttara Phalguni", ruler: "Sun", varjyam_start_ghati: 18, amrita_start_ghati: 44 },
  { index: 13, telugu: "హస్త", english: "Hasta", ruler: "Moon", varjyam_start_ghati: 22, amrita_start_ghati: 38 },
  { index: 14, telugu: "చిత్త", english: "Chitra", ruler: "Mars", varjyam_start_ghati: 20, amrita_start_ghati: 38 },
  { index: 15, telugu: "స్వాతి", english: "Swati", ruler: "Rahu", varjyam_start_ghati: 14, amrita_start_ghati: 34 },
  { index: 16, telugu: "విశాఖ", english: "Vishakha", ruler: "Jupiter", varjyam_start_ghati: 14, amrita_start_ghati: 50 },
  { index: 17, telugu: "అనూరాధ", english: "Anuradha", ruler: "Saturn", varjyam_start_ghati: 10, amrita_start_ghati: 42 },
  { index: 18, telugu: "జ్యేష్ఠ", english: "Jyeshtha", ruler: "Mercury", varjyam_start_ghati: 14, amrita_start_ghati: 50 },
  { index: 19, telugu: "మూల", english: "Mula", ruler: "Ketu", varjyam_start_ghati: 56, amrita_start_ghati: 32 },
  { index: 20, telugu: "పూర్వాషాఢ", english: "Purvashadha", ruler: "Venus", varjyam_start_ghati: 24, amrita_start_ghati: 32 },
  { index: 21, telugu: "ఉత్తరాషాఢ", english: "Uttarashadha", ruler: "Sun", varjyam_start_ghati: 20, amrita_start_ghati: 35 },
  { index: 22, telugu: "శ్రవణం", english: "Shravana", ruler: "Moon", varjyam_start_ghati: 10, amrita_start_ghati: 45 },
  { index: 23, telugu: "ధనిష్ఠ", english: "Dhanishta", ruler: "Mars", varjyam_start_ghati: 10, amrita_start_ghati: 42 },
  { index: 24, telugu: "శతభిషం", english: "Shatabhisha", ruler: "Rahu", varjyam_start_ghati: 18, amrita_start_ghati: 30 },
  { index: 25, telugu: "పూర్వాభాద్ర", english: "Purvabhadra", ruler: "Jupiter", varjyam_start_ghati: 16, amrita_start_ghati: 20 },
  { index: 26, telugu: "ఉత్తరాభాద్ర", english: "Uttarabhadra", ruler: "Saturn", varjyam_start_ghati: 24, amrita_start_ghati: 20 },
  { index: 27, telugu: "రేవతి", english: "Revati", ruler: "Mercury", varjyam_start_ghati: 30, amrita_start_ghati: 40 },
];

export const YOGAS = [
  "విష్కంభం", "ప్రీతి", "ఆయుష్మాన్", "సౌభాగ్య", "శోభన", "అతిగండ", "సుకర్మ", "ధృతి", "శూల", "గండ",
  "వృద్ధి", "ధ్రువ", "వ్యాఘాత", "హర్షణ", "వజ్ర", "సిద్ధి", "వ్యతీపాత", "వరీయాన్", "పరిఘ", "శివ",
  "సిద్ధ", "సాధ్య", "శుభ", "శుక్ల", "బ్రహ్మ", "ఐంద్ర", "వైధృతి"
];

export const YOGAS_EN = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

export const KARANAS = [
  { index: 1, type: "repeating", telugu: "బవ", english: "Bava" },
  { index: 2, type: "repeating", telugu: "బాలవ", english: "Balava" },
  { index: 3, type: "repeating", telugu: "కౌలవ", english: "Kaulava" },
  { index: 4, type: "repeating", telugu: "తైతిల", english: "Taitila" },
  { index: 5, type: "repeating", telugu: "గరజ", english: "Gara" },
  { index: 6, type: "repeating", telugu: "వణిజ", english: "Vanija" },
  { index: 7, type: "repeating", telugu: "విష్టి (భద్ర)", english: "Vishti (Bhadra)" },
  { index: 8, type: "fixed", telugu: "శకుని", english: "Shakuni" },
  { index: 9, type: "fixed", telugu: "చతుష్పాత్", english: "Chatushpada" },
  { index: 10, type: "fixed", telugu: "నాగవం", english: "Naga" },
  { index: 11, type: "fixed", telugu: "కింస్తుఘ్నం", english: "Kimstughna" },
];

export const VARAS = [
  { index: 0, telugu: "ఆదివారం", english: "Sunday", name_telugu: "ఆదివారం", name_english: "Sunday", ruler: "Sun" },
  { index: 1, telugu: "సోమవారం", english: "Monday", name_telugu: "సోమవారం", name_english: "Monday", ruler: "Moon" },
  { index: 2, telugu: "మంగళవారం", english: "Tuesday", name_telugu: "మంగళవారం", name_english: "Tuesday", ruler: "Mars" },
  { index: 3, telugu: "బుధవారం", english: "Wednesday", name_telugu: "బుధవారం", name_english: "Wednesday", ruler: "Mercury" },
  { index: 4, telugu: "గురువారం", english: "Thursday", name_telugu: "గురువారం", name_english: "Thursday", ruler: "Jupiter" },
  { index: 5, telugu: "శుక్రవారం", english: "Friday", name_telugu: "శుక్రవారం", name_english: "Friday", ruler: "Venus" },
  { index: 6, telugu: "శనివారం", english: "Saturday", name_telugu: "శనివారం", name_english: "Saturday", ruler: "Saturn" },
];

export const RASHIS = [
  { index: 1, telugu: "మేషం", english: "Aries" },
  { index: 2, telugu: "వృషభం", english: "Taurus" },
  { index: 3, telugu: "మిథునం", english: "Gemini" },
  { index: 4, telugu: "కర్కాటకం", english: "Cancer" },
  { index: 5, telugu: "సింహం", english: "Leo" },
  { index: 6, telugu: "కన్య", english: "Virgo" },
  { index: 7, telugu: "తుల", english: "Libra" },
  { index: 8, telugu: "వృశ్చికం", english: "Scorpio" },
  { index: 9, telugu: "ధనుస్సు", english: "Sagittarius" },
  { index: 10, telugu: "మకరం", english: "Capricorn" },
  { index: 11, telugu: "కుంభం", english: "Aquarius" },
  { index: 12, telugu: "మీనం", english: "Pisces" },
];

export const RITUS = [
  { index: 1, telugu: "వసంత ఋతువు", english: "Vasanta Ritu", season: "Spring (చైత్రం - వైశాఖం)" },
  { index: 2, telugu: "గ్రీష్మ ఋతువు", english: "Greeshma Ritu", season: "Summer (జ్యేష్ఠం - ఆషాఢం)" },
  { index: 3, telugu: "వర్ష ఋతువు", english: "Varsha Ritu", season: "Monsoon (శ్రావణం - భాద్రపదం)" },
  { index: 4, telugu: "శరద్ ఋతువు", english: "Sharad Ritu", season: "Autumn (ఆశ్వయుజం - కార్తీకం)" },
  { index: 5, telugu: "హేమంత ఋతువు", english: "Hemanta Ritu", season: "Early Winter (మార్గశిరం - పుష్యం)" },
  { index: 6, telugu: "శిశిర ఋతువు", english: "Shishira Ritu", season: "Late Winter (మాఘం - ఫాల్గుణం)" },
];

export const CITIES_DATABASE: LocationItem[] = [
  { id: "hyderabad", name: "Hyderabad", name_telugu: "హైదరాబాద్", state: "Telangana", state_telugu: "తెలంగాణ", country: "India", latitude: 17.385044, longitude: 78.486671, elevation_m: 505.0, timezone: "Asia/Kolkata", is_default: true },
  { id: "visakhapatnam", name: "Visakhapatnam", name_telugu: "విశాఖపట్నం", state: "Andhra Pradesh", state_telugu: "ఆంధ్రప్రదేశ్", country: "India", latitude: 17.6868, longitude: 83.2185, elevation_m: 45.0, timezone: "Asia/Kolkata" },
  { id: "vijayawada", name: "Vijayawada", name_telugu: "విజయవాడ", state: "Andhra Pradesh", state_telugu: "ఆంధ్రప్రదేశ్", country: "India", latitude: 16.5062, longitude: 80.6480, elevation_m: 23.0, timezone: "Asia/Kolkata" },
  { id: "tirupati", name: "Tirupati", name_telugu: "తిరుపతి", state: "Andhra Pradesh", state_telugu: "ఆంధ్రప్రదేశ్", country: "India", latitude: 13.6288, longitude: 79.4192, elevation_m: 162.0, timezone: "Asia/Kolkata" },
  { id: "warangal", name: "Warangal", name_telugu: "వరంగల్", state: "Telangana", state_telugu: "తెలంగాణ", country: "India", latitude: 17.9689, longitude: 79.5941, elevation_m: 266.0, timezone: "Asia/Kolkata" },
  { id: "guntur", name: "Guntur", name_telugu: "గుంటూరు", state: "Andhra Pradesh", state_telugu: "ఆంధ్రప్రదేశ్", country: "India", latitude: 16.3067, longitude: 80.4365, elevation_m: 30.0, timezone: "Asia/Kolkata" },
  { id: "kurnool", name: "Kurnool", name_telugu: "కర్నూలు", state: "Andhra Pradesh", state_telugu: "ఆంధ్రప్రదేశ్", country: "India", latitude: 15.8281, longitude: 78.0373, elevation_m: 273.0, timezone: "Asia/Kolkata" },
  { id: "rajahmundry", name: "Rajahmundry", name_telugu: "రాజమండ్రి", state: "Andhra Pradesh", state_telugu: "ఆంధ్రప్రదేశ్", country: "India", latitude: 17.0005, longitude: 81.8040, elevation_m: 14.0, timezone: "Asia/Kolkata" },
  { id: "nellore", name: "Nellore", name_telugu: "నెల్లూరు", state: "Andhra Pradesh", state_telugu: "ఆంధ్రప్రదేశ్", country: "India", latitude: 14.4426, longitude: 79.9865, elevation_m: 18.0, timezone: "Asia/Kolkata" },
  { id: "karimnagar", name: "Karimnagar", name_telugu: "కరీంనగర్", state: "Telangana", state_telugu: "తెలంగాణ", country: "India", latitude: 18.4386, longitude: 79.1288, elevation_m: 265.0, timezone: "Asia/Kolkata" },
  { id: "nizamabad", name: "Nizamabad", name_telugu: "నిజామాబాద్", state: "Telangana", state_telugu: "తెలంగాణ", country: "India", latitude: 18.6725, longitude: 78.0941, elevation_m: 395.0, timezone: "Asia/Kolkata" },
  { id: "khammam", name: "Khammam", name_telugu: "ఖమ్మం", state: "Telangana", state_telugu: "తెలంగాణ", country: "India", latitude: 17.2473, longitude: 80.1514, elevation_m: 107.0, timezone: "Asia/Kolkata" },
  { id: "bengaluru", name: "Bengaluru", name_telugu: "బెంగళూరు", state: "Karnataka", state_telugu: "కర్ణాటక", country: "India", latitude: 12.9716, longitude: 77.5946, elevation_m: 920.0, timezone: "Asia/Kolkata" },
  { id: "chennai", name: "Chennai", name_telugu: "చెన్నై", state: "Tamil Nadu", state_telugu: "తమిళనాడు", country: "India", latitude: 13.0827, longitude: 80.2707, elevation_m: 6.0, timezone: "Asia/Kolkata" },
  { id: "mumbai", name: "Mumbai", name_telugu: "ముంబై", state: "Maharashtra", state_telugu: "మహారాష్ట్ర", country: "India", latitude: 19.0760, longitude: 72.8777, elevation_m: 14.0, timezone: "Asia/Kolkata" },
  { id: "delhi", name: "New Delhi", name_telugu: "న్యూఢిల్లీ", state: "Delhi", state_telugu: "ఢిల్లీ", country: "India", latitude: 28.6139, longitude: 77.2090, elevation_m: 216.0, timezone: "Asia/Kolkata" },
];
