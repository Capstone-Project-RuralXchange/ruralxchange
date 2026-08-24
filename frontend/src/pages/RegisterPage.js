import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiLock, FiUser, FiMapPin, FiEye, FiEyeOff, FiPackage } from 'react-icons/fi';
import { GiWheat, GiFarmer, GiToolbox } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { KARNATAKA_DISTRICTS, LANGUAGES } from '../utils/constants';
import { useTranslation } from 'react-i18next';

const ROLES = [
  { value: 'seeker', label: 'Seeker', desc: 'I need equipment or services', icon: GiFarmer, color: '#2D6A2D' },
  { value: 'provider', label: 'Equipment Provider', desc: 'I rent out my equipment', icon: FiPackage, color: '#C1440E' },
  { value: 'specialist', label: 'Specialist / Worker', desc: 'I offer skilled services', icon: GiToolbox, color: '#E8A020' },
];

export default function RegisterPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', phone: '', password: '', confirmPassword: '',
    role: '', village: '', district: 'Bengaluru Urban', state: 'Karnataka', preferredLanguage: 'en'
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleNext = () => {
    if (step === 1) {
      if (!form.name || !form.phone || !form.password || !form.confirmPassword) return setError(t('Please fill all fields'));
      if (form.password !== form.confirmPassword) return setError(t('Passwords do not match'));
      if (form.password.length < 6) return setError(t('Password must be at least 6 characters'));
      if (form.phone.length !== 10) return setError(t('Enter a valid 10-digit phone number'));
    }
    if (step === 2 && !form.role) return setError(t('Please select your role'));
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.district || !form.state) return setError(t('Please fill location details'));
    setError('');
    setLoading(true);
    const { confirmPassword, ...submitData } = form;
    submitData.phone = submitData.phone.trim();
    submitData.name = submitData.name.trim();
    const result = await register(submitData);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.error || t('Registration failed'));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 480 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--terracotta), var(--harvest))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(193,68,14,0.3)' }}>
            <GiWheat size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--soil)' }}>{t("Create Account")}</h1>
          <p style={{ color: 'var(--clay)', fontSize: '0.9rem' }}>{t("Join thousands of rural households on RuralXchange")}</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '1.5rem' }}>
          {[1,2,3].map(s => (
            <React.Fragment key={s}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.3s',
                background: step >= s ? 'var(--terracotta)' : 'var(--sand)', color: step >= s ? 'white' : 'var(--clay)' }}>
                {s}
              </div>
              {s < 3 && <div style={{ width: 40, height: 2, background: step > s ? 'var(--terracotta)' : 'var(--sand)', transition: 'all 0.3s' }} />}
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 1rem' }}>
          {['Account', 'Role', 'Location'].map((l, i) => (
            <span key={l} style={{ fontSize: '0.75rem', fontWeight: 600, color: step === i+1 ? 'var(--terracotta)' : 'var(--clay)' }}>{t(l)}</span>
          ))}
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Account Details */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 style={{ color: 'var(--soil)', fontWeight: 700, marginBottom: '1.25rem', fontSize: '1.1rem' }}>{t("Your Details")}</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Full Name")}</label>
                  <div style={{ position: 'relative' }}>
                    <FiUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--clay)' }} />
                    <input className="form-input" placeholder={t("Rajesh Kumar")} value={form.name}
                      onChange={e => set('name', e.target.value)} style={{ paddingLeft: '2.75rem' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Phone Number")}</label>
                  <div style={{ position: 'relative' }}>
                    <FiPhone style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--clay)' }} />
                    <input className="form-input" type="tel" placeholder="9876543210" value={form.phone}
                      onChange={e => set('phone', e.target.value)} style={{ paddingLeft: '2.75rem' }} maxLength={10} />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Password")}</label>
                  <div style={{ position: 'relative' }}>
                    <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--clay)' }} />
                    <input className="form-input" type={showPass ? 'text' : 'password'} placeholder={t("Min. 6 characters")} value={form.password}
                      onChange={e => set('password', e.target.value)} style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clay)', padding: 0 }}>
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Confirm Password")}</label>
                  <div style={{ position: 'relative' }}>
                    <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--clay)' }} />
                    <input className="form-input" type="password" placeholder={t("Repeat password")} value={form.confirmPassword}
                      onChange={e => set('confirmPassword', e.target.value)} style={{ paddingLeft: '2.75rem' }} />
                  </div>
                </div>

                <button className="btn btn-primary" onClick={handleNext} style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                  {t("Continue")} →
                </button>
              </motion.div>
            )}

            {/* Step 2: Role */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 style={{ color: 'var(--soil)', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{t("I want to join as...")}</h3>
                <p style={{ color: 'var(--clay)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>{t("You can always expand your role later")}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {ROLES.map(role => {
                    const Icon = role.icon;
                    const selected = form.role === role.value;
                    return (
                      <div key={role.value} onClick={() => set('role', role.value)}
                        style={{ border: `2px solid ${selected ? role.color : 'var(--sand)'}`, borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                          background: selected ? `${role.color}15` : 'white', transition: 'all 0.2s' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: selected ? role.color : 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                          <Icon size={22} color={selected ? 'white' : 'var(--clay)'} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--soil)', fontSize: '0.95rem' }}>{t(role.label)}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--clay)' }}>{t(role.desc)}</div>
                        </div>
                        {selected && <div style={{ marginLeft: 'auto', color: role.color, fontWeight: 700, fontSize: '1.2rem' }}>✓</div>}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>← {t("Back")}</button>
                  <button className="btn btn-primary" onClick={handleNext} style={{ flex: 2, justifyContent: 'center' }}>{t("Continue")} →</button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 style={{ color: 'var(--soil)', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{t("Your Location")}</h3>
                <p style={{ color: 'var(--clay)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>{t("Helps us show you nearby listings")}</p>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Village / Town (optional)")}</label>
                  <div style={{ position: 'relative' }}>
                    <FiMapPin style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--clay)' }} />
                    <input className="form-input" placeholder={t("e.g. Hosur")} value={form.village}
                      onChange={e => set('village', e.target.value)} style={{ paddingLeft: '2.75rem' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("District")}</label>
                  <select className="form-input" value={form.district} onChange={e => set('district', e.target.value)}>
                    {KARNATAKA_DISTRICTS.map(d => <option key={d}>{t(d)}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Preferred Language")}</label>
                  <select className="form-input" value={form.preferredLanguage} onChange={e => set('preferredLanguage', e.target.value)}>
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{t(l.label)}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-outline" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: 'center' }}>← {t("Back")}</button>
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                    {loading ? t('Creating Account...') : t('Create Account 🎉')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--clay)' }}>
          {t("Already have an account?")} <Link to="/login" style={{ color: 'var(--terracotta)', fontWeight: 700, textDecoration: 'none' }}>{t("Sign in")}</Link>
        </p>
      </motion.div>
    </div>
  );
}
