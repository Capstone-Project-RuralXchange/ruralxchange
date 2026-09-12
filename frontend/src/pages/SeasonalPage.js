import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { GiWheat, GiSunflower } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { seasonalAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';
import { getEquipmentCategory, getSpecialistType } from '../utils/constants';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getSeasonTheme = (seasonStr = '') => {
  const s = seasonStr.toLowerCase();
  if (s.includes('kharif')) return { bg: '#f0fdf4', border: '#86efac', text: '#15803d', badge: '#dcfce7' };
  if (s.includes('rabi')) return { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8', badge: '#dbeafe' };
  if (s.includes('summer')) return { bg: '#fef9ee', border: '#fcd34d', text: '#b45309', badge: '#fef3c7' };
  if (s.includes('wedding') || s.includes('festival') || s.includes('post-harvest')) return { bg: '#fdf4ff', border: '#d8b4fe', text: '#7e22ce', badge: '#f3e8ff' };
  return { bg: '#fef9ee', border: '#fcd34d', text: '#b45309', badge: '#fef3c7' };
};

export default function SeasonalPage() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());

  useEffect(() => {
    seasonalAPI.getCalendar()
      .then(res => {
        const raw = res.data.data || {};
        const arr = Array.from({ length: 12 }, (_, i) => {
          const m = raw[i + 1] || {};
          return {
            month: MONTHS[i],
            monthFull: MONTHS_FULL[i],
            season: m.season || '',
            topEquipment: m.top || m.topEquipment || [],
            topServices: m.services || m.topServices || [],
            message: m.message || '',
            icon: m.icon || '',
            isLiveDynamic: m.isLiveDynamic || false,
            totalSignals: m.totalSignals || 0,
          };
        });
        setData(arr);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = data[activeMonth];
  const colors = active ? getSeasonTheme(active.season) : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a4d1a 0%, var(--leaf) 50%, var(--harvest) 100%)', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.5rem' }}>
            <GiSunflower size={28} color="var(--harvest)" />
            <span style={{ color: 'var(--harvest)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>{t("Karnataka Agri Calendar")}</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t("Seasonal Demand Board")}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 520 }}>
            {t("Know which equipment and specialists are in peak demand each month. Plan your bookings ahead.")}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Month Selector */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: '2rem', paddingBottom: 4 }}>
          {MONTHS.map((m, i) => {
            const isSelected = activeMonth === i;
            return (
              <button
                key={m}
                onClick={() => setActiveMonth(i)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 100,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--soil)' : 'white',
                  color: isSelected ? 'white' : 'var(--clay)',
                  boxShadow: isSelected ? '0 4px 12px rgba(92,64,51,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                {t(m)}
                {i === new Date().getMonth() && <span style={{ display: 'block', fontSize: '0.65rem', textAlign: 'center', opacity: 0.7 }}>{t("Now")}</span>}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[1,2,3,4].map(i => <div key={i} className="card skeleton" style={{ height: 200 }} />)}
          </div>
        ) : active ? (
          <motion.div key={activeMonth} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Month Header */}
            <div className="card" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', background: colors?.bg, border: `2px solid ${colors?.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: colors?.badge, color: colors?.text, padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: '0.85rem' }}>
                      {t(active.season)}
                    </span>
                    {active.isLiveDynamic && (
                      <span style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        🔥 {t("Live Platform Demand Active")}
                      </span>
                    )}
                    <h2 style={{ fontWeight: 800, color: 'var(--soil)', fontSize: '1.5rem', width: '100%', marginTop: 2 }}>
                      {t(active.monthFull)} {active.icon}
                    </h2>
                  </div>
                  <p style={{ color: 'var(--clay)', fontSize: '0.95rem', maxWidth: 560 }}>{t(active.message)}</p>
                </div>
                <GiWheat size={48} color={colors?.border} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Top Equipment */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  🚜 {t("High-Demand Equipment")}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(active.topEquipment || []).map((eq, i) => {
                    const cat = getEquipmentCategory(eq);
                    return (
                      <Link
                        key={eq}
                        to={`/equipment?category=${eq}`}
                        style={{ textDecoration: 'none' }}>
                        <div
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.75rem 0.875rem', borderRadius: 10,
                            background: i === 0 ? 'rgba(232,160,32,0.12)' : 'rgba(0,0,0,0.02)',
                            border: `1px solid ${i === 0 ? 'rgba(232,160,32,0.3)' : 'transparent'}`,
                            transition: 'all 0.2s', cursor: 'pointer'
                          }}>
                          <span style={{ fontWeight: 800, color: colors?.text, fontSize: '0.85rem', minWidth: 20 }}>#{i+1}</span>
                          <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                          <span style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.92rem', flex: 1 }}>
                            {t(cat.label)}
                          </span>
                          {i === 0 && <span style={{ fontSize: '0.75rem', background: colors?.badge, color: colors?.text, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{t("Peak")}</span>}
                          <FiArrowRight size={14} color="var(--clay)" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link to="/equipment" className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                  {t("Browse Available Equipment")} <FiChevronRight />
                </Link>
              </div>

              {/* Top Services */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  👷 {t("High-Demand Services")}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(active.topServices || []).map((svc, i) => {
                    const sp = getSpecialistType(svc);
                    return (
                      <Link
                        key={svc}
                        to={`/specialists?specialization=${svc}`}
                        style={{ textDecoration: 'none' }}>
                        <div
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.75rem 0.875rem', borderRadius: 10,
                            background: i === 0 ? 'rgba(45,106,45,0.1)' : 'rgba(0,0,0,0.02)',
                            border: `1px solid ${i === 0 ? 'rgba(45,106,45,0.3)' : 'transparent'}`,
                            transition: 'all 0.2s', cursor: 'pointer'
                          }}>
                          <span style={{ fontWeight: 800, color: 'var(--leaf)', fontSize: '0.85rem', minWidth: 20 }}>#{i+1}</span>
                          <span style={{ fontSize: '1.2rem' }}>{sp.icon}</span>
                          <span style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.92rem', flex: 1 }}>
                            {t(sp.label)}
                          </span>
                          {i === 0 && <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: 'var(--leaf)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{t("Peak")}</span>}
                          <FiArrowRight size={14} color="var(--clay)" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link to="/specialists" className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                  {t("Find Specialists")} <FiChevronRight />
                </Link>
              </div>
            </div>

            {/* All Months Overview */}
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1rem' }}>{t("Full Year at a Glance")}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {data.map((m, i) => {
                  const mc = getSeasonTheme(m.season);
                  const firstCat = getEquipmentCategory(m.topEquipment?.[0]);
                  return (
                    <div key={m.month} onClick={() => setActiveMonth(i)}
                      style={{ padding: '0.875rem 1rem', borderRadius: 10, border: `2px solid ${activeMonth === i ? mc.border : 'var(--sand)'}`,
                        background: activeMonth === i ? mc.bg : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, color: 'var(--soil)', fontSize: '0.9rem' }}>{t(MONTHS[i])} {m.icon}</span>
                        <span style={{ background: mc.badge, color: mc.text, padding: '1px 7px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>{t(m.season)}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--clay)', lineHeight: 1.4, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{firstCat.icon}</span> <span>{t(firstCat.label)}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--clay)' }}>
            <p>{t("Seasonal data not available")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

