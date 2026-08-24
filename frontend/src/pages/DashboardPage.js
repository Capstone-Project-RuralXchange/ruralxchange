import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiCalendar, FiStar, FiDollarSign, FiPlus, FiChevronRight, FiClock, FiCheckCircle, FiXCircle, FiTool } from 'react-icons/fi';
import { GiToolbox } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { dashboardAPI, bookingAPI, equipmentAPI, specialistAPI } from '../utils/api';
import { formatCurrency, formatDate, BOOKING_STATUSES } from '../utils/constants';

const STATUS_CONFIG = {
  pending: { color: '#E8A020', bg: '#fef9ee', icon: FiClock, label: 'Pending' },
  confirmed: { color: '#2D6A2D', bg: '#f0faf0', icon: FiCheckCircle, label: 'Confirmed' },
  completed: { color: '#1d4ed8', bg: '#eff6ff', icon: FiCheckCircle, label: 'Completed' },
  cancelled: { color: '#dc2626', bg: '#fef2f2', icon: FiXCircle, label: 'Cancelled' },
  in_progress: { color: '#7c3aed', bg: '#f5f3ff', icon: FiClock, label: 'In Progress' },
};

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div className="card" whileHover={{ y: -3 }} style={{ padding: '1.25rem 1.5rem', borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--clay)', fontWeight: 600, marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--soil)' }}>{value}</p>
          {sub && <p style={{ fontSize: '0.78rem', color: 'var(--clay)', marginTop: 2 }}>{sub}</p>}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [myEquipment, setMyEquipment] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          dashboardAPI.getStats(),
          bookingAPI.getMyBookings()
        ]);
        setStats(statsRes.data.data);
        setBookings(bookingsRes.data.data || []);

        if (user?.role === 'provider') {
          const eqRes = await equipmentAPI.getMyEquipment();
          setMyEquipment(eqRes.data.data || []);
        }
        if (user?.role === 'specialist') {
          const spRes = await specialistAPI.getMyProfile();
          setMyProfile(spRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await bookingAPI.updateStatus(bookingId, status);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status } : b));
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'overview', label: t('Overview') },
    { id: 'bookings', label: t('Bookings') },
    ...(user?.role === 'provider' ? [{ id: 'equipment', label: t('My Equipment') }] : []),
    ...(user?.role === 'specialist' ? [{ id: 'profile', label: t('My Profile') }] : []),
  ];

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--sand)', borderTopColor: 'var(--terracotta)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--clay)' }}>{t("Loading your dashboard...")}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--soil) 0%, #3d2510 100%)', padding: '2rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
                {t("Welcome back")}, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                  {t(user?.role)}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                  {user?.district}, Karnataka
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {user?.role === 'provider' && (
                <Link to="/list-equipment" className="btn" style={{ background: 'var(--terracotta)', color: 'white', gap: 6 }}>
                  <FiPlus /> {t("List Equipment")}
                </Link>
              )}
              {user?.role === 'specialist' && !myProfile && (
                <Link to="/become-specialist" className="btn" style={{ background: 'var(--leaf)', color: 'white', gap: 6 }}>
                  <FiPlus /> {t("Setup Profile")}
                </Link>
              )}
              <Link to="/requirements" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                {t("Notice Board")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon={FiCalendar} label={t("Total Bookings")} value={stats?.stats?.totalBookingsMade || 0} sub={t("All time")} color="var(--terracotta)" />
          <StatCard icon={FiCheckCircle} label={t("Completed")} value={stats?.stats?.completedBookings || 0} sub={t("Successfully done")} color="var(--leaf)" />
          <StatCard icon={FiDollarSign} label={t("Total Earnings")} value={formatCurrency(stats?.stats?.totalEarnings || 0)} sub={t("Net amount")} color="#7c3aed" />
          <StatCard icon={FiStar} label={t("Avg Rating")} value={stats?.user?.rating?.average != null ? Number(stats.user.rating.average).toFixed(1) : 'No ratings'} sub={t("From users")} color="#E8A020" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: '1.5rem', border: '1px solid var(--sand)', width: 'fit-content' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s',
                background: activeTab === tab.id ? 'var(--terracotta)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--clay)' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Recent Bookings */}
              <div className="card" style={{ padding: '1.5rem', gridColumn: bookings.length === 0 ? '1 / -1' : 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--soil)' }}>{t("Recent Bookings")}</h3>
                  <button onClick={() => setActiveTab('bookings')} style={{ background: 'none', border: 'none', color: 'var(--terracotta)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
                    {t("View all")} <FiChevronRight />
                  </button>
                </div>
                {bookings.slice(0, 4).map(booking => {
                  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                  return (
                    <div key={booking._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--sand)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <cfg.icon size={18} color={cfg.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {booking.equipment?.title || booking.specialist?.user?.name || t('Service Booking')}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--clay)' }}>{formatDate(booking.startDate)} – {formatDate(booking.endDate)}</p>
                      </div>
                      <div>
                        <span style={{ background: cfg.bg, color: cfg.color, padding: '2px 8px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{t(cfg.label)}</span>
                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--soil)', textAlign: 'right', marginTop: 2 }}>{formatCurrency(booking.pricing?.totalAmount || 0)}</p>
                      </div>
                    </div>
                  );
                })}
                {bookings.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--clay)' }}>
                    <FiCalendar size={36} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <p>{t("No bookings yet")}</p>
                    <Link to="/equipment" className="btn btn-primary" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>{t("Browse Equipment")}</Link>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: '1rem' }}>{t("Quick Actions")}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: t('Browse Equipment'), path: '/equipment', icon: FiPackage, color: 'var(--terracotta)' },
                    { label: t('Find Specialists'), path: '/specialists', icon: GiToolbox, color: 'var(--leaf)' },
                    { label: t('Post a Requirement'), path: '/requirements', icon: FiPackage, color: '#7c3aed' },
                    ...(user?.role === 'provider' ? [{ label: t('List New Equipment'), path: '/list-equipment', icon: FiPlus, color: 'var(--harvest)' }] : []),
                    ...(user?.role === 'specialist' ? [{ label: myProfile ? t('Edit Specialist Profile') : t('Become a Specialist'), path: '/become-specialist', icon: FiTool, color: 'var(--harvest)' }] : []),
                  ].map(action => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.path} to={action.path}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', borderRadius: 10, background: `${action.color}12`, border: `1px solid ${action.color}30`, textDecoration: 'none', transition: 'all 0.2s' }}>
                        <Icon size={20} color={action.color} />
                        <span style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.9rem' }}>{action.label}</span>
                        <FiChevronRight style={{ marginLeft: 'auto', color: action.color }} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--clay)' }}>
                  <FiCalendar size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <h3 style={{ color: 'var(--soil)', marginBottom: 8 }}>{t("No bookings found")}</h3>
                  <p style={{ marginBottom: '1rem' }}>{t("Start by browsing available equipment or specialists")}</p>
                  <Link to="/equipment" className="btn btn-primary">{t("Browse Equipment")}</Link>
                </div>
              ) : (
                <div>
                  {bookings.map((booking, idx) => {
                    const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                    const isProvider = user?.role === 'provider';
                    return (
                      <div key={booking._id} style={{ padding: '1.25rem 1.5rem', borderBottom: idx < bookings.length - 1 ? '1px solid var(--sand)' : 'none', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <cfg.icon size={20} color={cfg.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <p style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: 2 }}>
                            {booking.equipment?.title || t('Service Booking')}
                            {booking.specialist && <span style={{ color: 'var(--clay)', fontWeight: 500 }}> + {t("Specialist")}</span>}
                          </p>
                          <p style={{ fontSize: '0.82rem', color: 'var(--clay)' }}>
                            {formatDate(booking.startDate)} → {formatDate(booking.endDate)} · {booking.seeker?.name}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 800, color: 'var(--soil)', fontSize: '1.1rem' }}>{formatCurrency(booking.pricing?.totalAmount || 0)}</p>
                          <span style={{ background: cfg.bg, color: cfg.color, padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>{t(cfg.label)}</span>
                        </div>
                        {isProvider && booking.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                              style={{ background: 'var(--leaf)', color: 'white', border: 'none', borderRadius: 8, padding: '0.4rem 0.875rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                              {t("Accept")}
                            </button>
                            <button onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                              style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '0.4rem 0.875rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                              {t("Decline")}
                            </button>
                          </div>
                        )}
                        {isProvider && booking.status === 'confirmed' && (
                          <button onClick={() => handleStatusUpdate(booking._id, 'completed')}
                            style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 8, padding: '0.4rem 0.875rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                            {t("Mark Done")}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* My Equipment Tab */}
        {activeTab === 'equipment' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--soil)' }}>{t("Your Equipment Listings")}</h3>
              <Link to="/list-equipment" className="btn btn-primary" style={{ gap: 6 }}>
                <FiPlus size={16} /> {t("Add New")}
              </Link>
            </div>
            {myEquipment.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--clay)' }}>
                <FiPackage size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                <h3 style={{ color: 'var(--soil)', marginBottom: 8 }}>{t("No equipment listed")}</h3>
                <Link to="/list-equipment" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>{t("List Your First Equipment")}</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {myEquipment.map(eq => (
                  <div key={eq._id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h4 style={{ fontWeight: 700, color: 'var(--soil)', fontSize: '0.95rem' }}>{eq.title}</h4>
                      <span style={{ background: eq.availabilityStatus === 'available' ? '#f0faf0' : '#fef2f2', color: eq.availabilityStatus === 'available' ? 'var(--leaf)' : '#dc2626', padding: '2px 8px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                        {t(eq.availabilityStatus)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--clay)', marginBottom: '0.5rem' }}>{t(eq.category)} · {eq.district}</p>
                    <p style={{ fontWeight: 700, color: 'var(--terracotta)' }}>{formatCurrency(eq.pricePerDay)}/{t("day")}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
