import React, { useState, useEffect } from 'react';
import { MonthlyPanchangamData, LocationItem } from '../types/panchangam';
import { fetchMonthlyPanchangam } from '../api/client';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

interface Props {
  currentLocation: LocationItem;
  lang: 'te' | 'en';
  onSelectDate: (dateStr: string) => void;
}

const TELUGU_WEEKDAYS = ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'];
const ENGLISH_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthlyCalendarView: React.FC<Props> = ({
  currentLocation,
  lang,
  onSelectDate,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1);
  const [data, setData] = useState<MonthlyPanchangamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetchMonthlyPanchangam(currentYear, currentMonth, { cityId: currentLocation.id })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [currentYear, currentMonth, currentLocation]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate start day of the week (0=Sunday, ..., 6=Saturday)
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  return (
    <div className="monthly-calendar-container">
      {/* Month Navigation Controls */}
      <div className="traditional-card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <div className="calendar-controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CalendarIcon size={24} color="#6B0F1A" />
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#6B0F1A', fontWeight: 700, margin: 0 }}>
                  {monthNames[currentMonth - 1]} {currentYear}
                </h2>
                {data && data.days.length > 0 && (
                  <p style={{ fontSize: '0.9rem', color: '#8E1524', fontWeight: 600 }}>
                    {data.days[0].telugu_month} – {data.days[data.days.length - 1].telugu_month}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-pill" onClick={handlePrevMonth} style={{ color: '#6B0F1A', borderColor: '#C59B27' }}>
                <ChevronLeft size={18} />
                <span>{lang === 'te' ? 'గత మాసం' : 'Prev'}</span>
              </button>
              <button
                className="btn-pill"
                onClick={() => {
                  setCurrentYear(today.getFullYear());
                  setCurrentMonth(today.getMonth() + 1);
                }}
                style={{ color: '#6B0F1A', borderColor: '#C59B27' }}
              >
                <span>{lang === 'te' ? 'ప్రస్తుత నెల' : 'Current'}</span>
              </button>
              <button className="btn-pill" onClick={handleNextMonth} style={{ color: '#6B0F1A', borderColor: '#C59B27' }}>
                <span>{lang === 'te' ? 'తదుపరి మాసం' : 'Next'}</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="traditional-card">
        <div className="card-body" style={{ padding: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6B0F1A' }}>
              <div style={{ fontSize: '2rem', animation: 'spin 1s infinite linear' }}>ॐ</div>
              <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                {lang === 'te' ? 'పంచాంగ గణన జరుగుతోంది...' : 'Calculating astronomical positions...'}
              </p>
            </div>
          ) : (
            <div className="calendar-grid">
              {/* Day Headers (Sun-Sat) */}
              {(lang === 'te' ? TELUGU_WEEKDAYS : ENGLISH_WEEKDAYS).map((dayName, idx) => (
                <div
                  key={idx}
                  className="grid-day-header"
                  style={{ color: idx === 0 ? '#C62828' : '#6B0F1A' }}
                >
                  {dayName}
                </div>
              ))}

              {/* Empty leading padding cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} style={{ minHeight: '105px', background: '#FAF8F5', borderRadius: '8px' }} />
              ))}

              {/* Days of the month */}
              {data?.days.map((dayItem) => {
                const dayDate = new Date(dayItem.date);
                const isSunday = dayDate.getDay() === 0;
                const isToday =
                  dayDate.getDate() === today.getDate() &&
                  dayDate.getMonth() === today.getMonth() &&
                  dayDate.getFullYear() === today.getFullYear();

                return (
                  <div
                    key={dayItem.day}
                    className={`grid-day-cell ${isSunday ? 'sunday' : ''} ${isToday ? 'today-cell' : ''}`}
                    onClick={() => onSelectDate(dayItem.date)}
                    title={lang === 'te' ? 'వివరమైన పంచాంగం కోసం క్లిక్ చేయండి' : 'Click to view full day details'}
                  >
                    <div className="cell-top">
                      <span className="day-number">{dayItem.day}</span>
                      <div className="lunar-icons">
                        {dayItem.is_purnima && <span title="Purnima (Full Moon)">🌕</span>}
                        {dayItem.is_amavasya && <span title="Amavasya (New Moon)">🌑</span>}
                        {dayItem.is_ekadashi && <span title="Ekadashi" style={{ color: '#D4AF37' }}>✨</span>}
                      </div>
                    </div>

                    <div className="cell-mid">
                      <div className="cell-tithi" title={dayItem.tithi}>
                        {dayItem.tithi}
                      </div>
                      <div className="cell-nakshatra" title={dayItem.nakshatra}>
                        {dayItem.nakshatra}
                      </div>
                    </div>

                    {dayItem.festivals && dayItem.festivals.length > 0 && (
                      <div
                        className="festival-badge"
                        title={lang === 'te' ? dayItem.festivals[0].name_telugu : dayItem.festivals[0].name_english}
                      >
                        {lang === 'te' ? dayItem.festivals[0].name_telugu : dayItem.festivals[0].name_english}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
