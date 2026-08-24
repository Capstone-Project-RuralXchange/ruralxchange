import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.phone.trim(), form.password);
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || t('Login failed. Check your credentials.'));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440 }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--terracotta), var(--harvest))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(193,68,14,0.3)' }}>
            <GiWheat size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--soil)', marginBottom: 4 }}>{t("Welcome Back")}</h1>
          <p style={{ color: 'var(--clay)', fontSize: '0.95rem' }}>{t("Sign in to your RuralXchange account")}</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.9rem' }}>{t("Phone Number")}</label>
              <div style={{ position: 'relative' }}>
                <FiPhone style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--clay)' }} />
                <input className="form-input" type="tel" placeholder="9876543210"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  style={{ paddingLeft: '2.75rem' }} required />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.9rem' }}>{t("Password")}</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--clay)' }} />
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder={t("Enter your password")}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clay)', padding: 0 }}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', fontWeight: 700 }}>
              {loading ? t('Signing In...') : t('Sign In')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--sand)' }}>
            <p style={{ color: 'var(--clay)', fontSize: '0.9rem' }}>
              {t("Don't have an account?")}{' '}
              <Link to="/register" style={{ color: 'var(--terracotta)', fontWeight: 700, textDecoration: 'none' }}>{t("Register here")}</Link>
            </p>
          </div>
        </div>

        {/* Demo creds */}
        <div style={{ marginTop: '1.5rem', background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.3)', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--soil)', marginBottom: 6 }}>🧪 {t("Demo Credentials")}</p>
          <div style={{ fontSize: '0.8rem', color: 'var(--clay)', lineHeight: 1.8 }}>
            <div>{t("Seeker")}: <code>9000000001</code> / <code>pass123</code></div>
            <div>{t("Provider")}: <code>9000000002</code> / <code>pass123</code></div>
            <div>{t("Specialist")}: <code>9000000003</code> / <code>pass123</code></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
