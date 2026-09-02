import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { equipmentAPI } from '../utils/api';
import { EQUIPMENT_CATEGORIES, KARNATAKA_DISTRICTS, formatCurrency, getEquipmentCategory } from '../utils/constants';
import { FiFilter, FiSearch, FiRefreshCw, FiNavigation } from 'react-icons/fi';

const EquipmentCard = ({ item }) => {
  const { t } = useTranslation();
  const cat = getEquipmentCategory(item.category);
  return (
    <Link to={`/equipment/${item._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ cursor: 'pointer' }}>
        <div style={{
          height: 180, background: 'var(--cream)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem',
          position: 'relative', borderBottom: `3px solid ${cat.color}30`
        }}>
          {cat.icon}
          {item.requiresSpecialist && (
            <span style={{
              position: 'absolute', top: '0.6rem', right: '0.6rem',
              background: 'rgba(45,106,45,0.9)', color: 'white',
              fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '20px'
            }}>
              + {t("Operator Available")}
            </span>
          )}
          {/* Distance Badge */}
          {item.distanceKm != null && (
            <span style={{
              position: 'absolute', top: '0.6rem', left: '0.6rem',
              background: 'rgba(45,27,14,0.85)', color: '#E8D5B0',
              fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '20px',
              display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)'
            }}>
              📍 {item.distanceKm < 1 ? '<1' : item.distanceKm} km
            </span>
          )}
        </div>
        <div style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: cat.color, background: `${cat.color}18`, padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
              {cat.icon} {t(cat.label)}
            </span>
            <span className={`badge badge-${item.availabilityStatus}`} style={{ fontSize: '0.68rem' }}>
              {t(item.availabilityStatus)}
            </span>
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--soil)', marginBottom: '0.25rem', lineHeight: 1.3 }}>{item.title}</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            📍 {item.district} {item.village && `· ${item.village}`}
          </div>
          {item.condition && (
            <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              {t("Condition")}: <strong>{t(item.condition)}</strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--terracotta)', fontSize: '1.1rem' }}>
                {formatCurrency(item.pricePerDay)}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/{t("day")}</span>
              </div>
              {item.pricePerHour && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.pricePerHour}/{t("hr")}</div>
              )}
            </div>
            {item.rating?.count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--harvest)' }}>★</span>
                <strong>{Number(item.rating.average).toFixed(1)}</strong>
                <span style={{ color: 'var(--text-muted)' }}>({item.rating.count})</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.875rem', padding: '0.6rem' }}>
              Book Now
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const EquipmentPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | granted | denied
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    district: searchParams.get('district') || '',
    status: 'available',
    minPrice: '',
    maxPrice: '',
  });

  // Request browser geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('granted');
        },
        (err) => {
          console.warn('Geolocation denied:', err.message);
          setLocationStatus('denied');
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    }
  }, []);

  const fetchEquipment = useCallback(async () => {
    try {
      if (page === 1) setLoading(true);
      const params = { ...filters, page, limit: 12 };
      // Pass coordinates for distance sorting
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      const res = await equipmentAPI.getAll(params);
      const items = res.data.data || [];
      const totalItems = res.data.total || 0;
      const totalPages = res.data.pages || 1;
      if (page === 1) {
        setEquipment(items);
      } else {
        setEquipment(prev => [...prev, ...items]);
      }
      setHasMore(page < totalPages);
      setTotal(totalItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, userLocation]);

  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: '', district: '', status: 'available', minPrice: '', maxPrice: '' });
    setPage(1);
  };

  const hasActiveFilters = filters.category || filters.district || filters.minPrice || filters.maxPrice;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--soil)', padding: '2.5rem 0 1.5rem', color: 'white' }}>
        <div className="container">
          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800 }}>🚜 {t("Browse Equipment")}</h1>
          <p style={{ color: '#C4A070', marginTop: '0.4rem' }}>
            {total > 0 ? `${total} ${t("listings available")}` : t('Find equipment near you')}
          </p>
          {/* Location Status */}
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            {locationStatus === 'loading' && (
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--harvest)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                {t("Detecting your location...")}
              </span>
            )}
            {locationStatus === 'granted' && (
              <span style={{ fontSize: '0.8rem', color: 'var(--harvest)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <FiNavigation size={14} /> {t("Sorted by distance — nearest first")}
              </span>
            )}
            {locationStatus === 'denied' && (
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
                📍 {t("Location access denied — showing default order")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Filter Bar */}
        <div style={{
          background: 'white', borderRadius: 'var(--radius-lg)',
          padding: '1.25rem', marginBottom: '2rem',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center',
        }}>
          <select className="form-select" style={{ flex: '1 1 160px', minWidth: 140 }}
            value={filters.category} onChange={e => handleFilterChange('category', e.target.value)}>
            <option value="">{t("All Categories")}</option>
            {EQUIPMENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
          </select>

          <select className="form-select" style={{ flex: '1 1 160px', minWidth: 140 }}
            value={filters.district} onChange={e => handleFilterChange('district', e.target.value)}>
            <option value="">{t("All Districts")}</option>
            {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select className="form-select" style={{ flex: '1 1 140px' }}
            value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
            <option value="">{t("Any Status")}</option>
            <option value="available">{t("available")}</option>
            <option value="booked">{t("booked")}</option>
          </select>

          <input type="number" className="form-input" placeholder={t("Min ₹")} style={{ flex: '0 1 100px', minWidth: 80 }}
            value={filters.minPrice} onChange={e => handleFilterChange('minPrice', e.target.value)} />
          <input type="number" className="form-input" placeholder={t("Max ₹")} style={{ flex: '0 1 100px', minWidth: 80 }}
            value={filters.maxPrice} onChange={e => handleFilterChange('maxPrice', e.target.value)} />

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiRefreshCw size={14} /> {t("Clear")}
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button onClick={() => handleFilterChange('category', '')}
            style={{ padding: '0.35rem 0.85rem', borderRadius: '100px', border: '1.5px solid', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: !filters.category ? 'var(--terracotta)' : 'white',
              color: !filters.category ? 'white' : 'var(--text-secondary)',
              borderColor: !filters.category ? 'var(--terracotta)' : 'var(--border)',
            }}>
            {t("All")}
          </button>
          {EQUIPMENT_CATEGORIES.slice(0, 8).map(cat => (
            <button key={cat.value} onClick={() => handleFilterChange('category', cat.value === filters.category ? '' : cat.value)}
              style={{ padding: '0.35rem 0.85rem', borderRadius: '100px', border: '1.5px solid', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: filters.category === cat.value ? cat.color : 'white',
                color: filters.category === cat.value ? 'white' : 'var(--text-secondary)',
                borderColor: filters.category === cat.value ? cat.color : 'var(--border)',
              }}>
              {cat.icon} {t(cat.label)}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.5rem' }}>
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : equipment.length > 0 ? (
          <>
            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{t("Showing")} {equipment.length} {t("of")} {total} {t("results")}</span>
              {userLocation && (
                <span style={{ fontSize: '0.8rem', color: 'var(--leaf)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiNavigation size={12} /> {t("Nearest first")}
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.5rem' }}>
              {equipment.map(item => <EquipmentCard key={item._id} item={item} />)}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t("No equipment found")}</h3>
            <p>{t("Try adjusting your filters or")} <button onClick={clearFilters} style={{ color: 'var(--terracotta)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{t("clear all filters")}</button></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentPage;
