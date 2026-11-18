import React, { useState, useEffect } from 'react';
import { DailyPanchangamData, LocationItem } from '../types/panchangam';
import { fetchDailyPanchangam } from '../api/client';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Compass,
  Clock,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Sunrise,
  Sunset,
  Moon,
} from 'lucide-react';

interface Props {
  currentLocation: LocationItem;
  initialDate?: string;
  lang: 'te' | 'en';
}

export const DailyDetailedView: React.FC<Props> = ({
  currentLocation,
  initialDate,
  lang,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [data, setData] = useState<DailyPanchangamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    setLoading(true);
    fetchDailyPanchangam(selectedDate, { cityId: currentLocation.id })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedDate, currentLocation]);

  const handleDayShift = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6B0F1A' }}>
        <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s infinite linear' }}>ॐ</div>
        <p style={{ marginTop: '0.8rem', fontWeight: 600 }}>
          {lang === 'te' ? 'దిన పంచాంగం సిద్ధమవుతోంది...' : 'Loading daily panchangam...'}
        </p>
      </div>
    );
  }

  const {
    summary,
    telugu_calendar,
    sun_moon,
    panchangam,
    muhurtham,
    grahas,
    festivals = [],
    metadata,
  } = data;

  return (
    <div className="daily-detailed-container">
      {/* Date Navigation Strip */}
      <div className="traditional-card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-body" style={{ padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn-pill"
                onClick={() => handleDayShift(-1)}
                style={{ color: '#6B0F1A', borderColor: '#C59B27' }}
              >
                <ChevronLeft size={16} />
                <span>{lang === 'te' ? 'నిన్న' : 'Yesterday'}</span>
              </button>
              <button
                className="btn-pill"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                style={{ color: '#6B0F1A', borderColor: '#C59B27' }}
              >
                <span>{lang === 'te' ? 'నేడు' : 'Today'}</span>
              </button>
              <button
                className="btn-pill"
                onClick={() => handleDayShift(1)}
                style={{ color: '#6B0F1A', borderColor: '#C59B27' }}
              >
                <span>{lang === 'te' ? 'రేపు' : 'Tomorrow'}</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarIcon size={18} color="#6B0F1A" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #C59B27',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="panchangam-banner" style={{ marginBottom: '1.5rem' }}>
        <div className="banner-ornament">ॐ</div>
        <div className="banner-date-badge">
          {new Date(metadata.date).toLocaleDateString(
            lang === 'te' ? 'te-IN' : 'en-US',
            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
          )}
        </div>
        <h2 className="banner-headline">
          {lang === 'te' ? summary.telugu : summary.english}
        </h2>
        <div className="banner-subhead" style={{ marginTop: '0.4rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span><strong>{lang === 'te' ? 'సంవత్సరం:' : 'Year:'}</strong> {lang === 'te' ? telugu_calendar.samvatsaram.name_telugu : telugu_calendar.samvatsaram.name_english}</span>
          <span>•</span>
          <span><strong>{lang === 'te' ? 'మాసం:' : 'Month:'}</strong> {lang === 'te' ? telugu_calendar.masam.name_telugu : telugu_calendar.masam.name_english}</span>
          <span>•</span>
          <span><strong>{lang === 'te' ? 'పక్షం:' : 'Paksha:'}</strong> {lang === 'te' ? telugu_calendar.paksham.telugu : telugu_calendar.paksham.english}</span>
          <span>•</span>
          <span><strong>{lang === 'te' ? 'అయనం:' : 'Ayana:'}</strong> {lang === 'te' ? telugu_calendar.ayanam.name_telugu : telugu_calendar.ayanam.name_english}</span>
          <span>•</span>
          <span><strong>{lang === 'te' ? 'ఋతువు:' : 'Ritu:'}</strong> {lang === 'te' ? telugu_calendar.rituvu.telugu : telugu_calendar.rituvu.english}</span>
        </div>
      </div>

      {/* Festivals on this date */}
      {festivals.length > 0 && (
        <div
          className="traditional-card"
          style={{
            background: 'linear-gradient(90deg, #FFF9EA 0%, #FFFFFF 100%)',
            borderLeft: '5px solid #C84B1A',
          }}
        >
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Sparkles size={20} color="#C84B1A" />
              <h3 style={{ fontSize: '1.2rem', color: '#6B0F1A', fontWeight: 700 }}>
                {lang === 'te' ? 'ఈ రోజు పండుగలు & విశేషాలు' : 'Festivals & Observances on this Date'}
              </h3>
            </div>
            {festivals.map((f) => (
              <div key={f.id} style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#6B0F1A', fontSize: '1.05rem' }}>
                  {lang === 'te' ? f.name_telugu : f.name_english}
                </strong>
                <p style={{ fontSize: '0.9rem', color: '#554433', marginTop: '0.15rem' }}>
                  {lang === 'te' ? f.description_telugu : f.description_english}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sun & Moon */}
      <div className="sun-moon-grid">
        <div className="sun-moon-card">
          <div className="sun-moon-icon icon-sun">
            <Sunrise size={24} />
          </div>
          <div className="sun-moon-details">
            <h4>{lang === 'te' ? 'సూర్యోదయం' : 'Sunrise'}</h4>
            <div className="time-val">{lang === 'te' ? sun_moon.sunrise_telugu : sun_moon.sunrise}</div>
            <div className="sub-text">
              {lang === 'te' ? 'రాశి:' : 'Sign:'} {lang === 'te' ? sun_moon.sun_rashi.telugu : sun_moon.sun_rashi.english} ({sun_moon.sun_rashi.degrees.toFixed(2)}°)
            </div>
          </div>
        </div>

        <div className="sun-moon-card">
          <div className="sun-moon-icon icon-sun">
            <Sunset size={24} />
          </div>
          <div className="sun-moon-details">
            <h4>{lang === 'te' ? 'సూర్యాస్తమయం' : 'Sunset'}</h4>
            <div className="time-val">{lang === 'te' ? sun_moon.sunset_telugu : sun_moon.sunset}</div>
            <div className="sub-text">
              {lang === 'te' ? 'దినమానం:' : 'Day:'} {Math.floor(sun_moon.dinamana_seconds / 3600)}h {Math.floor((sun_moon.dinamana_seconds % 3600) / 60)}m
            </div>
          </div>
        </div>

        <div className="sun-moon-card">
          <div className="sun-moon-icon icon-moon">
            <Moon size={24} />
          </div>
          <div className="sun-moon-details">
            <h4>{lang === 'te' ? 'చంద్రోదయం' : 'Moonrise'}</h4>
            <div className="time-val">{lang === 'te' ? sun_moon.moonrise_telugu : sun_moon.moonrise}</div>
            <div className="sub-text">
              {lang === 'te' ? 'రాశి:' : 'Sign:'} {lang === 'te' ? sun_moon.moon_rashi.telugu : sun_moon.moon_rashi.english} ({sun_moon.moon_rashi.degrees.toFixed(2)}°)
            </div>
          </div>
        </div>

        <div className="sun-moon-card">
          <div className="sun-moon-icon icon-moon">
            <Moon size={24} style={{ transform: 'scaleX(-1)' }} />
          </div>
          <div className="sun-moon-details">
            <h4>{lang === 'te' ? 'చంద్రాస్తమయం' : 'Moonset'}</h4>
            <div className="time-val">{lang === 'te' ? sun_moon.moonset_telugu : sun_moon.moonset}</div>
            <div className="sub-text">
              {lang === 'te' ? 'రాత్రిమానం:' : 'Night:'} {Math.floor(sun_moon.ratrimana_seconds / 3600)}h {Math.floor((sun_moon.ratrimana_seconds % 3600) / 60)}m
            </div>
          </div>
        </div>
      </div>

      {/* Five Angas with Transitions */}
      <div className="traditional-card">
        <div className="card-header-traditional">
          <div className="card-title">
            <Compass size={22} color="#6B0F1A" />
            <span>{lang === 'te' ? 'పంచాంగం – సమగ్ర వివరాలు & పరివర్తనాలు' : 'Panchangam Details & Transition Timings'}</span>
          </div>
        </div>
        <div className="card-body">
          <div className="angas-grid">
            {/* Tithi */}
            <div className="anga-item">
              <div className="anga-label">
                <span>{lang === 'te' ? 'తిథి' : 'Tithi'}</span>
                <span>#{panchangam.tithi.primary.index}</span>
              </div>
              <div className="anga-value">
                {lang === 'te' ? panchangam.tithi.primary.name_telugu : panchangam.tithi.primary.name_english}
              </div>
              <div className="anga-timing">
                <div>{lang === 'te' ? 'ప్రారంభం:' : 'Start:'} {lang === 'te' ? panchangam.tithi.primary.start_telugu : panchangam.tithi.primary.start_time}</div>
                <div>{lang === 'te' ? 'ముగింపు:' : 'End:'} {lang === 'te' ? panchangam.tithi.primary.end_telugu : panchangam.tithi.primary.end_time}</div>
              </div>
              {panchangam.tithi.next && (
                <div style={{ marginTop: '0.6rem', borderTop: '1px dashed #C59B27', paddingTop: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#6B0F1A', fontWeight: 700 }}>
                    {lang === 'te' ? 'తదుపరి తిథి:' : 'Next Tithi:'} {lang === 'te' ? panchangam.tithi.next.name_telugu : panchangam.tithi.next.name_english}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#554433' }}>
                    {lang === 'te' ? 'ముగింపు:' : 'Ends:'} {lang === 'te' ? panchangam.tithi.next.end_telugu : panchangam.tithi.next.end_time}
                  </div>
                </div>
              )}
            </div>

            {/* Vara */}
            <div className="anga-item">
              <div className="anga-label">
                <span>{lang === 'te' ? 'వారం' : 'Weekday'}</span>
                <span>{panchangam.vara.ruler}</span>
              </div>
              <div className="anga-value">
                {lang === 'te' ? panchangam.vara.name_telugu : panchangam.vara.name_english}
              </div>
              <div className="anga-timing">
                <div>{lang === 'te' ? 'వాసరాధిపతి:' : 'Ruler:'} <strong>{panchangam.vara.ruler}</strong></div>
                <div>{lang === 'te' ? 'సూర్యోదయం నుండి మరుసటి సూర్యోదయం వరకు' : 'Sunrise to next sunrise'}</div>
              </div>
            </div>

            {/* Nakshatram */}
            <div className="anga-item">
              <div className="anga-label">
                <span>{lang === 'te' ? 'నక్షత్రం' : 'Nakshatram'}</span>
                <span>#{panchangam.nakshatra.primary.index}</span>
              </div>
              <div className="anga-value">
                {lang === 'te' ? panchangam.nakshatra.primary.name_telugu : panchangam.nakshatra.primary.name_english}
              </div>
              <div className="anga-timing">
                <div>{lang === 'te' ? 'ప్రారంభం:' : 'Start:'} {lang === 'te' ? panchangam.nakshatra.primary.start_telugu : panchangam.nakshatra.primary.start_time}</div>
                <div>{lang === 'te' ? 'ముగింపు:' : 'End:'} {lang === 'te' ? panchangam.nakshatra.primary.end_telugu : panchangam.nakshatra.primary.end_time}</div>
              </div>
              {panchangam.nakshatra.next && (
                <div style={{ marginTop: '0.6rem', borderTop: '1px dashed #C59B27', paddingTop: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#6B0F1A', fontWeight: 700 }}>
                    {lang === 'te' ? 'తదుపరి నక్షత్రం:' : 'Next Nakshatra:'} {lang === 'te' ? panchangam.nakshatra.next.name_telugu : panchangam.nakshatra.next.name_english}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#554433' }}>
                    {lang === 'te' ? 'ముగింపు:' : 'Ends:'} {lang === 'te' ? panchangam.nakshatra.next.end_telugu : panchangam.nakshatra.next.end_time}
                  </div>
                </div>
              )}
            </div>

            {/* Yogam */}
            <div className="anga-item">
              <div className="anga-label">
                <span>{lang === 'te' ? 'యోగం' : 'Yogam'}</span>
                <span>#{panchangam.yoga.primary.index}</span>
              </div>
              <div className="anga-value">
                {lang === 'te' ? panchangam.yoga.primary.name_telugu : panchangam.yoga.primary.name_english}
              </div>
              <div className="anga-timing">
                <div>{lang === 'te' ? 'ప్రారంభం:' : 'Start:'} {lang === 'te' ? panchangam.yoga.primary.start_telugu : panchangam.yoga.primary.start_time}</div>
                <div>{lang === 'te' ? 'ముగింపు:' : 'End:'} {lang === 'te' ? panchangam.yoga.primary.end_telugu : panchangam.yoga.primary.end_time}</div>
              </div>
              {panchangam.yoga.next && (
                <div style={{ marginTop: '0.6rem', borderTop: '1px dashed #C59B27', paddingTop: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#6B0F1A', fontWeight: 700 }}>
                    {lang === 'te' ? 'తదుపరి యోగం:' : 'Next Yoga:'} {lang === 'te' ? panchangam.yoga.next.name_telugu : panchangam.yoga.next.name_english}
                  </div>
                </div>
              )}
            </div>

            {/* Karanam */}
            <div className="anga-item">
              <div className="anga-label">
                <span>{lang === 'te' ? 'కరణం' : 'Karanam'}</span>
                <span>#{panchangam.karana.primary.index}</span>
              </div>
              <div className="anga-value">
                {lang === 'te' ? panchangam.karana.primary.name_telugu : panchangam.karana.primary.name_english}
              </div>
              <div className="anga-timing">
                <div>{lang === 'te' ? 'ప్రారంభం:' : 'Start:'} {lang === 'te' ? panchangam.karana.primary.start_telugu : panchangam.karana.primary.start_time}</div>
                <div>{lang === 'te' ? 'ముగింపు:' : 'End:'} {lang === 'te' ? panchangam.karana.primary.end_telugu : panchangam.karana.primary.end_time}</div>
              </div>
              {panchangam.karana.next && (
                <div style={{ marginTop: '0.6rem', borderTop: '1px dashed #C59B27', paddingTop: '0.4rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#6B0F1A', fontWeight: 700 }}>
                    {lang === 'te' ? 'తదుపరి కరణం:' : 'Next Karana:'} {lang === 'te' ? panchangam.karana.next.name_telugu : panchangam.karana.next.name_english}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Muhurthams Table */}
      <div className="traditional-card">
        <div className="card-header-traditional">
          <div className="card-title">
            <Clock size={22} color="#6B0F1A" />
            <span>{lang === 'te' ? 'ముహూర్తాలు & కాలాలు' : 'Muhurtham & Daily Timings'}</span>
          </div>
        </div>
        <div className="card-body">
          <div className="muhurtham-split">
            {/* Auspicious */}
            <div className="muhurtham-column">
              <div className="column-header header-auspicious">
                <ShieldCheck size={20} />
                <span>{lang === 'te' ? 'శుభ సమయాలు' : 'Auspicious Timings'}</span>
              </div>
              <div className="timing-row">
                <div>
                  <div className="timing-name">{lang === 'te' ? muhurtham.abhijit_muhurtham.name_telugu : muhurtham.abhijit_muhurtham.name_english}</div>
                  <div className="timing-desc">{muhurtham.abhijit_muhurtham.description}</div>
                </div>
                <div className="timing-val val-auspicious">
                  {lang === 'te' ? `${muhurtham.abhijit_muhurtham.start_telugu} – ${muhurtham.abhijit_muhurtham.end_telugu}` : `${muhurtham.abhijit_muhurtham.start_time} – ${muhurtham.abhijit_muhurtham.end_time}`}
                </div>
              </div>
              <div className="timing-row">
                <div>
                  <div className="timing-name">{lang === 'te' ? muhurtham.brahma_muhurtham.name_telugu : muhurtham.brahma_muhurtham.name_english}</div>
                  <div className="timing-desc">{muhurtham.brahma_muhurtham.description}</div>
                </div>
                <div className="timing-val val-auspicious">
                  {lang === 'te' ? `${muhurtham.brahma_muhurtham.start_telugu} – ${muhurtham.brahma_muhurtham.end_telugu}` : `${muhurtham.brahma_muhurtham.start_time} – ${muhurtham.brahma_muhurtham.end_time}`}
                </div>
              </div>
              {/* Amrita Kalam */}
              {muhurtham.amrita_kalam.length > 0 ? (
                muhurtham.amrita_kalam.map((amr, idx) => (
                  <div className="timing-row" key={idx}>
                    <div>
                      <div className="timing-name">{lang === 'te' ? amr.name_telugu : amr.name_english}</div>
                      <div className="timing-desc">{amr.description}</div>
                    </div>
                    <div className="timing-val val-auspicious">
                      {lang === 'te' ? `${amr.start_telugu} – ${amr.end_telugu}` : `${amr.start_time} – ${amr.end_time}`}
                    </div>
                  </div>
                ))
              ) : (
                <div className="timing-row">
                  <div>
                    <div className="timing-name" style={{ color: '#888' }}>
                      {lang === 'te' ? 'అమృత కాలం' : 'Amrita Kalam'}
                    </div>
                    <div className="timing-desc">
                      {lang === 'te' ? 'నేటి దినపరిధిలో అమృత ముహూర్తం లేదు' : 'None during this Panchangam day'}
                    </div>
                  </div>
                  <div className="timing-val" style={{ color: '#888', fontStyle: 'italic' }}>
                    {lang === 'te' ? 'లేదు' : 'None'}
                  </div>
                </div>
              )}
            </div>

            {/* Inauspicious */}
            <div className="muhurtham-column">
              <div className="column-header header-inauspicious">
                <ShieldAlert size={20} />
                <span>{lang === 'te' ? 'వర్జ్యం / అశుభ సమయాలు' : 'Inauspicious Timings'}</span>
              </div>
              <div className="timing-row">
                <div>
                  <div className="timing-name">{lang === 'te' ? muhurtham.rahu_kalam.name_telugu : muhurtham.rahu_kalam.name_english}</div>
                  <div className="timing-desc">{muhurtham.rahu_kalam.description}</div>
                </div>
                <div className="timing-val val-inauspicious">
                  {lang === 'te' ? `${muhurtham.rahu_kalam.start_telugu} – ${muhurtham.rahu_kalam.end_telugu}` : `${muhurtham.rahu_kalam.start_time} – ${muhurtham.rahu_kalam.end_time}`}
                </div>
              </div>
              <div className="timing-row">
                <div>
                  <div className="timing-name">{lang === 'te' ? muhurtham.yamagandam.name_telugu : muhurtham.yamagandam.name_english}</div>
                  <div className="timing-desc">{muhurtham.yamagandam.description}</div>
                </div>
                <div className="timing-val val-inauspicious">
                  {lang === 'te' ? `${muhurtham.yamagandam.start_telugu} – ${muhurtham.yamagandam.end_telugu}` : `${muhurtham.yamagandam.start_time} – ${muhurtham.yamagandam.end_time}`}
                </div>
              </div>
              <div className="timing-row">
                <div>
                  <div className="timing-name">{lang === 'te' ? muhurtham.gulika_kalam.name_telugu : muhurtham.gulika_kalam.name_english}</div>
                  <div className="timing-desc">{muhurtham.gulika_kalam.description}</div>
                </div>
                <div className="timing-val val-inauspicious">
                  {lang === 'te' ? `${muhurtham.gulika_kalam.start_telugu} – ${muhurtham.gulika_kalam.end_telugu}` : `${muhurtham.gulika_kalam.start_time} – ${muhurtham.gulika_kalam.end_time}`}
                </div>
              </div>
              {muhurtham.durmuhurthams.map((dm, idx) => (
                <div className="timing-row" key={idx}>
                  <div>
                    <div className="timing-name">{lang === 'te' ? dm.name_telugu : dm.name_english}</div>
                    <div className="timing-desc">{dm.description}</div>
                  </div>
                  <div className="timing-val val-inauspicious">
                    {lang === 'te' ? `${dm.start_telugu} – ${dm.end_telugu}` : `${dm.start_time} – ${dm.end_time}`}
                  </div>
                </div>
              ))}
              {muhurtham.varjyam.length > 0 ? (
                muhurtham.varjyam.map((v, idx) => (
                  <div className="timing-row" key={idx}>
                    <div>
                      <div className="timing-name">{lang === 'te' ? v.name_telugu : v.name_english}</div>
                      <div className="timing-desc">{v.description}</div>
                    </div>
                    <div className="timing-val val-inauspicious">
                      {lang === 'te' ? `${v.start_telugu} – ${v.end_telugu}` : `${v.start_time} – ${v.end_time}`}
                    </div>
                  </div>
                ))
              ) : (
                <div className="timing-row">
                  <div>
                    <div className="timing-name" style={{ color: '#888' }}>
                      {lang === 'te' ? 'వర్జ్యం' : 'Varjyam'}
                    </div>
                    <div className="timing-desc">
                      {lang === 'te' ? 'నేటి దినపరిధిలో వర్జ్యం లేదు' : 'None during this Panchangam day'}
                    </div>
                  </div>
                  <div className="timing-val" style={{ color: '#2e7d32', fontWeight: 600 }}>
                    {lang === 'te' ? 'లేదు (శుభం)' : 'None (Good)'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Astronomical Metadata */}
      <div className="traditional-card" style={{ background: '#FCFAF6', border: '1px dashed #C59B27' }}>
        <div className="card-body" style={{ padding: '0.85rem 1.25rem', fontSize: '0.85rem', color: '#665548' }}>
          <div><strong>{lang === 'te' ? 'ఖగోళ గణన విధానం:' : 'Calculation Engine:'}</strong> {metadata.calculation_engine}</div>
          <div><strong>{lang === 'te' ? 'అయనాంశం:' : 'Ayanamsa:'}</strong> {metadata.ayanamsa.name} ({metadata.ayanamsa.degrees.toFixed(4)}°)</div>
          <div><strong>{lang === 'te' ? 'భౌగోళిక స్థానం:' : 'Coordinates:'}</strong> Lat {metadata.latitude.toFixed(4)}°, Lon {metadata.longitude.toFixed(4)}°, Elevation {metadata.elevation_meters}m ({metadata.timezone})</div>
        </div>
      </div>
    </div>
  );
};
