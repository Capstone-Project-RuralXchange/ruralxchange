import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { specialistAPI, ratingAPI } from '../utils/api';
import { SPECIALIST_TYPES, formatCurrency, formatDate } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiArrowLeft, FiStar } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const SpecialistDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [specialist, setSpecialist] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
          const spRes = await specialistAPI.getById(id);
          setSpecialist(spRes.data.data);
        } catch (err) {
          console.error(err);
          toast.error(t('Failed to load specialist details'));
        }
        try {
          const ratRes = await ratingAPI.getSpecialistRatings(id);
          setRatings(ratRes.data.data || []);
        } catch (err) {
          console.error(err);
        }
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!specialist) return <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}><h2>{t("Specialist not found")}</h2><Link to="/specialists" className="btn btn-primary" style={{ marginTop: '1rem' }}>{t("Back")}</Link></div>;

  const sp = SPECIALIST_TYPES.find(s => s.value === specialist.specialization) || { label: specialist.specialization, icon: '👤', tier: 'skilled' };
  const tierConfig = {
    professional: { bg: '#F0FFF4', color: 'var(--leaf)', label: 'Professional Service' },
    skilled: { bg: '#FFF8E8', color: 'var(--clay)', label: 'Skilled Worker' },
    labour: { bg: '#F5F5F5', color: 'var(--text-muted)', label: 'Field Labour' },
  };
  const tier = tierConfig[sp.tier] || tierConfig.skilled;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 500 }}>
          <FiArrowLeft /> {t("Back")}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          <div>
            {/* Profile header */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '20px', fontSize: '2.5rem',
                  background: tier.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, border: `2px solid ${tier.color}30`,
                }}>
                  {sp.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--soil)' }}>{specialist.user?.name}</h1>
                    {specialist.user?.isVerified && <FiCheckCircle style={{ color: 'var(--leaf)' }} size={22} />}
                  </div>
                  <span style={{ display: 'inline-block', background: tier.bg, color: tier.color, fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '20px', marginBottom: '0.5rem' }}>
                    {t(tier.label)} · {t(sp.label)}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>📍 {t(specialist.district)}{specialist.village && `, ${specialist.village}`}</span>
                    <span>💼 {specialist.experience} {t("years experience")}</span>
                    {specialist.rating?.count > 0 && (
                      <span style={{ color: 'var(--harvest)', fontWeight: 700 }}>
                        ★ {Number(specialist.rating.average).toFixed(1)} ({specialist.rating.count} {t("reviews")})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Status */}
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, color: 'var(--terracotta)', fontSize: '1.4rem' }}>{formatCurrency(specialist.pricePerDay)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t("per day")}</div>
                </div>
                {specialist.pricePerHour && (
                  <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 800, color: 'var(--clay)', fontSize: '1.4rem' }}>{formatCurrency(specialist.pricePerHour)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t("per hour")}</div>
                  </div>
                )}
                <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                  <span className={`badge badge-${specialist.availabilityStatus}`} style={{ fontSize: '0.8rem' }}>
                    {t(specialist.availabilityStatus)}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{t("status")}</div>
                </div>
              </div>

              {/* Languages */}
              {specialist.languages?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{t("Languages")}</h4>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {specialist.languages.map(lang => (
                      <span key={lang} style={{ background: 'var(--bg-dark)', color: 'var(--clay)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {t(lang)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {specialist.skills?.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{t("Skills")}</h4>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {specialist.skills.map(skill => (
                      <span key={skill} style={{ background: `${tier.color}15`, color: tier.color, padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        ✓ {t(skill)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Qualifications */}
            {specialist.qualifications?.length > 0 && (
              <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1rem' }}>{t("Qualifications")}</h3>
                {specialist.qualifications.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}>
                    <div style={{ width: 40, height: 40, background: 'var(--leaf)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🎓</div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--soil)' }}>{q.degree}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{q.institution} · {q.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews */}
            {ratings.length > 0 && (
              <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1rem' }}>{t("Reviews")} ({ratings.length})</h3>
                {ratings.slice(0, 5).map((r, i) => (
                  <div key={i} style={{ borderBottom: i < Math.min(ratings.length, 5) - 1 ? '1px solid var(--border)' : 'none', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <strong style={{ color: 'var(--soil)', fontSize: '0.9rem' }}>{r.ratedBy?.name || t('Anonymous')}</strong>
                      <span style={{ color: 'var(--harvest)', fontWeight: 700 }}>{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span>
                    </div>
                    {(r.review || r.comment) && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.review || r.comment}</p>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{formatDate(r.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking panel */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '1.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
              <h3 style={{ fontWeight: 800, color: 'var(--soil)', marginBottom: '0.3rem' }}>{t("Book")} {t(sp.label)}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                {formatCurrency(specialist.pricePerDay)}/{t("day")} + {t("platform fee")}
              </div>

              {specialist.availabilityStatus === 'available' ? (
                user ? (
                  <Link to={`/book/specialist/${specialist._id}`} className="btn btn-secondary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                    👷 {t("Book This Specialist")}
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                    {t("Login to Book")}
                  </Link>
                )
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', background: '#FFF3CD', borderRadius: 'var(--radius)', color: '#856404', fontWeight: 600 }}>
                  {t("Currently")} {t(specialist.availabilityStatus)}
                </div>
              )}

              <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '1rem', lineHeight: 1.8 }}>
                <div>✓ {specialist.completedJobs || 0} {t("jobs completed")}</div>
                {specialist.user?.isVerified && <div>✓ {t("Identity verified")}</div>}
                <div>✓ {t("Dual rating system")}</div>
                <div>✓ {t("Cash / UPI accepted")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistDetailPage;
