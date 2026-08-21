import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import { GiWheat, GiSunflower } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { seasonalAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SEASON_COLORS = {
  Kharif: { bg: '#f0fdf4', border: '#86efac', text: '#15803d', badge: '#dcfce7' },
  Rabi: { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8', badge: '#dbeafe' },
  Zaid: { bg: '#fef9ee', border: '#fcd34d', text: '#b45309', badge: '#fef3c7' },
  'Pre-Kharif': { bg: '#fdf4ff', border: '#d8b4fe', text: '#7e22ce', badge: '#f3e8ff' },
};

export default function SeasonalPage() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());

  useEffect(() => {
    seasonalAPI.getCalendar()
      .then(res => setData(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = data[activeMonth];
  const colors = active ? SEASON_COLORS[active.season] || SEASON_COLORS['Zaid'] : null;

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
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ background: colors?.badge, color: colors?.text, padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: '0.85rem' }}>
                      {t(active.season)} {t("Season")}
                    </span>
                    <h2 style={{ fontWeight: 800, color: 'var(--soil)', fontSize: '1.5rem' }}>{t(MONTHS[activeMonth])} — {t(active.month)}</h2>
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
                  {(active.topEquipment || []).map((eq, i) => (
                    <div key={eq} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 8, background: i === 0 ? 'rgba(232,160,32,0.1)' : 'transparent' }}>
                      <span style={{ fontWeight: 800, color: colors?.text, fontSize: '0.85rem', minWidth: 20 }}>#{i+1}</span>
                      <span style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.9rem', flex: 1 }}>{t(eq)}</span>
                      {i === 0 && <span style={{ fontSize: '0.75rem', background: colors?.badge, color: colors?.text, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{t("Peak")}</span>}
                    </div>
                  ))}
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
                  {(active.topServices || []).map((svc, i) => (
                    <div key={svc} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 8, background: i === 0 ? 'rgba(45,106,45,0.1)' : 'transparent' }}>
                      <span style={{ fontWeight: 800, color: 'var(--leaf)', fontSize: '0.85rem', minWidth: 20 }}>#{i+1}</span>
                      <span style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.9rem', flex: 1 }}>{t(svc)}</span>
                      {i === 0 && <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: 'var(--leaf)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{t("Peak")}</span>}
                    </div>
                  ))}
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
                  const mc = SEASON_COLORS[m.season] || {};
                  return (
                    <div key={m.month} onClick={() => setActiveMonth(i)}
                      style={{ padding: '0.875rem 1rem', borderRadius: 10, border: `2px solid ${activeMonth === i ? mc.border : 'var(--sand)'}`,
                        background: activeMonth === i ? mc.bg : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, color: 'var(--soil)', fontSize: '0.9rem' }}>{t(MONTHS[i])}</span>
                        <span style={{ background: mc.badge, color: mc.text, padding: '1px 7px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>{t(m.season)}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--clay)', lineHeight: 1.4 }}>{t(m.topEquipment?.[0])}</p>
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
