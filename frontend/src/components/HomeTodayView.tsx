import React, { useState } from 'react';
import { DailyPanchangamData } from '../types/panchangam';
import {
  Sunrise,
  Sunset,
  Moon,
  Compass,
  Clock,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  data: DailyPanchangamData;
  lang: 'te' | 'en';
}

export const HomeTodayView: React.FC<Props> = ({ data, lang }) => {
  const [showGrahas, setShowGrahas] = useState(false);

  const {
    summary,
    telugu_calendar,
    sun_moon,
    panchangam,
    muhurtham,
    grahas,
    festivals = [],
  } = data;

  const tithi = panchangam.tithi.primary;
  const nakshatra = panchangam.nakshatra.primary;
  const yoga = panchangam.yoga.primary;
  const karana = panchangam.karana.primary;
  const vara = panchangam.vara;

  return (
    <div className="home-today-container">
      {/* Main Panchangam Banner */}
      <div className="panchangam-banner">
        <div className="banner-ornament">ॐ</div>
        <div className="banner-date-badge">
          {new Date(data.metadata.date).toLocaleDateString(
            lang === 'te' ? 'te-IN' : 'en-US',
            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
          )}
        </div>
        <h2 className="banner-headline">
          {lang === 'te' ? summary.telugu : summary.english}
        </h2>
        <div className="banner-subhead" style={{ marginTop: '0.4rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span>
            <strong>{lang === 'te' ? 'సంవత్సరం:' : 'Samvatsaram:'}</strong>{' '}
            {lang === 'te' ? telugu_calendar.samvatsaram.name_telugu : telugu_calendar.samvatsaram.name_english}
          </span>
          <span>•</span>
          <span>
            <strong>{lang === 'te' ? 'మాసం:' : 'Masam:'}</strong>{' '}
            {lang === 'te' ? telugu_calendar.masam.name_telugu : telugu_calendar.masam.name_english}
          </span>
          <span>•</span>
          <span>
            <strong>{lang === 'te' ? 'పక్షం:' : 'Paksham:'}</strong>{' '}
            {lang === 'te' ? telugu_calendar.paksham.telugu : telugu_calendar.paksham.english}
          </span>
          <span>•</span>
          <span>
            <strong>{lang === 'te' ? 'అయనం:' : 'Ayanam:'}</strong>{' '}
            {lang === 'te' ? telugu_calendar.ayanam.name_telugu : telugu_calendar.ayanam.name_english}
          </span>
          <span>•</span>
          <span>
            <strong>{lang === 'te' ? 'ఋతువు:' : 'Ritu:'}</strong>{' '}
            {lang === 'te' ? telugu_calendar.rituvu.telugu : telugu_calendar.rituvu.english}
          </span>
        </div>
      </div>

      {/* Today's Festivals Alert if any */}
      {festivals.length > 0 && (
        <div
          className="traditional-card"
          style={{
            background: 'linear-gradient(90deg, #FFF8E7 0%, #FFFDF7 100%)',
            borderColor: '#D4AF37',
            borderLeft: '5px solid #C84B1A',
          }}
        >
          <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Sparkles size={20} color="#C84B1A" />
              <h3 style={{ fontSize: '1.15rem', color: '#6B0F1A', fontWeight: 700 }}>
                {lang === 'te' ? 'నేటి పర్వదినాలు & విశేషాలు' : "Today's Festivals & Religious Occasions"}
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {festivals.map((fest) => (
                <div key={fest.id} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ color: '#D4AF37', fontSize: '1.2rem' }}>✦</span>
                  <div>
                    <strong style={{ color: '#6B0F1A', fontSize: '1rem' }}>
                      {lang === 'te' ? fest.name_telugu : fest.name_english}
                    </strong>
                    <p style={{ fontSize: '0.85rem', color: '#554433', marginTop: '0.1rem' }}>
                      {lang === 'te' ? fest.description_telugu : fest.description_english}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sun & Moon Times Ribbon */}
      <div className="sun-moon-grid">
        <div className="sun-moon-card">
          <div className="sun-moon-icon icon-sun">
            <Sunrise size={26} />
          </div>
          <div className="sun-moon-details">
            <h4>{lang === 'te' ? 'సూర్యోదయం' : 'Sunrise'}</h4>
            <div className="time-val">
              {lang === 'te' ? sun_moon.sunrise_telugu : sun_moon.sunrise}
            </div>
            <div className="sub-text">
              {lang === 'te' ? 'సూర్య రాశి:' : 'Sun Sign:'}{' '}
              {lang === 'te' ? sun_moon.sun_rashi.telugu : sun_moon.sun_rashi.english}
            </div>
          </div>
        </div>

        <div className="sun-moon-card">
          <div className="sun-moon-icon icon-sun">
            <Sunset size={26} />
          </div>
          <div className="sun-moon-details">
            <h4>{lang === 'te' ? 'సూర్యాస్తమయం' : 'Sunset'}</h4>
            <div className="time-val">
              {lang === 'te' ? sun_moon.sunset_telugu : sun_moon.sunset}
            </div>
            <div className="sub-text">
              {lang === 'te' ? 'దినమానం:' : 'Day length:'}{' '}
              {Math.floor(sun_moon.dinamana_seconds / 3600)}h {Math.floor((sun_moon.dinamana_seconds % 3600) / 60)}m
            </div>
          </div>
        </div>

        <div className="sun-moon-card">
          <div className="sun-moon-icon icon-moon">
            <Moon size={26} />
          </div>
          <div className="sun-moon-details">
            <h4>{lang === 'te' ? 'చంద్రోదయం' : 'Moonrise'}</h4>
            <div className="time-val">
              {lang === 'te' ? sun_moon.moonrise_telugu : sun_moon.moonrise}
            </div>
            <div className="sub-text">
              {lang === 'te' ? 'చంద్ర రాశి:' : 'Moon Sign:'}{' '}
              {lang === 'te' ? sun_moon.moon_rashi.telugu : sun_moon.moon_rashi.english}
            </div>
          </div>
        </div>

        <div className="sun-moon-card">
          <div className="sun-moon-icon icon-moon">
            <Moon size={26} style={{ transform: 'scaleX(-1)' }} />
          </div>
          <div className="sun-moon-details">
            <h4>{lang === 'te' ? 'చంద్రాస్తమయం' : 'Moonset'}</h4>
            <div className="time-val">
              {lang === 'te' ? sun_moon.moonset_telugu : sun_moon.moonset}
            </div>
            <div className="sub-text">
              {lang === 'te' ? 'రాత్రిమానం:' : 'Night length:'}{' '}
              {Math.floor(sun_moon.ratrimana_seconds / 3600)}h {Math.floor((sun_moon.ratrimana_seconds % 3600) / 60)}m
            </div>
          </div>
        </div>
      </div>

      {/* Five Angas (పంచాంగం) Card */}
      <div className="traditional-card">
        <div className="card-header-traditional">
          <div className="card-title">
            <Compass size={22} color="#6B0F1A" />
            <span>{lang === 'te' ? 'పంచాంగం – పంచ అంగాలు' : 'Panchangam – The Five Angas'}</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#665548', fontStyle: 'italic' }}>
            {lang === 'te' ? 'సూర్యోదయ తిథ్యాదులు' : 'Prevailing at Sunrise'}
          </span>
        </div>
        <div className="card-body">
          <div className="angas-grid">
            {/* Tithi */}
            <div className="anga-item">
              <div className="anga-label">
                <span>{lang === 'te' ? 'తిథి' : 'Tithi'}</span>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>#{tithi.index}</span>
              </div>
              <div className="anga-value">
                {lang === 'te' ? tithi.name_telugu : tithi.name_english}
              </div>
              <div className="anga-timing">
                {lang === 'te' ? 'ముగింపు:' : 'Ends:'}{' '}
                <strong>{lang === 'te' ? tithi.end_telugu : tithi.end_time}</strong>
              </div>
              {panchangam.tithi.next && (
                <div className="anga-transition-badge">
                  {lang === 'te'
                    ? `తదుపరి: ${panchangam.tithi.next.name_telugu}`
                    : `Next: ${panchangam.tithi.next.name_english}`}
                </div>
              )}
            </div>

            {/* Vara */}
            <div className="anga-item">
              <div className="anga-label">
                <span>{lang === 'te' ? 'వారం' : 'Vara (Weekday)'}</span>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>{vara.ruler}</span>
              </div>
              <div className="anga-value">
                {lang === 'te' ? vara.name_telugu : vara.name_english}
              </div>
              <div className="anga-timing">
                {lang === 'te' ? 'అధిపతి:' : 'Ruler:'} <strong>{vara.ruler}</strong>
              </div>
            </div>

            {/* Nakshatram */}
            <div className="anga-item">
              <div className="anga-label">
                <span>{lang === 'te' ? 'నక్షత్రం' : 'Nakshatram'}</span>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>#{nakshatra.index}</span>
              </div>
              <div className="anga-value">
                {lang === 'te' ? nakshatra.name_telugu : nakshatra.name_english}
              </div>
              <div className="anga-timing">
                {lang === 'te' ? 'ముగింపు:' : 'Ends:'}{' '}
                <strong>{lang === 'te' ? nakshatra.end_telugu : nakshatra.end_time}</strong>
              </div>
              {panchangam.nakshatra.next && (
                <div className="anga-transition-badge">
                  {lang === 'te'
                    ? `తదుపరి: ${panchangam.nakshatra.next.name_telugu}`
                    : `Next: ${panchangam.nakshatra.next.name_english}`}
                </div>
              )}
            </div>

            {/* Yogam */}
            <div className="anga-item">
              <div className="anga-label">
                <span>{lang === 'te' ? 'యోగం' : 'Yogam'}</span>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>#{yoga.index}</span>
              </div>
              <div className="anga-value">
                {lang === 'te' ? yoga.name_telugu : yoga.name_english}
              </div>
              <div className="anga-timing">
                {lang === 'te' ? 'ముగింపు:' : 'Ends:'}{' '}
                <strong>{lang === 'te' ? yoga.end_telugu : yoga.end_time}</strong>
              </div>
            </div>

            {/* Karanam */}
            <div className="anga-item">
              <div className="anga-label">
                <span>{lang === 'te' ? 'కరణం' : 'Karanam'}</span>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>#{karana.index}</span>
              </div>
              <div className="anga-value">
                {lang === 'te' ? karana.name_telugu : karana.name_english}
              </div>
              <div className="anga-timing">
                {lang === 'te' ? 'ముగింపు:' : 'Ends:'}{' '}
                <strong>{lang === 'te' ? karana.end_telugu : karana.end_time}</strong>
              </div>
              {panchangam.karana.next && (
                <div className="anga-transition-badge">
                  {lang === 'te'
                    ? `తదుపరి: ${panchangam.karana.next.name_telugu}`
                    : `Next: ${panchangam.karana.next.name_english}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Muhurthams Card */}
      <div className="traditional-card">
        <div className="card-header-traditional">
          <div className="card-title">
            <Clock size={22} color="#6B0F1A" />
            <span>{lang === 'te' ? 'ముహూర్తాలు & కాలాలు' : 'Muhurthams & Daily Timings'}</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#665548' }}>
            {data.metadata.location_name} • {data.metadata.timezone}
          </span>
        </div>
        <div className="card-body">
          <div className="muhurtham-split">
            {/* Auspicious Timings */}
            <div className="muhurtham-column">
              <div className="column-header header-auspicious">
                <ShieldCheck size={20} />
                <span>{lang === 'te' ? 'శుభ సమయాలు' : 'Auspicious Timings'}</span>
              </div>

              {/* Abhijit */}
              <div className="timing-row">
                <div>
                  <div className="timing-name">
                    {lang === 'te' ? muhurtham.abhijit_muhurtham.name_telugu : muhurtham.abhijit_muhurtham.name_english}
                  </div>
                  <div className="timing-desc">
                    {muhurtham.abhijit_muhurtham.description}
                  </div>
                </div>
                <div className="timing-val val-auspicious">
                  {lang === 'te'
                    ? `${muhurtham.abhijit_muhurtham.start_telugu} – ${muhurtham.abhijit_muhurtham.end_telugu}`
                    : `${muhurtham.abhijit_muhurtham.start_time} – ${muhurtham.abhijit_muhurtham.end_time}`}
                </div>
              </div>

              {/* Brahma Muhurtham */}
              <div className="timing-row">
                <div>
                  <div className="timing-name">
                    {lang === 'te' ? muhurtham.brahma_muhurtham.name_telugu : muhurtham.brahma_muhurtham.name_english}
                  </div>
                  <div className="timing-desc">
                    {muhurtham.brahma_muhurtham.description}
                  </div>
                </div>
                <div className="timing-val val-auspicious">
                  {lang === 'te'
                    ? `${muhurtham.brahma_muhurtham.start_telugu} – ${muhurtham.brahma_muhurtham.end_telugu}`
                    : `${muhurtham.brahma_muhurtham.start_time} – ${muhurtham.brahma_muhurtham.end_time}`}
                </div>
              </div>

              {/* Amrita Kalam */}
              {muhurtham.amrita_kalam.length > 0 ? (
                muhurtham.amrita_kalam.map((amr, idx) => (
                  <div className="timing-row" key={idx}>
                    <div>
                      <div className="timing-name">
                        {lang === 'te' ? amr.name_telugu : amr.name_english}
                      </div>
                      <div className="timing-desc">{amr.description}</div>
                    </div>
                    <div className="timing-val val-auspicious">
                      {lang === 'te'
                        ? `${amr.start_telugu} – ${amr.end_telugu}`
                        : `${amr.start_time} – ${amr.end_time}`}
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

            {/* Inauspicious Timings */}
            <div className="muhurtham-column">
              <div className="column-header header-inauspicious">
                <ShieldAlert size={20} />
                <span>{lang === 'te' ? 'వర్జ్యం / అశుభ సమయాలు' : 'Inauspicious Timings'}</span>
              </div>

              {/* Rahu Kalam */}
              <div className="timing-row">
                <div>
                  <div className="timing-name">
                    {lang === 'te' ? muhurtham.rahu_kalam.name_telugu : muhurtham.rahu_kalam.name_english}
                  </div>
                  <div className="timing-desc">{muhurtham.rahu_kalam.description}</div>
                </div>
                <div className="timing-val val-inauspicious">
                  {lang === 'te'
                    ? `${muhurtham.rahu_kalam.start_telugu} – ${muhurtham.rahu_kalam.end_telugu}`
                    : `${muhurtham.rahu_kalam.start_time} – ${muhurtham.rahu_kalam.end_time}`}
                </div>
              </div>

              {/* Yamagandam */}
              <div className="timing-row">
                <div>
                  <div className="timing-name">
                    {lang === 'te' ? muhurtham.yamagandam.name_telugu : muhurtham.yamagandam.name_english}
                  </div>
                  <div className="timing-desc">{muhurtham.yamagandam.description}</div>
                </div>
                <div className="timing-val val-inauspicious">
                  {lang === 'te'
                    ? `${muhurtham.yamagandam.start_telugu} – ${muhurtham.yamagandam.end_telugu}`
                    : `${muhurtham.yamagandam.start_time} – ${muhurtham.yamagandam.end_time}`}
                </div>
              </div>

              {/* Gulika Kalam */}
              <div className="timing-row">
                <div>
                  <div className="timing-name">
                    {lang === 'te' ? muhurtham.gulika_kalam.name_telugu : muhurtham.gulika_kalam.name_english}
                  </div>
                  <div className="timing-desc">{muhurtham.gulika_kalam.description}</div>
                </div>
                <div className="timing-val val-inauspicious">
                  {lang === 'te'
                    ? `${muhurtham.gulika_kalam.start_telugu} – ${muhurtham.gulika_kalam.end_telugu}`
                    : `${muhurtham.gulika_kalam.start_time} – ${muhurtham.gulika_kalam.end_time}`}
                </div>
              </div>

              {/* Durmuhurthams */}
              {muhurtham.durmuhurthams.map((dm, idx) => (
                <div className="timing-row" key={idx}>
                  <div>
                    <div className="timing-name">
                      {lang === 'te' ? dm.name_telugu : dm.name_english}
                    </div>
                    <div className="timing-desc">{dm.description}</div>
                  </div>
                  <div className="timing-val val-inauspicious">
                    {lang === 'te'
                      ? `${dm.start_telugu} – ${dm.end_telugu}`
                      : `${dm.start_time} – ${dm.end_time}`}
                  </div>
                </div>
              ))}

              {/* Varjyam */}
              {muhurtham.varjyam.length > 0 ? (
                muhurtham.varjyam.map((v, idx) => (
                  <div className="timing-row" key={idx}>
                    <div>
                      <div className="timing-name">
                        {lang === 'te' ? v.name_telugu : v.name_english}
                      </div>
                      <div className="timing-desc">{v.description}</div>
                    </div>
                    <div className="timing-val val-inauspicious">
                      {lang === 'te'
                        ? `${v.start_telugu} – ${v.end_telugu}`
                        : `${v.start_time} – ${v.end_time}`}
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

      {/* Navagraha Planetary Positions Accordion */}
      {grahas.length > 0 && (
        <div className="traditional-card">
          <div
            className="card-header-traditional"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowGrahas(!showGrahas)}
          >
            <div className="card-title">
              <Compass size={22} color="#6B0F1A" />
              <span>{lang === 'te' ? 'నవగ్రహ సంచార స్థితి' : 'Navagraha Planetary Positions'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6B0F1A', fontWeight: 600 }}>
              <span>{showGrahas ? (lang === 'te' ? 'దాచండి' : 'Hide') : (lang === 'te' ? 'చూడండి' : 'Show')}</span>
              {showGrahas ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {showGrahas && (
            <div className="card-body">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#F4EAD3', color: '#6B0F1A', borderBottom: '2px solid #D4AF37' }}>
                      <th style={{ padding: '0.6rem 0.8rem' }}>{lang === 'te' ? 'గ్రహం' : 'Graha'}</th>
                      <th style={{ padding: '0.6rem 0.8rem' }}>{lang === 'te' ? 'రాశి' : 'Rashi'}</th>
                      <th style={{ padding: '0.6rem 0.8rem' }}>{lang === 'te' ? 'నక్షత్రం' : 'Nakshatra'}</th>
                      <th style={{ padding: '0.6rem 0.8rem' }}>{lang === 'te' ? 'పాద' : 'Pada'}</th>
                      <th style={{ padding: '0.6rem 0.8rem' }}>{lang === 'te' ? 'గతి' : 'Motion'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grahas.map((g, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #E8DFCE',
                          background: idx % 2 === 0 ? '#FCFAF6' : '#FFFFFF',
                        }}
                      >
                        <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#6B0F1A' }}>
                          {lang === 'te' ? g.name_telugu : g.name_english}
                        </td>
                        <td style={{ padding: '0.6rem 0.8rem' }}>
                          {lang === 'te' ? g.rashi.telugu : g.rashi.english} ({g.rashi.degrees.toFixed(2)}°)
                        </td>
                        <td style={{ padding: '0.6rem 0.8rem' }}>
                          {lang === 'te' ? g.nakshatra.telugu : g.nakshatra.english}
                        </td>
                        <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>
                          {g.nakshatra.pada}
                        </td>
                        <td style={{ padding: '0.6rem 0.8rem' }}>
                          {g.is_retrograde ? (
                            <span style={{ color: '#C0392B', fontWeight: 600 }}>
                              {lang === 'te' ? 'వక్ర (R)' : 'Retrograde (R)'}
                            </span>
                          ) : (
                            <span style={{ color: '#27AE60' }}>
                              {lang === 'te' ? 'ఋజు' : 'Direct'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
