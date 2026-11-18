import React, { useState, useEffect } from 'react';
import { fetchFestivals } from '../api/client';
import { Search, Sparkles, Filter, Calendar } from 'lucide-react';

interface Props {
  lang: 'te' | 'en';
  onSelectDate: (dateStr: string) => void;
}

export const FestivalCalendarView: React.FC<Props> = ({ lang, onSelectDate }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [festivals, setFestivals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetchFestivals(selectedYear, selectedMonth, regionFilter)
      .then((res) => {
        setFestivals(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedYear, selectedMonth, regionFilter]);

  const filteredFestivals = festivals.filter((item) => {
    const f = item.festival || item;
    if (!f) return false;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (f.name_telugu && f.name_telugu.toLowerCase().includes(term)) ||
      (f.name_english && f.name_english.toLowerCase().includes(term)) ||
      (f.description_telugu && f.description_telugu.toLowerCase().includes(term)) ||
      (f.description_english && f.description_english.toLowerCase().includes(term))
    );
  });

  return (
    <div className="festival-calendar-container">
      {/* Header and Controls */}
      <div className="traditional-card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Sparkles size={24} color="#C84B1A" />
            <h2 style={{ fontSize: '1.4rem', color: '#6B0F1A', fontWeight: 700, margin: 0 }}>
              {lang === 'te' ? 'తెలుగు పండుగలు & వ్రతాల క్యాలెండర్' : 'Telugu Festivals & Religious Observances'}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}
              />
              <input
                type="text"
                placeholder={lang === 'te' ? 'పండుగ పేరుతో శోధించండి...' : 'Search festival by name...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2rem',
                  borderRadius: '6px',
                  border: '1px solid #C59B27',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #C59B27',
                fontSize: '0.9rem',
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

            {/* Region Selector */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #C59B27',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            >
              <option value="ALL">{lang === 'te' ? 'అన్ని ప్రాంతాలు (AP & Telangana)' : 'All Regions (AP & Telangana)'}</option>
              <option value="TELANGANA">{lang === 'te' ? 'తెలంగాణ విశేషాలు (Bonalu, Bathukamma)' : 'Telangana Specific'}</option>
              <option value="ANDHRA_PRADESH">{lang === 'te' ? 'ఆంధ్రప్రదేశ్ విశేషాలు' : 'Andhra Pradesh Specific'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Festivals List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B0F1A' }}>
          <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s infinite linear' }}>ॐ</div>
          <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>
            {lang === 'te' ? 'పండుగల గణన జరుగుతోంది...' : 'Loading festivals database...'}
          </p>
        </div>
      ) : filteredFestivals.length === 0 ? (
        <div className="traditional-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: '#665548', fontSize: '1.05rem' }}>
            {lang === 'te' ? 'ఎటువంటి పండుగలు కనుగొనబడలేదు.' : 'No festivals found for the selected criteria.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredFestivals.map((item, idx) => {
            const f = item.festival || item;
            const dateStr = item.date
              ? new Date(item.date).toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })
              : '';

            return (
              <div
                key={idx}
                className="traditional-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: '4px solid #6B0F1A',
                }}
              >
                <div className="card-body" style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    {dateStr && (
                      <div style={{ background: '#F9EED4', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: '#6B0F1A', fontWeight: 700 }}>
                        {dateStr}
                      </div>
                    )}
                    {f?.region && f.region !== 'ALL' && (
                      <span
                        style={{
                          background: '#EAE1CE',
                          color: '#4A070F',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {f.region === 'TELANGANA' ? (lang === 'te' ? 'తెలంగాణ' : 'Telangana') : (lang === 'te' ? 'ఆంధ్రప్రదేశ్' : 'Andhra Pradesh')}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', color: '#6B0F1A', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {lang === 'te' ? f.name_telugu : f.name_english}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: '#8E1524', fontWeight: 600, marginBottom: '0.6rem' }}>
                    {item.telugu_month} • {item.tithi}
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#443322', lineHeight: '1.45' }}>
                    {lang === 'te' ? f.description_telugu : f.description_english}
                  </p>
                </div>

                <div
                  style={{
                    background: '#FAF6EE',
                    borderTop: '1px solid #E8DFCE',
                    padding: '0.6rem 1.2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <button
                    onClick={() => onSelectDate(item.date)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6B0F1A',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span>{lang === 'te' ? 'ఈ నాటి పూర్తి పంచాంగం →' : 'View Full Panchangam →'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
