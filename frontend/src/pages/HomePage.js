import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { equipmentAPI, specialistAPI, seasonalAPI, requirementAPI } from '../utils/api';
import { EQUIPMENT_CATEGORIES, SPECIALIST_TYPES, KARNATAKA_DISTRICTS, getEquipmentCategory, formatCurrency } from '../utils/constants';
import { FiArrowRight, FiSearch, FiStar, FiCheckCircle, FiTrendingUp, FiUsers, FiPackage, FiMapPin } from 'react-icons/fi';
import { GiWheat, GiFarmer } from 'react-icons/gi';

const StarRating = ({ rating, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
    <span style={{ color: 'var(--harvest)' }}>★</span>
    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{Number(rating).toFixed(1)}</span>
    {count !== undefined && <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>({count})</span>}
  </div>
);

const EquipmentCard = ({ item }) => {
  const { t } = useTranslation();
  const cat = getEquipmentCategory(item.category);
  return (
    <Link to={`/equipment/${item._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ cursor: 'pointer' }}>
        <div style={{
          height: 140, background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem',
          borderBottom: `3px solid ${cat.color}33`
        }}>
          {cat.icon}
        </div>
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--soil)', lineHeight: 1.3 }}>{item.title}</h3>
            <span className={`badge badge-${item.availabilityStatus}`} style={{ fontSize: '0.7rem', flexShrink: 0, marginLeft: '0.5rem' }}>
              {t(item.availabilityStatus)}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            📍 {t(item.district)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 800, color: 'var(--terracotta)', fontSize: '1.05rem' }}>
                {formatCurrency(item.pricePerDay)}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/day</span>
            </div>
            {item.rating?.count > 0 && <StarRating rating={item.rating.average} count={item.rating.count} />}
          </div>
        </div>
      </div>
    </Link>
  );
};

const SpecialistCard = ({ item }) => {
  const { t } = useTranslation();
  const sp = SPECIALIST_TYPES.find(s => s.value === item.specialization) || { label: item.specialization, icon: '👤', value: item.specialization };
  const tierColors = { professional: 'var(--leaf)', skilled: 'var(--clay)', labour: 'var(--text-muted)' };
  return (
    <Link to={`/specialists/${item._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ cursor: 'pointer', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '14px', fontSize: '1.6rem',
            background: 'linear-gradient(135deg, #FFF5EC, #FFE8D0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--border)', flexShrink: 0
          }}>
            {sp.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--soil)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.user?.name || 'Specialist'}
            </h3>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: tierColors[sp.tier] || 'var(--text-muted)' }}>
              {t(sp.value || sp.label)}
            </div>
          </div>
          {item.user?.isVerified && (
            <FiCheckCircle style={{ color: 'var(--leaf)', flexShrink: 0 }} title="Verified" />
          )}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          📍 {t(item.district)} · {item.experience} {t('yrs exp')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 800, color: 'var(--terracotta)' }}>{formatCurrency(item.pricePerDay)}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/day</span>
          </div>
          <span className={`badge badge-${item.availabilityStatus}`} style={{ fontSize: '0.7rem' }}>
            {t(item.availabilityStatus)}
          </span>
        </div>
      </div>
    </Link>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [seasonal, setSeasonal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eqRes, spRes, seaRes] = await Promise.all([
          equipmentAPI.getAll({ limit: 6 }),
          specialistAPI.getAll({ limit: 6 }),
          seasonalAPI.getCurrent(),
        ]);
        setEquipment(eqRes.data.data || []);
        setSpecialists(spRes.data.data || []);
        setSeasonal(seaRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/equipment${district ? `?district=${district}` : ''}`);
  };

  const stats = [
    { icon: <FiPackage />, value: '500+', label: t('Equipment Listed'), color: 'var(--terracotta)' },
    { icon: <GiFarmer />, value: '300+', label: t('Skilled Workers'), color: 'var(--leaf)' },
    { icon: <FiUsers />, value: '1000+', label: t('Happy Seekers'), color: 'var(--harvest)' },
    { icon: <FiMapPin />, value: '31', label: t('Districts Covered'), color: 'var(--clay)' },
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{
        background: `linear-gradient(135deg, var(--soil) 0%, var(--bark) 50%, #3D2010 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(232,160,32,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(45,106,45,0.10) 0%, transparent 50%)`,
        }} />
        <div style={{
          position: 'absolute', top: '10%', right: '5%', fontSize: '12rem', opacity: 0.04, lineHeight: 1
        }}>🌾</div>
        <div style={{
          position: 'absolute', bottom: '5%', left: '3%', fontSize: '8rem', opacity: 0.05, lineHeight: 1
        }}>🚜</div>

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '4rem 1.5rem' }}>
          <div style={{ maxWidth: 720 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(232,160,32,0.15)', border: '1px solid rgba(232,160,32,0.3)',
              borderRadius: '100px', padding: '0.4rem 1rem', marginBottom: '1.5rem',
              fontSize: '0.85rem', color: 'var(--wheat)',
            }}>
              <span>🌱</span>
              <span>{t("Karnataka's Rural Service Marketplace")}</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.25rem',
              letterSpacing: '-1px',
            }}>
              {t("One Booking.")}<br />
              <span style={{
                background: 'linear-gradient(135deg, var(--harvest), #FFB020)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{t("Equipment + Operator.")}</span><br />
              {t("Done.")}
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#C4A070', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 580 }}>
              {t("Hero Description")}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{
              display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem',
              background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
              padding: '0.75rem', borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <input
                type="text"
                placeholder={t("Search Placeholder")}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, minWidth: 200, padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 'var(--radius)', color: 'white', fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                style={{
                  padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 'var(--radius)', color: district ? 'white' : '#A08060',
                  fontSize: '0.9rem', outline: 'none', minWidth: 160,
                }}
              >
                <option value="" style={{ color: 'var(--soil)' }}>{t("All Districts")}</option>
                {KARNATAKA_DISTRICTS.map(d => (
                  <option key={d} value={d} style={{ color: 'var(--soil)' }}>{t(d)}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
                <FiSearch /> {t("Search")}
              </button>
            </form>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/equipment" className="btn btn-primary btn-lg">
                {t("Browse Equipment")} <FiArrowRight />
              </Link>
              <Link to="/specialists" className="btn btn-ghost btn-lg">
                {t("Find Specialists")} <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section style={{ background: 'white', padding: '3rem 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <div style={{ fontSize: '2rem', color: stat.color, marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--soil)', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      </section>

      {/* CATEGORY ICONS */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{t("Browse by Category")}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{t("Browse by Category Desc")}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
            {EQUIPMENT_CATEGORIES.map(cat => (
              <Link
                key={cat.value}
                to={`/equipment?category=${cat.value}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
                  padding: '1.25rem 0.75rem', borderRadius: 'var(--radius-lg)',
                  background: 'white', border: '1.5px solid var(--border)',
                  cursor: 'pointer', transition: 'all 0.2s',
                  textAlign: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = cat.color;
                  e.currentTarget.style.background = `${cat.color}10`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${cat.color}30`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t(cat.value)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - BUNDLE BOOKING HIGHLIGHT */}
      <section style={{ background: 'linear-gradient(135deg, var(--soil), var(--bark))', padding: '5rem 0', color: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(232,160,32,0.2)', border: '1px solid rgba(232,160,32,0.3)',
              borderRadius: '100px', padding: '0.4rem 1rem', marginBottom: '1rem',
              fontSize: '0.85rem', color: 'var(--wheat)',
            }}>
              ⭐ {t("Core Innovation")}
            </div>
            <h2 style={{ color: 'white', fontSize: '2.2rem', marginBottom: '0.75rem' }}>{t("Bundle Booking Title")}</h2>
            <p style={{ color: '#B8997A', maxWidth: 600, margin: '0 auto' }}>
              {t("Bundle Booking Desc")}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: '01', icon: '📋', title: t('Post Your Need'), desc: t('Post Your Need Desc'), color: '#E8A020' },
              { step: '02', icon: '🔍', title: t('Smart Matching'), desc: t('Smart Matching Desc'), color: '#5A8C3C' },
              { step: '03', icon: '📦', title: t('Bundle Confirm'), desc: t('Bundle Confirm Desc'), color: '#C1440E' },
              { step: '04', icon: '✅', title: t('Job Done!'), desc: t('Job Done! Desc'), color: '#3B82F6' },
            ].map((step, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem 1.5rem',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '12px',
                  background: `${step.color}25`, border: `2px solid ${step.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', marginBottom: '1rem',
                }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: step.color, letterSpacing: '2px', marginBottom: '0.4rem' }}>
                  STEP {step.step}
                </div>
                <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ color: '#B8997A', fontSize: '0.875rem', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              {t("Get Started Free")} <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* SEASONAL DEMAND */}
      {seasonal && (
        <section className="section" style={{ background: 'var(--bg-dark)' }}>
          <div className="container">
            <div style={{
              background: 'linear-gradient(135deg, #FFF8E8, #FFE8CC)',
              border: '1.5px solid #E8C070',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              display: 'flex', flexWrap: 'wrap',
              gap: '2rem', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ flex: 1, minWidth: 250 }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{seasonal.icon}</div>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--soil)', marginBottom: '0.5rem' }}>
                  {t(seasonal.season)}
                </h2>
                <p style={{ color: 'var(--clay)', marginBottom: '1rem', fontWeight: 500 }}>
                  {t(seasonal.message)}
                </p>
                <Link to="/seasonal" className="btn btn-primary">
                  {t("View Full Calendar")} <FiArrowRight />
                </Link>
              </div>
              <div style={{ flex: 1, minWidth: 250 }}>
                <h4 style={{ color: 'var(--bark)', marginBottom: '0.75rem', fontWeight: 700 }}>🔥 {t("In High Demand Now")}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {seasonal.top?.map(item => {
                    const cat = EQUIPMENT_CATEGORIES.find(c => c.value === item) || SPECIALIST_TYPES.find(s => s.value === item);
                    return cat ? (
                      <span key={item} style={{
                        background: 'white', border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius-full)', padding: '0.35rem 0.9rem',
                        fontSize: '0.85rem', fontWeight: 600, color: 'var(--clay)',
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}>
                        {(cat.icon || '📦')} {t(cat.value)}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED EQUIPMENT */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>{t("Featured Equipment")}</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t("Available now in your area")}</p>
            </div>
            <Link to="/equipment" className="btn btn-outline">{t("View All")} <FiArrowRight /></Link>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {equipment.map(item => <EquipmentCard key={item._id} item={item} />)}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED SPECIALISTS */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>{t("Verified Specialists")}</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t("Verified Specialists Desc")}</p>
            </div>
            <Link to="/specialists" className="btn btn-outline">{t("View All")} <FiArrowRight /></Link>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180 }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {specialists.map(item => <SpecialistCard key={item._id} item={item} />)}
            </div>
          )}
        </div>
      </section>

      {/* PROFESSIONAL SERVICES SECTION */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #F0FFF4, #E8F5E8)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--soil)' }}>{t("Professional Services Tier")}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {t("Professional Services Tier Desc")}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🌱', title: t('Agronomist'), desc: t('Agronomist Desc'), link: '/specialists?specialization=agronomist' },
              { icon: '🏛️', title: t('Civil Engineer'), desc: t('Civil Engineer Desc'), link: '/specialists?specialization=civil_engineer' },
              { icon: '🔌', title: t('Electrical Engineer'), desc: t('Electrical Engineer Desc'), link: '/specialists?specialization=electrical_engineer' },
              { icon: '🐄', title: t('Animal Health Worker'), desc: t('Animal Health Worker Desc'), link: '/specialists?specialization=animal_health_worker' },
            ].map((item, i) => (
              <Link key={i} to={item.link} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'white', borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem', border: '1.5px solid #C8E6C9',
                  transition: 'all 0.2s', cursor: 'pointer',
                  textAlign: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(45,106,45,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--leaf)', marginBottom: '0.4rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: 'var(--terracotta)', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', fontSize: '2.2rem', marginBottom: '1rem' }}>
            {t("Final CTA Title")}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
            {t("Final CTA Desc")}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--terracotta)', fontWeight: 700 }}>
              {t("Create Free Account")} <FiArrowRight />
            </Link>
            <Link to="/list-equipment" className="btn btn-ghost btn-lg">
              {t("List Your Equipment CTA")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
