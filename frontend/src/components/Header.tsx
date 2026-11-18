import React from 'react';
import { LocationItem } from '../types/panchangam';
import { MapPin, Globe, Calendar, Clock, Sparkles, BookOpen } from 'lucide-react';

interface Props {
  currentLocation: LocationItem;
  onOpenLocationModal: () => void;
  lang: 'te' | 'en';
  onToggleLang: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<Props> = ({
  currentLocation,
  onOpenLocationModal,
  lang,
  onToggleLang,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="logo-section">
          <div className="om-symbol">ॐ</div>
          <div className="title-group">
            <h1>{lang === 'te' ? 'తెలుగు పంచాంగం & క్యాలెండర్' : 'Telugu Panchangam & Calendar'}</h1>
            <p>
              {lang === 'te'
                ? 'దృక్సిద్ధాంత ఖగోళ పంచాంగం • లాహిరి అయనాంశం'
                : 'Drik Siddhanta Astronomical Ephemeris • Lahiri Ayanamsa'}
            </p>
          </div>
        </div>

        <div className="header-controls">
          <button className="btn-pill" onClick={onOpenLocationModal} title="Change Location">
            <MapPin size={16} color="#D4AF37" />
            <span>
              {lang === 'te' ? currentLocation.name_telugu : currentLocation.name}
            </span>
          </button>

          <button className="btn-pill btn-lang" onClick={onToggleLang} title="Switch Language">
            <Globe size={16} />
            <span>{lang === 'te' ? 'English' : 'తెలుగు'}</span>
          </button>
        </div>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-tab ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => onSelectTab('today')}
        >
          {lang === 'te' ? 'నేటి పంచాంగం' : "Today's Panchangam"}
        </button>
        <button
          className={`nav-tab ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => onSelectTab('monthly')}
        >
          {lang === 'te' ? 'మాస పంచాంగం' : 'Monthly Calendar'}
        </button>
        <button
          className={`nav-tab ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => onSelectTab('daily')}
        >
          {lang === 'te' ? 'వివరమైన దిన పంచాంగం' : 'Daily Detailed'}
        </button>
        <button
          className={`nav-tab ${activeTab === 'festivals' ? 'active' : ''}`}
          onClick={() => onSelectTab('festivals')}
        >
          {lang === 'te' ? 'పండుగలు & వ్రతాలు' : 'Festivals & Vratams'}
        </button>
        <button
          className={`nav-tab ${activeTab === 'yearly' ? 'active' : ''}`}
          onClick={() => onSelectTab('yearly')}
        >
          {lang === 'te' ? 'వార్షిక వివరాలు' : 'Yearly Overview'}
        </button>
      </nav>
    </header>
  );
};
