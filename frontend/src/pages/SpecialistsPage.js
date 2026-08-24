import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { specialistAPI } from '../utils/api';
import { SPECIALIST_TYPES, KARNATAKA_DISTRICTS, formatCurrency } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

const SpecialistCard = ({ item }) => {
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
              flexShrink: 0, border: `2px solid ${tier.color}30`,
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
                {tier.label} · {sp.label}
              </span>
            </div>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {item.district}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>· {item.experience} yrs exp</span>
            {item.languages?.length > 0 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>· {item.languages.slice(0,2).join(', ')}</span>
            )}
          </div>

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
  const [filters, setFilters] = useState({
    specialization: searchParams.get('type') || '',
    district: '',
    status: 'available',
    tier: ''
  });

  const fetchSpecialists = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 20, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await specialistAPI.getAll(params);
      setSpecialists(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchSpecialists(); }, [fetchSpecialists]);

  const handleFilter = (key, value) => setFilters(p => ({ ...p, [key]: value }));
  const clearFilters = () => setFilters({ specialization: '', district: '', status: 'available', tier: '' });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--leaf), #1A4A1A)', padding: '2.5rem 0 1.5rem', color: 'white' }}>
        <div className="container">
          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800 }}>👷 {t("Find Specialists")}</h1>
          <p style={{ color: '#A8D5A2', marginTop: '0.4rem' }}>
            {total > 0 ? `${total} ${t("specialists available")}` : t('Skilled workers and professionals near you')}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <select className="form-select" style={{ flex: '1 1 180px' }}
            value={filters.specialization} onChange={e => handleFilter('specialization', e.target.value)}>
            <option value="">{t("All Specializations")}</option>
            {SPECIALIST_TYPES.map(s => <option key={s.value} value={s.value}>{t(s.label)}</option>)}
          </select>

          <select className="form-select" style={{ flex: '1 1 160px' }}
            value={filters.district} onChange={e => handleFilter('district', e.target.value)}>
            <option value="">{t("All Districts")}</option>
            {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
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
            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {t("Showing")} {specialists.length} {t("of")} {total} {t("results")}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {specialists.map(item => <SpecialistCard key={item._id} item={item} />)}
            </div>
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
