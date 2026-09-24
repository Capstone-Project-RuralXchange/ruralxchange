import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { specialistAPI } from '../utils/api';
import { SPECIALIST_TYPES, KARNATAKA_DISTRICTS, formatCurrency } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiRefreshCw, FiNavigation, FiCrosshair } from 'react-icons/fi';

const SpecialistCard = ({ item }) => {
  const { t } = useTranslation();
  const sp = SPECIALIST_TYPES.find(s => s.value === item.specialization) || { label: item.specialization, icon: '👤', tier: 'skilled' };
  const tierConfig = {
    professional: { bg: '#F0FFF4', color: 'var(--leaf)', label: 'Professional' },
    skilled: { bg: '#FFF8E8', color: 'var(--harvest)', label: 'Skilled Worker' },
    labour: { bg: '#F5F5F5', color: 'var(--text-muted)', label: 'Labour' },
  };
  const tier = tierConfig[sp.tier] || tierConfig.skilled;

  return (
    <Link to={`/specialists/${item._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ cursor: 'pointer' }}>
        <div style={{ padding: '1.5rem' }}>
          {/* Top row */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '16px', fontSize: '1.8rem',
              background: tier.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, border: `2px solid ${tier.color}30`, position: 'relative',
            }}>
              {sp.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--soil)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.user?.name || 'Specialist'}
                </h3>
                {item.user?.isVerified && <FiCheckCircle style={{ color: 'var(--leaf)', flexShrink: 0 }} size={16} title="Verified" />}
              </div>
              <span style={{ display: 'inline-block', background: tier.bg, color: tier.color, fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '20px', marginTop: '0.2rem' }}>
                {t(tier.label)} · {t(sp.label)}
              </span>
            </div>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {t(item.district)}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>· {item.experience} {t("yrs exp")}</span>
            {item.languages?.length > 0 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>· {item.languages.slice(0,2).join(', ')}</span>
            )}
          </div>

          {/* Distance Badge */}
          {item.distanceKm != null && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(45,27,14,0.08)', color: 'var(--soil)',
              fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px',
              marginBottom: '0.75rem'
            }}>
              📍 {item.distanceKm < 1 ? '<1' : item.distanceKm} km {t("away")}
            </div>
          )}

          {/* Skills */}
          {item.skills?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
              {item.skills.map((skill) => (
                <span key={skill} style={{ fontSize: '0.78rem', background: 'var(--bg-secondary)', color: 'var(--text)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{skill}</span>
              ))}
            </div>
          )}
        </div> {/* close padding div */}
      </div> {/* close card div */}
    </Link>
  );
};

export default function SpecialistsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('user_gps_coords');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [locationStatus, setLocationStatus] = useState(() => {
    return localStorage.getItem('user_gps_coords') ? 'granted' : 'idle';
  });
  const [filters, setFilters] = useState({
    specialization: searchParams.get('specialization') || searchParams.get('type') || '',
    district: searchParams.get('district') || '',
    status: 'available',
    tier: ''
  });

  // Handle GPS location capture
  const handleGetLocation = (highAccuracy = true) => {
    if (!('geolocation' in navigator)) {
      alert(t("Geolocation is not supported by your browser"));
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        };
        setUserLocation(coords);
        setLocationStatus('granted');
        try {
          localStorage.setItem('user_gps_coords', JSON.stringify(coords));
        } catch (e) {}
      },
      (err) => {
        console.warn('Geolocation denied:', err.message);
        setLocationStatus('denied');
      },
      { timeout: 10000, enableHighAccuracy: highAccuracy, maximumAge: 60000 }
    );
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setLocationStatus('idle');
    try {
      localStorage.removeItem('user_gps_coords');
    } catch (e) {}
  };

  // Request browser geolocation on mount if not already saved
  useEffect(() => {
    if (!userLocation && locationStatus === 'idle' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
          };
          setUserLocation(coords);
          setLocationStatus('granted');
          try {
            localStorage.setItem('user_gps_coords', JSON.stringify(coords));
          } catch (e) {}
        },
        (err) => {
          console.warn('Geolocation auto-detect failed:', err.message);
          setLocationStatus('denied');
        },
        { timeout: 6000, enableHighAccuracy: false }
      );
    }
  }, [userLocation, locationStatus]);

  const fetchSpecialists = useCallback(async () => {
    if (page === 1) setLoading(true);
    try {
      const params = { limit: 12, page, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      // Pass coordinates for distance sorting
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      const res = await specialistAPI.getAll(params);
      const items = res.data.data || [];
      const totalItems = res.data.total || 0;
      const totalPages = res.data.pages || 1;
      
      if (page === 1) {
        setSpecialists(items);
      } else {
        setSpecialists(prev => [...prev, ...items]);
      }
      setHasMore(page < totalPages);
      setTotal(totalItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, userLocation]);

  useEffect(() => { fetchSpecialists(); }, [fetchSpecialists]);

  const handleFilter = (key, value) => {
    setFilters(p => ({ ...p, [key]: value }));
    setPage(1);
  };
  const clearFilters = () => {
    setFilters({ specialization: '', district: '', status: 'available', tier: '' });
    setPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--leaf), #1A4A1A)', padding: '2.5rem 0 1.5rem', color: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800 }}>👷 {t("Find Specialists")}</h1>
              <p style={{ color: '#A8D5A2', marginTop: '0.4rem' }}>
                {total > 0 ? `${total} ${t("specialists available")}` : t('Skilled workers and professionals near you')}
              </p>
            </div>

            {/* GPS Button in Header */}
            <div>
              {locationStatus !== 'granted' && (
                <button
                  onClick={() => handleGetLocation(true)}
                  disabled={locationStatus === 'loading'}
                  className="btn"
                  style={{
                    background: 'var(--harvest)', color: 'var(--soil)',
                    border: 'none', borderRadius: '30px', padding: '0.5rem 1.1rem',
                    fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)', cursor: 'pointer'
                  }}>
                  {locationStatus === 'loading' ? (
                    <>
                      <div style={{ width: 14, height: 14, border: '2px solid var(--soil)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      {t("Getting GPS...")}
                    </>
                  ) : (
                    <>
                      <FiCrosshair size={16} /> {t("📍 Use Current Location")}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Location Status Text */}
          <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            {locationStatus === 'loading' && (
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--harvest)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                {t("Detecting your location...")}
              </span>
            )}
            {locationStatus === 'granted' && (
              <span style={{ fontSize: '0.8rem', color: '#A8D5A2', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <FiNavigation size={14} /> {t("Sorted by distance — nearest first")}
              </span>
            )}
            {locationStatus === 'denied' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  📍 {t("Location access denied — showing default order")}
                </span>
                <button
                  onClick={() => handleGetLocation(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--harvest)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: 0 }}>
                  ({t("Enable GPS")})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <select className="form-select" style={{ flex: '1 1 180px' }}
            value={filters.specialization} onChange={e => handleFilter('specialization', e.target.value)}>
            <option value="">{t("All Specializations")}</option>
            {SPECIALIST_TYPES.map(s => <option key={s.value} value={s.value}>{s.icon} {t(s.label)}</option>)}
          </select>

          <select className="form-select" style={{ flex: '1 1 160px' }}
            value={filters.district} onChange={e => handleFilter('district', e.target.value)}>
            <option value="">{t("All Districts")}</option>
            {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{t(d)}</option>)}
          </select>

          <select className="form-select" style={{ flex: '1 1 140px' }}
            value={filters.tier} onChange={e => handleFilter('tier', e.target.value)}>
            <option value="">{t("All Skill Levels")}</option>
            <option value="professional">{t("Professional (Engineers, Agronomists)")}</option>
            <option value="skilled">{t("Skilled Worker (Operators, Mechanics)")}</option>
          </select>

          <select className="form-select" style={{ flex: '1 1 140px' }}
            value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
            <option value="">{t("Any Status")}</option>
            <option value="available">{t("available")}</option>
            <option value="booked">{t("booked")}</option>
          </select>

          {(filters.specialization || filters.district || filters.tier) && (
            <button onClick={clearFilters} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiRefreshCw size={14} /> {t("Clear")}
            </button>
          )}
        </div>

        {/* Tier tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { value: '', label: t('All'), icon: '👥' },
            { value: 'professional', label: t('Professionals'), icon: '🏛️' },
            { value: 'skilled', label: t('Skilled Workers'), icon: '⚙️' },
            { value: 'labour', label: t('Field Labour'), icon: '👷' },
          ].map(tab => (
            <button key={tab.value} onClick={() => { handleFilter('tier', tab.value); handleFilter('specialization', ''); }}
              style={{
                padding: '0.4rem 1rem', borderRadius: '100px', border: '1.5px solid',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: filters.tier === tab.value ? 'var(--leaf)' : 'white',
                color: filters.tier === tab.value ? 'white' : 'var(--text-secondary)',
                borderColor: filters.tier === tab.value ? 'var(--leaf)' : 'var(--border)',
              }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[...Array(9)].map((_, i) => <div key={i} className="skeleton" style={{ height: 220 }} />)}
          </div>
        ) : specialists.length > 0 ? (
          <>
            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{t("Showing")} {specialists.length} {t("of")} {total} {t("results")}</span>
              {userLocation && (
                <span style={{ fontSize: '0.8rem', color: 'var(--leaf)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiNavigation size={12} /> {t("Nearest first")}
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {specialists.map(item => <SpecialistCard key={item._id} item={item} />)}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="btn btn-outline"
                  style={{ minWidth: '200px' }}
                >
                  {loading ? t("Loading...") : t("Load More")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👷</div>
            <h3 style={{ color: 'var(--text-secondary)' }}>{t("No specialists found")}</h3>
            <p>{t("Try adjusting your filters or")} <button onClick={clearFilters} style={{ color: 'var(--terracotta)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{t("clear all filters")}</button></p>
          </div>
        )}
      </div>
    </div>
  );
}
