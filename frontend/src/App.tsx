import React, { useState, useEffect } from 'react';
import { LocationItem, DailyPanchangamData } from './types/panchangam';
import { fetchDailyPanchangam } from './api/client';
import { Header } from './components/Header';
import { LocationModal } from './components/LocationModal';
import { HomeTodayView } from './components/HomeTodayView';
import { MonthlyCalendarView } from './components/MonthlyCalendarView';
import { DailyDetailedView } from './components/DailyDetailedView';
import { FestivalCalendarView } from './components/FestivalCalendarView';
import { YearlyCalendarView } from './components/YearlyCalendarView';
import './styles/theme.css';

const DEFAULT_LOCATION: LocationItem = {
  id: 'hyderabad',
  name: 'Hyderabad',
  name_telugu: 'హైదరాబాద్',
  state: 'Telangana',
  state_telugu: 'తెలంగాణ',
  country: 'India',
  latitude: 17.385044,
  longitude: 78.486671,
  elevation_m: 505.0,
  timezone: 'Asia/Kolkata',
  is_default: true,
};

export const App: React.FC = () => {
  const [lang, setLang] = useState<'te' | 'en'>('te');
  const [activeTab, setActiveTab] = useState<string>('today');
  const [currentLocation, setCurrentLocation] = useState<LocationItem>(DEFAULT_LOCATION);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [todayData, setTodayData] = useState<DailyPanchangamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [drilldownDate, setDrilldownDate] = useState<string | undefined>(undefined);

  // Load Today's Panchangam for default or selected location
  useEffect(() => {
    setLoading(true);
    fetchDailyPanchangam(undefined, { cityId: currentLocation.id })
      .then((data) => {
        setTodayData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch today panchangam:', err);
        setLoading(false);
      });
  }, [currentLocation]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'te' ? 'en' : 'te'));
  };

  const handleSelectDateFromCalendar = (dateStr: string) => {
    setDrilldownDate(dateStr);
    setActiveTab('daily');
  };

  const handleSelectMonthFromYearly = (_monthNum: number) => {
    setActiveTab('monthly');
  };

  return (
    <div className="app-container">
      <Header
        currentLocation={currentLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        lang={lang}
        onToggleLang={handleToggleLang}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'today') setDrilldownDate(undefined);
        }}
      />

      <main className="main-content">
        {activeTab === 'today' && (
          <>
            {loading || !todayData ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6B0F1A' }}>
                <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s infinite linear' }}>ॐ</div>
                <p style={{ marginTop: '0.8rem', fontWeight: 600 }}>
                  {lang === 'te' ? 'నేటి పంచాంగం లోడ్ అవుతోంది...' : "Loading today's panchangam..."}
                </p>
              </div>
            ) : (
              <HomeTodayView data={todayData} lang={lang} />
            )}
          </>
        )}

        {activeTab === 'monthly' && (
          <MonthlyCalendarView
            currentLocation={currentLocation}
            lang={lang}
            onSelectDate={handleSelectDateFromCalendar}
          />
        )}

        {activeTab === 'daily' && (
          <DailyDetailedView
            currentLocation={currentLocation}
            initialDate={drilldownDate}
            lang={lang}
          />
        )}

        {activeTab === 'festivals' && (
          <FestivalCalendarView
            lang={lang}
            onSelectDate={handleSelectDateFromCalendar}
          />
        )}

        {activeTab === 'yearly' && (
          <YearlyCalendarView
            currentLocation={currentLocation}
            lang={lang}
            onSelectMonth={handleSelectMonthFromYearly}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#D4AF37', marginBottom: '0.3rem' }}>
            {lang === 'te' ? 'తెలుగు పంచాంగం & క్యాలెండర్ ప్లాట్‌ఫామ్' : 'Telugu Panchangam & Calendar Platform'}
          </p>
          <p style={{ fontSize: '0.82rem', opacity: 0.9 }}>
            {lang === 'te'
              ? 'ఖగోళ దృక్సిద్ధాంత గణనలు • స్విస్ ఎఫిమిరిస్ 2.10.03 • చిత్రాపక్ష / లాహిరి అయనాంశం • అమంత మాస పద్ధతి'
              : 'Drik Ganita Astronomical Calculations • Swiss Ephemeris 2.10.03 (JPL DE431) • Chitrapaksha/Lahiri Ayanamsa • Amanta Lunar System'}
          </p>
          <p style={{ fontSize: '0.78rem', marginTop: '0.5rem', opacity: 0.75 }}>
            {lang === 'te'
              ? 'ఆంధ్రప్రదేశ్ మరియు తెలంగాణ ప్రాంతీయ సంప్రదాయాలకు అనుగుణంగా రూపొందించబడింది.'
              : 'Designed with precision for Andhra Pradesh & Telangana traditional observances.'}
          </p>
        </div>
      </footer>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={(loc) => setCurrentLocation(loc)}
        lang={lang}
      />
    </div>
  );
};

export default App;
