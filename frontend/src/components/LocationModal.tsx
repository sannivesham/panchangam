import React, { useState, useEffect } from 'react';
import { LocationItem } from '../types/panchangam';
import { searchLocations } from '../api/client';
import { MapPin, Search, X, Compass } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationItem;
  onSelectLocation: (loc: LocationItem) => void;
  lang: 'te' | 'en';
}

export const LocationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      searchLocations(searchTerm).then(setLocations).catch(console.error);
    }
  }, [isOpen, searchTerm]);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      onSelectLocation({
        id: 'custom',
        name: `Custom (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
        name_telugu: `ప్రత్యేక ప్రదేశం (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
        state: 'Custom',
        state_telugu: 'ప్రత్యేకం',
        country: 'Global',
        latitude: lat,
        longitude: lon,
        elevation_m: 0,
        timezone: 'Asia/Kolkata',
      });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="#D4AF37" />
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
              {lang === 'te' ? 'ప్రదేశాన్ని ఎంచుకోండి' : 'Select Location'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFF',
              cursor: 'pointer',
            }}
          >
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8E7C68',
              }}
            />
            <input
              type="text"
              placeholder={
                lang === 'te'
                  ? 'నగరం లేదా రాష్ట్రం పేరుతో శోధించండి...'
                  : 'Search by city or state name...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                borderRadius: '8px',
                border: '1px solid #D4AF37',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4
              style={{
                fontSize: '0.88rem',
                color: '#6B0F1A',
                fontWeight: 700,
                marginBottom: '0.5rem',
              }}
            >
              {lang === 'te' ? 'ప్రముఖ నగరాలు (తెలంగాణ & ఆంధ్రప్రదేశ్)' : 'Key Cities (AP & Telangana)'}
            </h4>
            <div className="city-pill-grid">
              {locations.map((loc) => {
                const isActive = currentLocation.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    className={`city-pill ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {lang === 'te' ? loc.name_telugu : loc.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#776655' }}>
                      {lang === 'te' ? loc.state_telugu : loc.state}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Lat/Long toggle */}
          <div style={{ borderTop: '1px solid #E8DFCE', paddingTop: '1rem' }}>
            <button
              onClick={() => setShowCustom(!showCustom)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B0F1A',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Compass size={18} />
              {lang === 'te' ? 'కస్టమ్ అక్షాంశ / రేఖాంశాలు నమోదు చేయండి' : 'Enter Custom Coordinates'}
            </button>

            {showCustom && (
              <form onSubmit={handleCustomSubmit} style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (e.g. 17.38)"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  required
                  style={{
                    flex: '1 1 120px',
                    padding: '0.5rem',
                    border: '1px solid #C59B27',
                    borderRadius: '6px',
                  }}
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude (e.g. 78.48)"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  required
                  style={{
                    flex: '1 1 120px',
                    padding: '0.5rem',
                    border: '1px solid #C59B27',
                    borderRadius: '6px',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#6B0F1A',
                    color: '#FFF',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'te' ? 'వర్తించు' : 'Apply'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
