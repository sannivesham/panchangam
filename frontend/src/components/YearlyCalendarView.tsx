import React, { useState, useEffect } from 'react';
import { LocationItem } from '../types/panchangam';
import { fetchYearlyOverview } from '../api/client';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';

interface Props {
  currentLocation: LocationItem;
  lang: 'te' | 'en';
  onSelectMonth: (monthNum: number) => void;
}

export const YearlyCalendarView: React.FC<Props> = ({
  currentLocation,
  lang,
  onSelectMonth,
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [yearlyData, setYearlyData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetchYearlyOverview(selectedYear, { cityId: currentLocation.id })
      .then((res) => {
        setYearlyData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedYear, currentLocation]);

  const TELUGU_MONTHS_ORDER = [
    { name: 'చైత్రము', en: 'Chaitramu', ritu: 'వసంత ఋతువు', ritu_en: 'Vasanta (Spring)' },
    { name: 'వైశాఖము', en: 'Vaishakhamu', ritu: 'వసంత ఋతువు', ritu_en: 'Vasanta (Spring)' },
    { name: 'జ్యేష్ఠము', en: 'Jyeshthamu', ritu: 'గ్రీష్మ ఋతువు', ritu_en: 'Greeshma (Summer)' },
    { name: 'ఆషాఢము', en: 'Ashadhamu', ritu: 'గ్రీష్మ ఋతువు', ritu_en: 'Greeshma (Summer)' },
    { name: 'శ్రావణము', en: 'Shravanamu', ritu: 'వర్ష ఋతువు', ritu_en: 'Varsha (Monsoon)' },
    { name: 'భాద్రపదము', en: 'Bhadrapadamu', ritu: 'వర్ష ఋతువు', ritu_en: 'Varsha (Monsoon)' },
    { name: 'ఆశ్వయుజము', en: 'Ashvayujamu', ritu: 'శరద్ ఋతువు', ritu_en: 'Sharad (Autumn)' },
    { name: 'కార్తీకము', en: 'Karthikamu', ritu: 'శరద్ ఋతువు', ritu_en: 'Sharad (Autumn)' },
    { name: 'మార్గశిరము', en: 'Margashiramu', ritu: 'హేమంత ఋతువు', ritu_en: 'Hemanta (Pre-winter)' },
    { name: 'పుష్యము', en: 'Pushyamu', ritu: 'హేమంత ఋతువు', ritu_en: 'Hemanta (Pre-winter)' },
    { name: 'మాఘము', en: 'Maghamu', ritu: 'శిశిర ఋతువు', ritu_en: 'Shishira (Winter)' },
    { name: 'ఫాల్గుణము', en: 'Phalgunamu', ritu: 'శిశిర ఋతువు', ritu_en: 'Shishira (Winter)' },
  ];

  return (
    <div className="yearly-calendar-container">
      {/* Header */}
      <div className="traditional-card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CalendarIcon size={24} color="#6B0F1A" />
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#6B0F1A', fontWeight: 700, margin: 0 }}>
                  {lang === 'te' ? 'సంవత్సర అవలోకనం' : 'Yearly Calendar Overview'}
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#776655', margin: 0 }}>
                  {lang === 'te' ? '12 తెలుగు మాసాలు & ఋతు చక్రం' : '12 Telugu Months & Seasonal Cycles'}
                </p>
              </div>
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #C59B27',
                fontSize: '0.95rem',
                fontWeight: 600,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y} {lang === 'te' ? 'సంవత్సరం' : 'Year'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 12 Months Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B0F1A' }}>
          <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s infinite linear' }}>ॐ</div>
          <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>
            {lang === 'te' ? 'వార్షిక వివరాలు సిద్ధమవుతున్నాయి...' : 'Calculating yearly astronomical data...'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {TELUGU_MONTHS_ORDER.map((m, idx) => {
            const monthNumber = idx + 1;
            return (
              <div
                key={idx}
                className="traditional-card"
                style={{
                  borderTop: '4px solid #C59B27',
                  cursor: 'pointer',
                  margin: 0,
                }}
                onClick={() => onSelectMonth(monthNumber)}
              >
                <div className="card-body" style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 700 }}>#{monthNumber}</span>
                    <span style={{ background: '#F9EED4', color: '#6B0F1A', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {lang === 'te' ? m.ritu : m.ritu_en}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', color: '#6B0F1A', fontWeight: 700, marginBottom: '0.2rem' }}>
                    {lang === 'te' ? m.name : m.en}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#554433', marginTop: '0.5rem' }}>
                    {lang === 'te' ? 'ఈ మాస పంచాంగ క్యాలెండర్ చూడటానికి క్లిక్ చేయండి' : 'Click to view monthly calendar'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
