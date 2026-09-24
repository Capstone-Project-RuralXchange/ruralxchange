import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiInfo, FiCheckCircle, FiUser, FiPackage, FiClock } from 'react-icons/fi';
import { GiToolbox } from 'react-icons/gi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../context/AuthContext';
import { equipmentAPI, specialistAPI, bookingAPI } from '../utils/api';
import { formatCurrency, getDurationDays, SPECIALIST_TYPES } from '../utils/constants';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function BookingPage() {
  const { t } = useTranslation();
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const [equipment, setEquipment] = useState(null);
  const [specialist, setSpecialist] = useState(null);
  const [availableSpecialists, setAvailableSpecialists] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState(searchParams.get('specialistId') || '');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [windowValue, setWindowValue] = useState(6);
  const [windowUnit, setWindowUnit] = useState('hours');
  const [autoCancelOnExpiry, setAutoCancelOnExpiry] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const isBundle = type === 'bundle';
  const isSpecialistOnly = type === 'specialist';
  const days = getDurationDays(startDate, endDate);

  useEffect(() => {
    const load = async () => {
      try {
        if (isSpecialistOnly) {
          const res = await specialistAPI.getById(id);
          setSpecialist(res.data.data);
        } else {
          const res = await equipmentAPI.getById(id);
          setEquipment(res.data.data);
          if (isBundle) {
            const spRes = await specialistAPI.getAll({ limit: 20 });
            setAvailableSpecialists(spRes.data.data || []);
          }
        }
      } catch (err) {
        toast.error(t('Failed to load details'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, type, isBundle, isSpecialistOnly]);

  const equipmentCost = equipment && days > 0 ? equipment.pricePerDay * days : 0;
  const specialistCost = (isBundle && selectedSpecialist && availableSpecialists.find(s => s._id === selectedSpecialist))
    ? (availableSpecialists.find(s => s._id === selectedSpecialist)?.pricePerDay || 800) * days
    : isSpecialistOnly && specialist && days > 0 ? (specialist.pricePerDay || 800) * days : 0;
  const totalBeforeFee = equipmentCost + specialistCost;
  const platformFee = Math.round(totalBeforeFee * 0.05);
  const totalCost = totalBeforeFee + platformFee;

  const calculateAcceptanceHours = (val, unit) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    if (unit === 'weeks') return num * 168;
    if (unit === 'days') return num * 24;
    return num;
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) return toast.error(t('Please select booking dates'));
    if (days < 1) return toast.error(t('End date must be after start date'));
    if (isBundle && !selectedSpecialist) return toast.error(t('Please select a specialist for bundle booking'));

    const winHours = calculateAcceptanceHours(windowValue, windowUnit);

    setSubmitting(true);
    try {
      const payload = {
        bookingType: isBundle ? 'bundle' : isSpecialistOnly ? 'specialist_only' : 'equipment_only',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        specialRequirements: notes,
        purpose: notes || 'General agricultural work',
        acceptanceWindowHours: winHours,
        autoCancelOnExpiry: Boolean(autoCancelOnExpiry),
        location: {
          district: user?.district || 'Bengaluru Urban',
          village: user?.village || ''
        },
        ...(equipment && { equipmentId: equipment._id }),
        ...(isSpecialistOnly && specialist ? { specialistId: specialist._id } : {}),
        ...(isBundle && selectedSpecialist ? { specialistId: selectedSpecialist } : {}),
      };
      await bookingAPI.create(payload);
      toast.success(t('Booking confirmed! 🎉'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || t('Booking failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--sand)', borderTopColor: 'var(--terracotta)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const subject = equipment || specialist;
  if (!subject) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--clay)' }}>{t("Not found")}</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--clay)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--terracotta)', fontWeight: 600, padding: 0 }}>← {t("Back")}</button>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--soil)' }}>
              {isBundle ? t('🚜 Bundle Booking') : isSpecialistOnly ? t('👷 Hire Specialist') : t('🔧 Book Equipment')}
            </h1>
            {isBundle && <p style={{ color: 'var(--clay)', marginTop: 4 }}>{t("Equipment + Specialist in one seamless transaction")}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left: Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Item Summary */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, var(--terracotta), var(--harvest))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSpecialistOnly ? <GiToolbox size={28} color="white" /> : <FiPackage size={28} color="white" />}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: 2 }}>
                      {isSpecialistOnly ? specialist.user?.name : equipment.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--clay)' }}>
                      {t(isSpecialistOnly ? specialist.specialization : equipment.category)} · {t(isSpecialistOnly ? specialist.district : equipment.district)}
                    </p>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, color: 'var(--terracotta)', fontSize: '1.1rem' }}>
                      {formatCurrency(isSpecialistOnly ? specialist.pricePerDay || 800 : equipment.pricePerDay)}/{t("day")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="card" style={{ padding: '1.5rem', overflow: 'visible', position: 'relative', zIndex: 20 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiCalendar color="var(--terracotta)" /> {t("Select Dates")}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Start Date")}</label>
                    <DatePicker
                      selected={startDate}
                      onChange={setStartDate}
                      minDate={new Date()}
                      placeholderText={t("Pick start date")}
                      dateFormat="dd MMM yyyy"
                      className="form-input"
                      style={{ width: '100%' }}
                      popperPlacement="bottom-start"
                      portalId="root"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("End Date")}</label>
                    <DatePicker
                      selected={endDate}
                      onChange={setEndDate}
                      minDate={startDate || new Date()}
                      placeholderText={t("Pick end date")}
                      dateFormat="dd MMM yyyy"
                      className="form-input"
                      style={{ width: '100%' }}
                      popperPlacement="bottom-start"
                      portalId="root"
                    />
                  </div>
                </div>
                {days > 0 && (
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', background: 'rgba(45,106,45,0.1)', borderRadius: 8, color: 'var(--leaf)', fontWeight: 600, fontSize: '0.9rem' }}>
                    ✓ {days} {t("day")}{days > 1 ? t('s') : ''} {t("selected")}
                  </div>
                )}
              </div>

              {/* Acceptance Window Selection */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem' }}>
                  <FiClock color="var(--terracotta)" /> {t("Provider Response Window")}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--clay)', marginBottom: '1rem' }}>
                  {t("Select how long the provider has to accept before you are notified or auto-cancelled:")}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    min="1"
                    max={windowUnit === 'weeks' ? 4 : windowUnit === 'days' ? 30 : 168}
                    value={windowValue}
                    onChange={e => {
                      const v = e.target.value;
                      setWindowValue(v === '' ? '' : Math.max(1, parseInt(v, 10) || 1));
                    }}
                    className="form-input"
                    style={{ width: 90, height: 42, fontSize: '1rem', fontWeight: 700, textAlign: 'center' }}
                    placeholder="6"
                  />
                  <select
                    value={windowUnit}
                    onChange={e => setWindowUnit(e.target.value)}
                    className="form-input"
                    style={{ width: 130, height: 42, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', background: 'white' }}>
                    <option value="hours">{t("Hours")}</option>
                    <option value="days">{t("Days")}</option>
                    <option value="weeks">{t("Weeks")}</option>
                  </select>

                  {windowUnit !== 'hours' && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--clay)', fontWeight: 600 }}>
                      (= {calculateAcceptanceHours(windowValue, windowUnit)} {t("Hours")})
                    </span>
                  )}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem', color: 'var(--soil)', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={autoCancelOnExpiry}
                    onChange={e => setAutoCancelOnExpiry(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--terracotta)' }}
                  />
                  <span>{t("Auto-cancel and notify me if provider does not accept before deadline")}</span>
                </label>
              </div>

              {/* Bundle: Select Specialist */}
              {isBundle && (
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <GiToolbox color="var(--leaf)" /> {t("Select Specialist")}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--clay)', marginBottom: '1rem' }}>{t("Choose someone to operate this equipment")}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {availableSpecialists.slice(0, 6).map(sp => (
                      <div key={sp._id} onClick={() => setSelectedSpecialist(sp._id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', borderRadius: 10, border: `2px solid ${selectedSpecialist === sp._id ? 'var(--leaf)' : 'var(--sand)'}`, cursor: 'pointer', background: selectedSpecialist === sp._id ? 'rgba(45,106,45,0.08)' : 'white', transition: 'all 0.2s' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--leaf), var(--harvest))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiUser color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, color: 'var(--soil)', fontSize: '0.9rem' }}>{sp.user?.name}</p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--clay)' }}>{t(sp.specialization)} · ⭐ {sp.rating?.average?.toFixed(1) || t('New')}</p>
                        </div>
                        <p style={{ fontWeight: 700, color: 'var(--terracotta)', fontSize: '0.9rem' }}>{formatCurrency(sp.pricePerDay || 800)}/{t("day")}</p>
                        {selectedSpecialist === sp._id && <FiCheckCircle color="var(--leaf)" size={20} />}
                      </div>
                    ))}
                    {availableSpecialists.length === 0 && (
                      <p style={{ color: 'var(--clay)', textAlign: 'center', padding: '1rem' }}>{t("No specialists available right now")}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiInfo color="var(--harvest)" /> {t("Additional Notes (optional)")}
                </h3>
                <textarea className="form-input" rows={3} placeholder={t("Any specific requirements, delivery instructions, or special requests...")}
                  value={notes} onChange={e => setNotes(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
            </div>

            {/* Right: Pricing Summary */}
            <div style={{ position: 'sticky', top: 80 }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1rem' }}>{t("Booking Summary")}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                  {equipment && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--clay)' }}>
                      <span>{t("Equipment")} ({days || '?'} {t("days")})</span>
                      <span style={{ fontWeight: 600, color: 'var(--soil)' }}>{formatCurrency(equipmentCost)}</span>
                    </div>
                  )}
                  {(isBundle && selectedSpecialist) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--clay)' }}>
                      <span>{t("Specialist")} ({days || '?'} {t("days")})</span>
                      <span style={{ fontWeight: 600, color: 'var(--soil)' }}>{formatCurrency(specialistCost)}</span>
                    </div>
                  )}
                  {isSpecialistOnly && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--clay)' }}>
                      <span>{t("Service")} ({days || '?'} {t("days")})</span>
                      <span style={{ fontWeight: 600, color: 'var(--soil)' }}>{formatCurrency(specialistCost)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--clay)' }}>
                    <span>{t("Platform fee (5%)")}</span>
                    <span style={{ fontWeight: 600, color: 'var(--soil)' }}>{formatCurrency(platformFee)}</span>
                  </div>
                  <div style={{ height: 1, background: 'var(--sand)', margin: '0.25rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--soil)', fontSize: '1.1rem' }}>
                    <span>{t("Total")}</span>
                    <span style={{ color: 'var(--terracotta)' }}>{formatCurrency(totalCost)}</span>
                  </div>
                </div>

                {isBundle && (
                  <div style={{ background: 'rgba(45,106,45,0.1)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--leaf)' }}>
                    💡 {t("Bundle booking saves coordination hassle — equipment & operator confirmed together!")}
                  </div>
                )}

                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !startDate || !endDate}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', fontWeight: 700,
                    opacity: (!startDate || !endDate) ? 0.5 : 1 }}>
                  {submitting ? t('Confirming...') : `${t("Confirm Booking")} · ${formatCurrency(totalCost)}`}
                </button>

                <p style={{ fontSize: '0.78rem', color: 'var(--clay)', textAlign: 'center', marginTop: '0.75rem' }}>
                  {t("Payment collected on delivery. No advance required.")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
