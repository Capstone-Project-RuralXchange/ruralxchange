import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiAlertCircle, FiTool } from 'react-icons/fi';
import { equipmentAPI } from '../utils/api';
import { EQUIPMENT_CATEGORIES, KARNATAKA_DISTRICTS } from '../utils/constants';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
const FUEL_TYPES = ['Diesel', 'Petrol', 'Electric', 'Manual', 'LPG', 'Not Applicable'];
const CONDITIONS = ['Excellent', 'Good', 'Fair'];

export default function ListEquipmentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', category: 'Tractor', description: '', brand: '', model: '', yearOfManufacture: '',
    pricePerDay: '', pricePerHour: '', minimumRentalDays: 1, maximumRentalDays: 30,
    district: 'Bengaluru Urban', village: '', state: 'Karnataka',
    fuelType: 'Diesel', condition: 'Good', operatorIncluded: false,
    requiresSpecialist: false, features: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.pricePerDay) return toast.error(t('Please fill required fields'));
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        features: form.features ? form.features.split(',').map(s => s.trim()).filter(Boolean) : [],
        yearOfManufacture: form.yearOfManufacture ? Number(form.yearOfManufacture) : undefined,
        pricePerDay: Number(form.pricePerDay),
        pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : undefined,
        minimumRentalDays: Number(form.minimumRentalDays),
        maximumRentalDays: Number(form.maximumRentalDays),
      };
      await equipmentAPI.create(payload);
      toast.success(t('Equipment listed successfully! 🎉'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to list equipment'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--soil), #3d2510)', padding: '2.5rem 0' }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.5rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiTool size={28} color="var(--harvest)" />
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800 }}>{t("List Your Equipment")}</h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>{t("Earn by renting out your idle machinery")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 700, paddingTop: '2rem' }}>
        {/* Steps */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: '1.5rem', border: '1px solid var(--sand)', width: 'fit-content' }}>
          {[t('Basic Info'), t('Pricing & Rental'), t('Location')].map((s, i) => (
            <button key={s} onClick={() => setStep(i+1)}
              style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                background: step === i+1 ? 'var(--terracotta)' : 'transparent', color: step === i+1 ? 'white' : 'var(--clay)' }}>
              {step > i+1 ? <FiCheck style={{ display: 'inline', marginRight: 4 }} /> : null}{s}
            </button>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: '2rem' }}>
          {step === 1 && (
            <>
              <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1.25rem' }}>{t("Equipment Details")}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Equipment Title *")}</label>
                  <input className="form-input" placeholder={t("Title Placeholder Equipment")} value={form.title} onChange={e => set('title', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Category *")}</label>
                  <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                    {EQUIPMENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{t(c.label)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Condition")}</label>
                  <select className="form-input" value={form.condition} onChange={e => set('condition', e.target.value)}>
                    {CONDITIONS.map(c => <option key={c}>{t(c)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Brand")}</label>
                  <input className="form-input" placeholder="e.g. Mahindra, John Deere" value={form.brand} onChange={e => set('brand', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Model")}</label>
                  <input className="form-input" placeholder="e.g. 575 DI" value={form.model} onChange={e => set('model', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Year of Manufacture")}</label>
                  <input className="form-input" type="number" placeholder="2018" value={form.yearOfManufacture} onChange={e => set('yearOfManufacture', e.target.value)} min="1990" max="2024" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Fuel Type")}</label>
                  <select className="form-input" value={form.fuelType} onChange={e => set('fuelType', e.target.value)}>
                    {FUEL_TYPES.map(f => <option key={f}>{t(f)}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Description")}</label>
                  <textarea className="form-input" rows={3} placeholder={t("Equipment Description Placeholder")} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Features (comma-separated)")}</label>
                  <input className="form-input" placeholder="GPS tracking, AC Cabin, Power Steering, 4WD" value={form.features} onChange={e => set('features', e.target.value)} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.operatorIncluded} onChange={e => set('operatorIncluded', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--terracotta)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.9rem' }}>{t("Operator Included")}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.requiresSpecialist} onChange={e => set('requiresSpecialist', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--terracotta)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.9rem' }}>{t("Requires Specialist (Bundle Only)")}</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1.25rem' }}>{t("Pricing & Availability")}</h3>
              <div style={{ background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.3)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.85rem', color: '#b8860b' }}>
                <FiAlertCircle /> {t("Platform fee notice")}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Price Per Day (₹) *")}</label>
                  <input className="form-input" type="number" placeholder="1500" value={form.pricePerDay} onChange={e => set('pricePerDay', e.target.value)} min="0" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Price Per Hour (₹) — optional")}</label>
                  <input className="form-input" type="number" placeholder="200" value={form.pricePerHour} onChange={e => set('pricePerHour', e.target.value)} min="0" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Minimum Rental (days)")}</label>
                  <input className="form-input" type="number" value={form.minimumRentalDays} onChange={e => set('minimumRentalDays', e.target.value)} min="1" max="30" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Maximum Rental (days)")}</label>
                  <input className="form-input" type="number" value={form.maximumRentalDays} onChange={e => set('maximumRentalDays', e.target.value)} min="1" max="365" />
                </div>
              </div>
              {form.pricePerDay && (
                <div style={{ marginTop: '1rem', background: 'rgba(45,106,45,0.1)', borderRadius: 10, padding: '1rem', fontSize: '0.9rem' }}>
                  <p style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: 4 }}>{t("Estimated Earnings")}</p>
                  <p style={{ color: 'var(--leaf)' }}>{t("Per day")}: <strong>₹{Math.round(form.pricePerDay * 0.95)}</strong> · {t("Per week")}: <strong>₹{Math.round(form.pricePerDay * 0.95 * 7)}</strong> · {t("Per month")}: <strong>₹{Math.round(form.pricePerDay * 0.95 * 30)}</strong></p>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1.25rem' }}>{t("Location Details")}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Village / Town")}</label>
                  <input className="form-input" placeholder="e.g. Kanakapura" value={form.village} onChange={e => set('village', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("District *")}</label>
                  <select className="form-input" value={form.district} onChange={e => set('district', e.target.value)}>
                    {KARNATAKA_DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: '1.75rem' }}>
            {step > 1 && <button className="btn btn-outline" onClick={() => setStep(s => s-1)}>← {t("Previous")}</button>}
            {step < 3 ? (
              <button className="btn btn-primary" onClick={() => setStep(s => s+1)} style={{ marginLeft: 'auto' }}>{t("Next")} →</button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ marginLeft: 'auto', padding: '0.75rem 2rem' }}>
                {submitting ? t('Listing...') : `🚜 ${t('List Equipment CTA')}`}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
