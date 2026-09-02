import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMapPin, FiClock, FiMessageCircle, FiX, FiSearch, FiNavigation } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import { requirementAPI } from '../utils/api';
import { formatDate, EQUIPMENT_CATEGORIES, KARNATAKA_DISTRICTS } from '../utils/constants';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const REQUIREMENT_TYPES = ['Equipment', 'Specialist', 'Bundle', 'Other'];

function RequirementCard({ req, onRespond, currentUser }) {
  const [showRespond, setShowRespond] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const daysLeft = Math.max(0, Math.ceil((new Date(req.expiresAt) - Date.now()) / 86400000));

  const handleRespond = async () => {
    if (!responseText.trim()) return;
    setSubmitting(true);
    try {
      await requirementAPI.respond(req._id, { message: responseText });
      toast.success('Response sent!');
      setShowRespond(false);
      setResponseText('');
      onRespond(req._id);
    } catch (err) {
      toast.error('Failed to send response');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid var(--harvest)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ background: 'rgba(232,160,32,0.15)', color: '#b8860b', padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
              {req.requirementType}
            </span>
            {req.category && <span style={{ background: 'rgba(193,68,14,0.1)', color: 'var(--terracotta)', padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>{req.category}</span>}
            <span style={{ background: daysLeft <= 3 ? '#fef2f2' : '#f0faf0', color: daysLeft <= 3 ? '#dc2626' : 'var(--leaf)', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
              {daysLeft === 0 ? 'Expires today' : `${daysLeft} days left`}
            </span>
            {req.distanceKm != null && (
              <span style={{ background: 'rgba(45,27,14,0.08)', color: 'var(--soil)', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                📍 {req.distanceKm < 1 ? '<1' : req.distanceKm} km away
              </span>
            )}
          </div>
          <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: 4, fontSize: '1rem' }}>{req.title}</h3>
          <p style={{ color: 'var(--clay)', fontSize: '0.88rem', lineHeight: 1.6 }}>{req.description}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: 'var(--clay)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={13} /> {req.district}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={13} /> {formatDate(req.createdAt)}</span>
          <span style={{ fontWeight: 600, color: 'var(--soil)' }}>— {req.postedBy?.name}</span>
          {req.responses?.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMessageCircle size={13} color="var(--terracotta)" /> {req.responses.length} responses</span>
          )}
        </div>
        {currentUser && req.postedBy?._id !== currentUser._id && (
          <button onClick={() => setShowRespond(!showRespond)}
            style={{ background: 'var(--terracotta)', color: 'white', border: 'none', borderRadius: 8, padding: '0.4rem 0.875rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiMessageCircle size={14} /> Respond
          </button>
        )}
      </div>

      <AnimatePresence>
        {showRespond && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--sand)', overflow: 'hidden' }}>
            <textarea className="form-input" rows={2} placeholder="Describe your offer — availability, price, experience..."
              value={responseText} onChange={e => setResponseText(e.target.value)}
              style={{ marginBottom: '0.5rem', resize: 'none', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRespond(false)}
                style={{ background: 'var(--sand)', border: 'none', borderRadius: 8, padding: '0.4rem 0.875rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', color: 'var(--clay)' }}>
                Cancel
              </button>
              <button onClick={handleRespond} disabled={submitting}
                style={{ background: 'var(--leaf)', color: 'white', border: 'none', borderRadius: 8, padding: '0.4rem 0.875rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                {submitting ? 'Sending...' : 'Send Response'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RequirementsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [form, setForm] = useState({ title: '', description: '', requirementType: 'Equipment', category: '', district: 'Bengaluru Urban' });
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');

  // Request browser geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('granted');
        },
        (err) => {
          console.warn('Geolocation denied:', err.message);
          setLocationStatus('denied');
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    }
  }, []);

  const load = async () => {
    try {
      const params = {};
      if (filterDistrict) params.district = filterDistrict;
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      const res = await requirementAPI.getAll(params);
      setRequirements(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterDistrict, userLocation]);

  const handlePost = async () => {
    if (!form.title || !form.description) return toast.error('Please fill title and description');
    setSubmitting(true);
    try {
      const payload = { ...form, title: form.title.trim(), description: form.description.trim() };
      await requirementAPI.create(payload);
      toast.success('Requirement posted!');
      setShowForm(false);
      setForm({ title: '', description: '', requirementType: 'Equipment', category: '', district: 'Bengaluru Urban' });
      load();
    } catch (err) {
      toast.error('Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requirements.filter(r =>
    (!search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || r.requirementType === filterType)
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, var(--soil) 100%)', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                <GiWheat size={24} color="var(--harvest)" />
                <span style={{ color: 'var(--harvest)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>{t("Community Board")}</span>
              </div>
              <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t("Public Requirement Board")}</h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 480 }}>
                {t("Post what you need")}
              </p>
              {/* Location Status */}
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                {locationStatus === 'loading' && (
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--harvest)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    {t("Detecting your location...")}
                  </span>
                )}
                {locationStatus === 'granted' && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--harvest)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                    <FiNavigation size={14} /> {t("Sorted by distance — nearest first")}
                  </span>
                )}
                {locationStatus === 'denied' && (
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    📍 {t("Location access denied — showing default order")}
                  </span>
                )}
              </div>
            </div>
            {user && (
              <button onClick={() => setShowForm(!showForm)} className="btn"
                style={{ background: 'var(--terracotta)', color: 'white', gap: 6, padding: '0.75rem 1.5rem' }}>
                <FiPlus /> {t("Post Requirement")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Post Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--soil)' }}>{t("Post a New Requirement")}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clay)' }}><FiX size={20} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}><FiMessageCircle /> {t("Title *")}</label>
                  <input className="form-input" placeholder={t("Title Placeholder")} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}><FiPlus /> {t("Type")}</label>
                  <Select
                    options={REQUIREMENT_TYPES.map(t => ({ value: t, label: t }))}
                    value={{ value: form.requirementType, label: form.requirementType }}
                    onChange={v => setForm({...form, requirementType: v.value})}
                    styles={{ control: (base) => ({ ...base, borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'none' }) }}
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}><GiWheat /> {t("Category (optional)")}</label>
                  <Select
                    options={EQUIPMENT_CATEGORIES}
                    value={form.category ? EQUIPMENT_CATEGORIES.find(c => c.value === form.category) : null}
                    onChange={v => setForm({...form, category: v ? v.value : ''})}
                    placeholder={t("Category (optional)")}
                    isClearable
                    styles={{ control: (base) => ({ ...base, borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'none' }) }}
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}><FiMapPin /> {t("District")}</label>
                  <Select
                    options={KARNATAKA_DISTRICTS.map(d => ({ value: d, label: d }))}
                    value={{ value: form.district, label: form.district }}
                    onChange={v => setForm({...form, district: v.value})}
                    styles={{ control: (base) => ({ ...base, borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'none' }) }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--soil)', marginBottom: 6, fontSize: '0.88rem' }}>{t("Description *")}</label>
                <textarea className="form-input" rows={3} placeholder={t("Description Placeholder")}
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowForm(false)} className="btn btn-outline">{t("Cancel")}</button>
                <button onClick={handlePost} disabled={submitting} className="btn btn-primary">
                  {submitting ? t('Posting...') : `📢 ${t('Post Requirement')}`}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--clay)' }} />
            <input className="form-input" placeholder={t("Search requirements...")} value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.75rem' }} />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={[{value: '', label: t('All Types')}, ...REQUIREMENT_TYPES.map(t => ({value: t, label: t}))]}
              value={{ value: filterType, label: filterType || t('All Types') }}
              onChange={v => setFilterType(v.value)}
              styles={{ control: (base) => ({ ...base, borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'none' }) }}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={[{value: '', label: t('All Districts')}, ...KARNATAKA_DISTRICTS.map(d => ({value: d, label: d}))]}
              value={{ value: filterDistrict, label: filterDistrict || t('All Districts') }}
              onChange={v => setFilterDistrict(v.value)}
              styles={{ control: (base) => ({ ...base, borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'none' }) }}
            />
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="card skeleton" style={{ height: 120, borderRadius: 12 }} />
            ))
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--clay)' }}>
              <GiWheat size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
              <h3 style={{ color: 'var(--soil)', marginBottom: 8 }}>{t("No requirements found")}</h3>
              <p>{t("Be the first to post what you need!")}</p>
              {user && <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ marginTop: '1rem' }}>{t("Post Requirement")}</button>}
            </div>
          ) : (
            filtered.map(req => (
              <RequirementCard key={req._id} req={req} currentUser={user} onRespond={() => load()} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
