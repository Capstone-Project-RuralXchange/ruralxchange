import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiSave, FiX, FiMapPin, FiPhone, FiStar, FiAward } from 'react-icons/fi';
import { GiFarmer } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { KARNATAKA_DISTRICTS, LANGUAGES } from '../utils/constants';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    village: user?.village || '',
    district: user?.district || 'Bengaluru Urban',
    preferredLanguage: user?.preferredLanguage || 'en',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authAPI.getMe()
      .then(res => {
        const u = res.data?.user || res.data?.data || res.data;
        if (u) {
          updateUser(u);
          setForm({
            name: u.name || '',
            village: u.village || '',
            district: u.district || 'Bengaluru Urban',
            preferredLanguage: u.preferredLanguage || 'en',
          });
        }
      })
      .catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      const updated = res.data?.data || res.data?.user || res.data;
      updateUser(updated);
      toast.success(t('Profile updated!'));
      setEditing(false);
    } catch (err) {
      toast.error(t('Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const roleColors = { seeker: 'var(--leaf)', provider: 'var(--terracotta)', specialist: '#7c3aed', admin: 'var(--soil)' };
  const roleColor = roleColors[user?.role] || 'var(--clay)';

  const memberSinceYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: '4rem' }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${roleColor} 0%, var(--soil) 100%)`, padding: '3rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.4)' }}>
              <GiFarmer size={40} color="white" />
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>{user?.name}</h1>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '3px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700, textTransform: 'capitalize' }}>
                  {t(user?.role)}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiMapPin size={13} /> {user?.district}, Karnataka
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 720, marginTop: -48 }}>
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: t('Rating'), value: user?.rating?.average != null ? user.rating.average.toFixed(1) : '—', icon: FiStar, color: 'var(--harvest)' },
            { label: t('Reviews'), value: user?.rating?.count || 0, icon: FiAward, color: 'var(--terracotta)' },
            { label: t('Member Since'), value: memberSinceYear, icon: FiAward, color: roleColor },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: '1.25rem', textAlign: 'center', borderTop: `3px solid ${stat.color}` }}>
              <stat.icon size={22} color={stat.color} style={{ marginBottom: 6 }} />
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--soil)' }}>{stat.value}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--clay)', fontWeight: 600 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--soil)', fontSize: '1.1rem' }}>{t("Personal Information")}</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn btn-outline" style={{ gap: 6, padding: '0.5rem 1rem' }}>
                <FiEdit2 size={15} /> {t("Edit")}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setEditing(false)} className="btn btn-outline" style={{ gap: 6, padding: '0.5rem 1rem' }}>
                  <FiX size={15} /> {t("Cancel")}
                </button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ gap: 6, padding: '0.5rem 1rem' }}>
                  <FiSave size={15} /> {saving ? t('Saving...') : t('Save')}
                </button>
              </div>
            )}
          </div>

          {!editing ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {[
                { label: t('Full Name'), value: user?.name, icon: GiFarmer },
                { label: t('Phone Number'), value: user?.phone, icon: FiPhone },
                { label: t('District'), value: t(user?.district), icon: FiMapPin },
                { label: t('Village / Town'), value: user?.village || '—', icon: FiMapPin },
                { label: t('Language'), value: LANGUAGES.find(l => l.value === user?.preferredLanguage)?.label || 'English', icon: FiAward },
                { label: t('Role'), value: t(user?.role), icon: FiAward },
              ].map(field => (
                <div key={field.label} style={{ borderBottom: '1px solid var(--sand)', paddingBottom: '0.875rem' }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{field.label}</p>
                  <p style={{ fontWeight: 600, color: 'var(--soil)', textTransform: field.label === t('Role') ? 'capitalize' : 'none' }}>{field.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Full Name")}</label>
                  <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Village / Town")}</label>
                  <input className="form-input" placeholder={t("Optional")} value={form.village} onChange={e => set('village', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("District")}</label>
                  <select className="form-input" value={form.district} onChange={e => set('district', e.target.value)}>
                    {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{t(d)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Preferred Language")}</label>
                  <select className="form-input" value={form.preferredLanguage} onChange={e => set('preferredLanguage', e.target.value)}>
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{t(l.label)}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Account Info */}
        <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1rem', fontSize: '1rem' }}>{t("Account Info")}</h3>
          <div style={{ fontSize: '0.88rem', color: 'var(--clay)', lineHeight: 2 }}>
            <p>📱 {t("Phone")}: <strong style={{ color: 'var(--soil)' }}>{user?.phone}</strong> ({t("cannot be changed")})</p>
            <p>🏷️ {t("Role")}: <strong style={{ color: 'var(--soil)', textTransform: 'capitalize' }}>{t(user?.role)}</strong></p>
            <p>📅 {t("Joined")}: <strong style={{ color: 'var(--soil)' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '—'}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
