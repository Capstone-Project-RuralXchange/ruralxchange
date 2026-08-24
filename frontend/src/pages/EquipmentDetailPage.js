import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { equipmentAPI, ratingAPI } from '../utils/api';
import { getEquipmentCategory, formatCurrency, formatDate, SPECIALIST_TYPES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiMapPin, FiUser, FiStar, FiArrowLeft, FiCheckCircle, FiPackage } from 'react-icons/fi';

const EquipmentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eqRes = await equipmentAPI.getById(id);
        setEquipment(eqRes.data.data);
        try {
          const ratRes = await ratingAPI.getEquipmentRatings(id);
          setRatings(ratRes.data.data || []);
        } catch (err) {
          console.error("Failed to fetch ratings", err);
          setRatings([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)' }}>{t("Loading equipment details...")}</p>
    </div>
  );

  if (!equipment) return (
    <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
      <h2>{t("Equipment not found")}</h2>
      <Link to="/equipment" className="btn btn-primary" style={{ marginTop: '1rem' }}>{t("Back to Equipment")}</Link>
    </div>
  );

  const cat = getEquipmentCategory(equipment.category);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 500 }}>
          <FiArrowLeft /> {t("Back")}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
          {/* Left - Details */}
          <div>
            {/* Hero image / icon */}
            <div style={{
              height: 280, background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)`,
              borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '7rem', marginBottom: '1.5rem',
              border: `2px solid ${cat.color}30`, position: 'relative',
            }}>
              {cat.icon}
              <span className={`badge badge-${equipment.availabilityStatus}`} style={{
                position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.85rem',
              }}>
                {equipment.availabilityStatus === 'available' ? `✓ ${t("Available")}` : t(equipment.availabilityStatus)}
              </span>
            </div>

            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cat.color, background: `${cat.color}15`, padding: '0.2rem 0.6rem', borderRadius: '20px', marginBottom: '0.5rem', display: 'inline-block' }}>
                    {cat.icon} {t(cat.label)}
                  </span>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--soil)', marginBottom: '0.5rem' }}>{equipment.title}</h1>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--terracotta)' }}>
                    {formatCurrency(equipment.pricePerDay)}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t("per day")}</div>
                  {equipment.pricePerHour && <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>₹{equipment.pricePerHour}/{t("hr")}</div>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <FiMapPin /> {equipment.district}{equipment.village && `, ${equipment.village}`}
                </div>
                {equipment.rating?.count > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiStar style={{ color: 'var(--harvest)' }} />
                    <strong>{Number(equipment.rating.average).toFixed(1)}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({equipment.rating.count} {t("reviews")})</span>
                  </div>
                )}
                <span style={{ background: '#E8F5E8', color: 'var(--leaf)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                  {t("Condition")}: {t(equipment.condition)}
                </span>
              </div>

              {equipment.description && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{equipment.description}</p>
              )}

              {/* Specs */}
              {(equipment.brand || equipment.horsePower || equipment.fuelType || equipment.year) && (
                <div>
                  <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '0.75rem' }}>{t("Specifications")}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                    {equipment.brand && (
                      <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>{t("BRAND")}</div>
                        <div style={{ fontWeight: 700, color: 'var(--soil)' }}>{equipment.brand}</div>
                      </div>
                    )}
                    {equipment.horsePower && (
                      <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>{t("HORSEPOWER")}</div>
                        <div style={{ fontWeight: 700, color: 'var(--soil)' }}>{equipment.horsePower} {t("HP")}</div>
                      </div>
                    )}
                    {equipment.fuelType && (
                      <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>{t("FUEL TYPE")}</div>
                        <div style={{ fontWeight: 700, color: 'var(--soil)', textTransform: 'capitalize' }}>{equipment.fuelType}</div>
                      </div>
                    )}
                    {equipment.year && (
                      <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>{t("YEAR")}</div>
                        <div style={{ fontWeight: 700, color: 'var(--soil)' }}>{equipment.year}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Compatible Specialists */}
              {equipment.requiresSpecialist && equipment.compatibleSpecialistTypes?.length > 0 && (
                <div style={{ marginTop: '1.5rem', background: '#F0FFF4', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid #C8E6C9' }}>
                  <h4 style={{ color: 'var(--leaf)', marginBottom: '0.5rem', fontWeight: 700 }}>
                    <FiPackage style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                    {t("Bundle with a Specialist")}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {t("This equipment works best with a certified operator. You can book a bundle (equipment + operator) in one transaction.")}
                  </p>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {equipment.compatibleSpecialistTypes.map(type => {
                      const sp = SPECIALIST_TYPES.find(s => s.value === type);
                      return sp ? (
                        <span key={type} style={{ background: 'white', border: '1px solid #C8E6C9', borderRadius: '20px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--leaf)' }}>
                          {sp.icon} {sp.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Owner Info */}
            {equipment.owner && (
              <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--soil)' }}>{t("Equipment Owner")}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--terracotta), var(--harvest))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0
                  }}>
                    {(equipment.owner?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: 'var(--soil)' }}>{equipment.owner.name}</strong>
                      {equipment.owner.isVerified && <FiCheckCircle style={{ color: 'var(--leaf)' }} size={14} />}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📍 {equipment.owner.district}</div>
                    {equipment.owner.rating?.count > 0 && (
                      <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--harvest)' }}>
                        ★ <strong>{Number(equipment.owner.rating.average).toFixed(1)}</strong>
                        <span style={{ color: 'var(--text-muted)' }}>({equipment.owner.rating.count})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ratings */}
            {ratings.length > 0 && (
              <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--soil)' }}>
                  {t("Reviews")} ({ratings.length})
                </h3>
                {ratings.slice(0, 5).map((r, i) => (
                  <div key={i} style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: i < ratings.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--soil)' }}>{r.ratedBy?.name || 'Anonymous'}</strong>
                      <div style={{ color: 'var(--harvest)', fontWeight: 700 }}>{'★'.repeat(r.score)}{'☆'.repeat(5-r.score)}</div>
                    </div>
                    {r.review && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.review}</p>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{formatDate(r.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right - Booking Panel */}
          <div style={{ position: 'sticky', top: '80px', height: 'fit-content' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '1.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
              <h3 style={{ fontWeight: 800, color: 'var(--soil)', marginBottom: '0.3rem' }}>{t("Book This Equipment")}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                {formatCurrency(equipment.pricePerDay)}/{t("day")} + {t("platform fee")}
              </div>

              {equipment.availabilityStatus === 'available' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {user ? (
                    <>
                      <Link to={`/book/equipment/${equipment._id}`}
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', justifyContent: 'center' }}>
                        🚜 {t("Book Equipment Only")}
                      </Link>
                      {equipment.requiresSpecialist && (
                        <Link to={`/book/bundle/${equipment._id}`}
                          className="btn btn-secondary btn-lg"
                          style={{ width: '100%', justifyContent: 'center' }}>
                          📦 {t("Bundle Booking (+ Operator)")}
                        </Link>
                      )}
                    </>
                  ) : (
                    <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                      {t("Login to Book")}
                    </Link>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', background: '#FFF3CD', borderRadius: 'var(--radius)', color: '#856404', fontWeight: 600 }}>
                  {t("Currently")} {t(equipment.availabilityStatus)}
                </div>
              )}

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  <div>✓ {t("Instant confirmation")}</div>
                  <div>✓ {t("Dual rating system")}</div>
                  <div>✓ {t("Cash / UPI payment options")}</div>
                  <div>✓ {t("5% platform fee on total")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){
          .detail-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
};

export default EquipmentDetailPage;
