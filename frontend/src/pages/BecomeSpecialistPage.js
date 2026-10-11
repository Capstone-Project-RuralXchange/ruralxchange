import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import { GiToolbox } from 'react-icons/gi';
import { specialistAPI } from '../utils/api';
import { KARNATAKA_DISTRICTS, LANGUAGES, SPECIALIST_TYPES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const TIERS = [
  { value: 'professional', label: 'Professional', desc: 'Certified/degree holder, 3+ yrs exp', color: '#7c3aed' },
  { value: 'skilled', label: 'Skilled Worker', desc: 'Experienced trades & technical work', color: 'var(--terracotta)' },
  { value: 'labour', label: 'Daily Labour', desc: 'General farm & field work', color: 'var(--leaf)' },
];

export default function BecomeSpecialistPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    specialization: 'tractor_driver', tier: 'skilled',
    experience: '', dailyRate: '', hourlyRate: '',
    district: 'Bengaluru Urban', village: '', address: '',
    bio: '', languages: ['en'],
    qualifications: '', skills: '',
    availableForBundle: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleLang = (lang) => set('languages', form.languages.includes(lang)
    ? form.languages.filter(l => l !== lang) : [...form.languages, lang]);

  const handleSubmit = async () => {
    if (!form.experience || !form.dailyRate) return toast.error(t('Please fill all required fields'));
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        specialization: form.specialization.trim().toLowerCase().replace(/[\s-]+/g, '_'),
        pricePerDay: Number(form.dailyRate),
        dailyRate: Number(form.dailyRate),
        pricePerHour: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        bio: form.bio ? form.bio.trim() : undefined,
        experience: Number(form.experience),
        qualifications: form.qualifications ? form.qualifications.split(',').map(s => ({ degree: s.trim(), institution: 'Self-Reported', year: new Date().getFullYear() })) : [],
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        address: form.address ? form.address.trim() : undefined,
      };
      await specialistAPI.create(payload);
      toast.success(t('Specialist profile created! 🎉'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to create profile'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: '4rem' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--leaf) 0%, #1a4d1a 100%)', padding: '2.5rem 0' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GiToolbox size={28} color="var(--harvest)" />
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800 }}>{t("Become a Specialist")}</h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>{t("Offer your skills and earn by the day")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 680, paddingTop: '2rem' }}>
        {/* Step tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: '1.5rem', border: '1px solid var(--sand)', width: 'fit-content' }}>
          {['Your Role', 'Rates & Exp', 'Location & Bio'].map((s, i) => (
            <button key={s} onClick={() => setStep(i+1)}
              style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                background: step === i+1 ? 'var(--leaf)' : 'transparent', color: step === i+1 ? 'white' : 'var(--clay)' }}>
              {step > i+1 && <FiCheck style={{ display: 'inline', marginRight: 4 }} />}{t(s)}
            </button>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: '2rem' }}>

          {step === 1 && (
            <>
              <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1.25rem' }}>{t("Select Your Role & Tier")}</h3>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Specialization *")}</label>
                <select className="form-input" value={form.specialization} onChange={e => set('specialization', e.target.value)}>
                  {SPECIALIST_TYPES.map(s => <option key={s.value} value={s.value}>{s.icon} {t(s.label)}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 8, fontSize: '0.88rem' }}>{t("Worker Tier *")}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {TIERS.map(tier => (
                    <div key={tier.value} onClick={() => set('tier', tier.value)}
                      style={{ border: `2px solid ${form.tier === tier.value ? tier.color : 'var(--sand)'}`, borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                        background: form.tier === tier.value ? `${tier.color}12` : 'white', transition: 'all 0.2s' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: form.tier === tier.value ? tier.color : 'var(--sand)', transition: 'all 0.2s', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--soil)', fontSize: '0.95rem' }}>{t(tier.label)}</p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--clay)' }}>{t(tier.desc)}</p>
                      </div>
                      {form.tier === tier.value && <FiCheck style={{ marginLeft: 'auto', color: tier.color }} size={20} />}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Skills (comma-separated)")}</label>
                <input className="form-input" placeholder={t("e.g. Tractor operation, Soil preparation, GPS ploughing")} value={form.skills} onChange={e => set('skills', e.target.value)} />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Qualifications / Certifications (comma-separated)")}</label>
                <input className="form-input" placeholder={t("e.g. ITI Mechanic, B.Sc Agriculture, KSSRDB Certificate")} value={form.qualifications} onChange={e => set('qualifications', e.target.value)} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1.25rem' }}>{t("Rates & Experience")}</h3>
              <div style={{ background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.3)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.85rem', color: '#b8860b' }}>
                <FiAlertCircle /> {t("5% platform fee is deducted from earnings per booking.")}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Daily Rate (₹) *")}</label>
                  <input className="form-input" type="number" placeholder="800" value={form.dailyRate} onChange={e => set('dailyRate', e.target.value)} min="0" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Hourly Rate (₹) — optional")}</label>
                  <input className="form-input" type="number" placeholder="120" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} min="0" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Years of Experience *")}</label>
                  <input className="form-input" type="number" placeholder="5" value={form.experience} onChange={e => set('experience', e.target.value)} min="0" max="60" />
                </div>
              </div>
              {form.dailyRate && (
                <div style={{ background: 'rgba(45,106,45,0.1)', borderRadius: 10, padding: '1rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  <p style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: 4 }}>{t("Your Take-Home Estimates")}</p>
                  <p style={{ color: 'var(--leaf)' }}>{t("Per day:")} <strong>₹{Math.round(form.dailyRate * 0.95)}</strong> · {t("Per week:")} <strong>₹{Math.round(form.dailyRate * 0.95 * 6)}</strong> · {t("Per month:")} <strong>₹{Math.round(form.dailyRate * 0.95 * 24)}</strong></p>
                </div>
              )}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.availableForBundle} onChange={e => set('availableForBundle', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--leaf)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.9rem' }}>{t("Available for Bundle Bookings (with equipment)")}</span>
                </label>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1.25rem' }}>{t("Location & Bio")}</h3>
              <div style={{ background: 'rgba(45,106,45,0.08)', border: '1px solid rgba(45,106,45,0.2)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.85rem', color: 'var(--leaf)' }}>
                📍 {t("Enter your full address so seekers near you can find you easily.")}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Full Address *")}</label>
                  <input className="form-input" placeholder={t("e.g. Near Temple Road, Nanjangud, Mysuru, Karnataka")} value={form.address} onChange={e => set('address', e.target.value)} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--clay)', marginTop: 4 }}>{t("Include landmark, village, taluk for best accuracy")}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Village / Town")}</label>
                  <input className="form-input" placeholder={t("e.g. Mysuru")} value={form.village} onChange={e => set('village', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("District *")}</label>
                  <select className="form-input" value={form.district} onChange={e => set('district', e.target.value)}>
                    {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{t(d)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Bio / Introduction")}</label>
                <textarea className="form-input" rows={4} placeholder={t("Tell seekers about yourself — your experience, what makes you reliable, and what types of work you do best...")}
                  value={form.bio} onChange={e => set('bio', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 8, fontSize: '0.88rem' }}>{t("Languages Spoken")}</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {LANGUAGES.map(lang => (
                    <button key={lang.value} type="button" onClick={() => toggleLang(lang.value)}
                      style={{ padding: '0.4rem 1rem', borderRadius: 20, border: `2px solid ${form.languages.includes(lang.value) ? 'var(--leaf)' : 'var(--sand)'}`,
                        background: form.languages.includes(lang.value) ? 'rgba(45,106,45,0.12)' : 'white',
                        color: form.languages.includes(lang.value) ? 'var(--leaf)' : 'var(--clay)',
                        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {form.languages.includes(lang.value) && '✓ '}{t(lang.label)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: '1.75rem' }}>
            <button className="btn btn-outline" style={{ color: 'var(--terracotta)', borderColor: 'var(--terracotta)' }} onClick={() => navigate('/dashboard')}>{t("Cancel")}</button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {step > 1 && <button className="btn btn-outline" onClick={() => setStep(s => s-1)}>← {t("Back")}</button>}
              {step < 3 ? (
                <button className="btn" onClick={() => setStep(s => s+1)} style={{ background: 'var(--leaf)', color: 'white' }}>{t("Next")} →</button>
              ) : (
                <button className="btn" onClick={handleSubmit} disabled={submitting} style={{ background: 'var(--leaf)', color: 'white', padding: '0.75rem 2rem' }}>
                  {submitting ? t('Creating...') : t('🔧 Create Profile')}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
