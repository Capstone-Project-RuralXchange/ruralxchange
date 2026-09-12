import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiCalendar, FiStar, FiDollarSign, FiPlus, FiChevronRight, FiClock, FiCheckCircle, FiXCircle, FiTool, FiInbox, FiPhone, FiMapPin, FiAlertTriangle, FiSearch, FiX } from 'react-icons/fi';
import { GiToolbox } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { dashboardAPI, bookingAPI, equipmentAPI, specialistAPI, ratingAPI } from '../utils/api';
import { formatCurrency, formatDate, BOOKING_STATUSES } from '../utils/constants';
import toast from 'react-hot-toast';

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
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [myEquipment, setMyEquipment] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [reviewTargetType, setReviewTargetType] = useState('equipment');
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedMap, setReviewedMap] = useState({});

  // Edit Equipment Modal State
  const [editModalEquipment, setEditModalEquipment] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const isProviderOrSpecialist = user?.role === 'provider' || user?.role === 'specialist';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          dashboardAPI.getStats(),
          bookingAPI.getMyBookings()
        ]);
        setStats(statsRes.data.data);
        setBookings(bookingsRes.data.data || []);

        // Load incoming bookings for providers/specialists
        if (isProviderOrSpecialist) {
          try {
            const providerRes = await bookingAPI.getProviderBookings();
            setIncomingBookings(providerRes.data.data || []);
          } catch (err) {
            console.warn('Could not load provider bookings:', err);
          }
        }

        if (user?.role === 'provider') {
          const eqRes = await equipmentAPI.getMyEquipment();
          setMyEquipment(eqRes.data.data || []);
        }
        if (user?.role === 'specialist') {
          try {
            const spRes = await specialistAPI.getMyProfile();
            setMyProfile(spRes.data.data);
          } catch (err) {
            // No specialist profile yet
          }
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
      const updateList = (list) => list.map(b => b._id === bookingId ? { ...b, status } : b);
      setBookings(updateList);
      setIncomingBookings(updateList);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissAlert = async (bookingId) => {
    try {
      await bookingAPI.dismissAlert(bookingId);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, notifiedSeekerOfExpiry: true } : b));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const handleCancelAndSearch = async (bookingId, isSpecialist = false) => {
    try {
      await bookingAPI.updateStatus(bookingId, 'cancelled', {
        cancellationReason: 'Cancelled by seeker due to provider acceptance timeout'
      });
      toast.success(t('Booking cancelled. Redirecting to find alternatives...'));
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled', notifiedSeekerOfExpiry: true } : b));
      navigate(isSpecialist ? '/specialists' : '/equipment');
    } catch (err) {
      toast.error(t('Failed to cancel booking'));
    }
  };

  const handleSubmitReview = async (e) => {
    e?.preventDefault();
    if (!reviewModalBooking) return;
    try {
      setSubmittingReview(true);
      const targetId = reviewTargetType === 'equipment'
        ? (reviewModalBooking.equipment?._id || reviewModalBooking.equipment)
        : (reviewModalBooking.specialist?._id || reviewModalBooking.specialist);

      await ratingAPI.create({
        bookingId: reviewModalBooking._id,
        ratingType: reviewTargetType,
        targetId,
        score: reviewScore,
        review: reviewComment,
        comment: reviewComment
      });

      toast.success(t('Thank you! Your review and rating have been recorded.'));
      setReviewedMap(prev => ({
        ...prev,
        [`${reviewModalBooking._id}_${reviewTargetType}`]: true
      }));
      setReviewModalBooking(null);
      setReviewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to submit rating'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDelistEquipment = async (equipmentId, title) => {
    const confirmed = window.confirm(`Are you sure you want to delist "${title}"? It will no longer be visible to seekers.`);
    if (!confirmed) return;

    try {
      await equipmentAPI.delete(equipmentId);
      toast.success("Equipment delisted successfully! 🚜");
      // Refresh your listings in state
      setMyEquipment(prev => prev.filter(item => item._id !== equipmentId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delist equipment");
    }
  };

  const handleEquipmentStatusChange = async (equipmentId, newStatus) => {
    try {
      await equipmentAPI.update(equipmentId, { availabilityStatus: newStatus });
      toast.success(t('Equipment status updated successfully'));
      setMyEquipment(prev => prev.map(item => item._id === equipmentId ? { ...item, availabilityStatus: newStatus } : item));
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to update status'));
    }
  };

  const openEditModal = (equipment) => {
    setEditModalEquipment(equipment);
    setEditFormData({
      title: equipment.title || '',
      pricePerDay: equipment.pricePerDay || '',
      pricePerHour: equipment.pricePerHour || '',
      district: equipment.district || '',
      description: equipment.description || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModalEquipment) return;
    try {
      setSubmittingEdit(true);
      const res = await equipmentAPI.update(editModalEquipment._id, editFormData);
      toast.success(t('Equipment updated successfully!'));
      setMyEquipment(prev => prev.map(item => item._id === editModalEquipment._id ? res.data.data : item));
      setEditModalEquipment(null);
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to update equipment'));
    } finally {
      setSubmittingEdit(false);
    }
  };

  const autoCancelledNotifications = bookings.filter(b =>
    b.status === 'cancelled' &&
    b.cancellationReason &&
    b.cancellationReason.includes('auto-cancelled') &&
    !b.notifiedSeekerOfExpiry
  );

  const expiredPendingAlerts = bookings.filter(b =>
    b.status === 'pending' &&
    b.acceptanceDeadline &&
    new Date(b.acceptanceDeadline) <= new Date() &&
    !b.notifiedSeekerOfExpiry
  );

  const pendingIncoming = incomingBookings.filter(b => b.status === 'pending').length;

  const tabs = [
    { id: 'overview', label: t('Overview') },
    { id: 'bookings', label: t('My Bookings') },
    ...(isProviderOrSpecialist ? [{
      id: 'incoming',
      label: t('Incoming Requests'),
      badge: pendingIncoming
    }] : []),
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
                {pendingIncoming > 0 && (
                  <span style={{ background: '#dc2626', color: 'white', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, animation: 'pulse 2s infinite' }}>
                    {pendingIncoming} {t("pending")}
                  </span>
                )}
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
        {/* Auto-Cancelled Booking Notification Banner */}
        {autoCancelledNotifications.map(b => {
          const isSp = b.bookingType === 'specialist_only';
          const itemName = b.equipment?.title || b.specialist?.user?.name || t('your requested service');
          return (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{
                background: '#fff1f2',
                border: '1.5px solid #fecdd3',
                borderRadius: 12,
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', maxWidth: 650 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <FiAlertTriangle color="#e11d48" size={18} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: '#9f1239', fontSize: '0.98rem', marginBottom: 2 }}>
                    {t("Booking Auto-Cancelled (Provider Acceptance Timeout)")}
                  </h4>
                  <p style={{ color: '#881337', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    {t("Your booking for")} <strong>{itemName}</strong> {t("was auto-cancelled because the provider did not respond within the deadline. We recommend exploring other available providers nearby.")}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleCancelAndSearch(b._id, isSp)}
                  className="btn btn-sm"
                  style={{ background: 'var(--terracotta)', color: 'white', display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  <FiSearch size={14} /> {t("Search Alternatives")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDismissAlert(b._id)}
                  className="btn btn-sm btn-outline"
                  style={{ color: '#881337', borderColor: '#fca5a5' }}>
                  <FiX size={14} /> {t("Dismiss")}
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Expired Pending Booking (When Auto-Cancel was false) Alert */}
        {expiredPendingAlerts.map(b => {
          const isSp = b.bookingType === 'specialist_only';
          const itemName = b.equipment?.title || b.specialist?.user?.name || t('your requested service');
          return (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: 12,
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', maxWidth: 650 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <FiClock color="#d97706" size={18} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: '#92400e', fontSize: '0.98rem', marginBottom: 2 }}>
                    {t("Provider Has Not Accepted Yet")}
                  </h4>
                  <p style={{ color: '#78350f', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    {t("The provider hasn't accepted your booking for")} <strong>{itemName}</strong> {t("within the selected")} {b.acceptanceWindowHours || 6} {t("hours window. Would you like to cancel and search for other available options?")}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleCancelAndSearch(b._id, isSp)}
                  className="btn btn-sm"
                  style={{ background: '#d97706', color: 'white', display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  <FiXCircle size={14} /> {t("Cancel & Search Alternatives")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDismissAlert(b._id)}
                  className="btn btn-sm btn-outline"
                  style={{ color: '#92400e', borderColor: '#fcd34d' }}>
                  {t("Wait Longer")}
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon={FiCalendar} label={t("Total Bookings")} value={stats?.stats?.totalBookingsMade || 0} sub={t("All time")} color="var(--terracotta)" />
          <StatCard icon={FiCheckCircle} label={t("Completed")} value={stats?.stats?.completedBookings || 0} sub={t("Successfully done")} color="var(--leaf)" />
          <StatCard icon={FiDollarSign} label={t("Total Earnings")} value={formatCurrency(stats?.stats?.totalEarnings || 0)} sub={t("Net amount")} color="#7c3aed" />
          {isProviderOrSpecialist && (
            <StatCard icon={FiInbox} label={t("Pending Requests")} value={pendingIncoming} sub={t("Awaiting your response")} color="#E8A020" />
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: '1.5rem', border: '1px solid var(--sand)', width: 'fit-content', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s',
                background: activeTab === tab.id ? 'var(--terracotta)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--clay)',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
              {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : '#dc2626',
                  color: 'white', padding: '1px 7px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700,
                  minWidth: 20, textAlign: 'center'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Incoming Requests Preview (for providers/specialists) */}
              {isProviderOrSpecialist && pendingIncoming > 0 && (
                <div className="card" style={{ padding: '1.5rem', gridColumn: '1 / -1', borderLeft: '4px solid #E8A020' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, color: 'var(--soil)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiInbox color="#E8A020" /> {t("Action Required")} — {pendingIncoming} {t("pending requests")}
                    </h3>
                    <button onClick={() => setActiveTab('incoming')} style={{ background: 'none', border: 'none', color: 'var(--terracotta)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
                      {t("View all")} <FiChevronRight />
                    </button>
                  </div>
                  {incomingBookings.filter(b => b.status === 'pending').slice(0, 3).map(booking => {
                    const cfg = STATUS_CONFIG.pending;
                    return (
                      <div key={booking._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--sand)', flexWrap: 'wrap' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <cfg.icon size={18} color={cfg.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 150 }}>
                          <p style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.9rem' }}>
                            {booking.seeker?.name || t('Unknown Seeker')}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--clay)' }}>
                            {booking.equipment?.title || t('Specialist Service')} · {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                          </p>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--terracotta)', fontSize: '1rem' }}>
                          {formatCurrency(booking.pricing?.totalAmount || 0)}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                            style={{ background: 'var(--leaf)', color: 'white', border: 'none', borderRadius: 8, padding: '0.45rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                            ✓ {t("Accept")}
                          </button>
                          <button onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                            style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '0.45rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                            ✗ {t("Decline")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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

        {/* My Bookings Tab (as seeker) */}
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
                            {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                          </p>
                          {/* Show provider/specialist contact on confirmed bookings */}
                          {booking.status === 'confirmed' && (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: 4, fontSize: '0.78rem' }}>
                              {booking.equipmentOwner?.name && (
                                <span style={{ color: 'var(--leaf)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <FiPhone size={12} /> {booking.equipmentOwner.name}: {booking.equipmentOwner.phone}
                                </span>
                              )}
                              {booking.specialistOwner?.name && (
                                <span style={{ color: 'var(--leaf)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <FiPhone size={12} /> {booking.specialistOwner.name}: {booking.specialistOwner.phone}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 800, color: 'var(--soil)', fontSize: '1.1rem' }}>{formatCurrency(booking.pricing?.totalAmount || 0)}</p>
                          <span style={{ background: cfg.bg, color: cfg.color, padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>{t(cfg.label)}</span>
                        </div>
                        {/* Seeker can cancel pending bookings */}
                        {booking.status === 'pending' && (
                          <button onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                            style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '0.4rem 0.875rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                            {t("Cancel")}
                          </button>
                        )}

                        {/* Seeker can rate completed bookings */}
                        {booking.status === 'completed' && (
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {booking.equipment && (
                              (reviewedMap[`${booking._id}_equipment`] || booking.ratings?.equipmentRating?.submitted) ? (
                                <span style={{
                                  background: '#F0FDF4',
                                  border: '1px solid #BBF7D0',
                                  color: 'var(--leaf)',
                                  borderRadius: 8,
                                  padding: '0.35rem 0.65rem',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}>
                                  ✓ {t('Rated')}
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReviewModalBooking(booking);
                                    setReviewTargetType('equipment');
                                    setReviewScore(5);
                                    setReviewComment('');
                                  }}
                                  style={{
                                    background: '#FFF8E8',
                                    border: '1px solid #E8A020',
                                    color: 'var(--soil)',
                                    borderRadius: 8,
                                    padding: '0.35rem 0.65rem',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}>
                                  <FiStar size={12} color="#E8A020" /> {t('Rate Equipment')}
                                </button>
                              )
                            )}
                            {booking.specialist && (
                              (reviewedMap[`${booking._id}_specialist`] || booking.ratings?.specialistRating?.submitted) ? (
                                <span style={{
                                  background: '#F0FDF4',
                                  border: '1px solid #BBF7D0',
                                  color: 'var(--leaf)',
                                  borderRadius: 8,
                                  padding: '0.35rem 0.65rem',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}>
                                  ✓ {t('Rated')}
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReviewModalBooking(booking);
                                    setReviewTargetType('specialist');
                                    setReviewScore(5);
                                    setReviewComment('');
                                  }}
                                  style={{
                                    background: '#E8F5E8',
                                    border: '1px solid #2D6A2D',
                                    color: 'var(--soil)',
                                    borderRadius: 8,
                                    padding: '0.35rem 0.65rem',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}>
                                  <FiStar size={12} color="#2D6A2D" /> {t('Rate Specialist')}
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Incoming Requests Tab (Provider/Specialist) */}
        {activeTab === 'incoming' && isProviderOrSpecialist && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--soil)', marginBottom: 4 }}>
                {t("Booking Requests from Seekers")}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--clay)' }}>
                {t("Accept or decline booking requests for your equipment and services")}
              </p>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {incomingBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--clay)' }}>
                  <FiInbox size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <h3 style={{ color: 'var(--soil)', marginBottom: 8 }}>{t("No incoming requests yet")}</h3>
                  <p>{t("When seekers book your equipment or services, they'll appear here")}</p>
                </div>
              ) : (
                <div>
                  {incomingBookings.map((booking, idx) => {
                    const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                    const isPending = booking.status === 'pending';
                    const isConfirmed = booking.status === 'confirmed';
                    const isInProgress = booking.status === 'in_progress';
                    return (
                      <div key={booking._id} style={{ padding: '1.5rem', borderBottom: idx < incomingBookings.length - 1 ? '1px solid var(--sand)' : 'none' }}>
                        {/* Top Row: Status + Amount */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ background: cfg.bg, color: cfg.color, padding: '3px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <cfg.icon size={14} /> {t(cfg.label)}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--clay)' }}>
                              {booking.bookingType === 'bundle' ? '📦 Bundle' : booking.bookingType === 'specialist_only' ? '👷 Service' : '🔧 Equipment'}
                            </span>
                          </div>
                          <p style={{ fontWeight: 800, color: 'var(--terracotta)', fontSize: '1.15rem' }}>
                            {formatCurrency(booking.pricing?.totalAmount || 0)}
                          </p>
                        </div>

                        {/* Booking Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                          {/* Seeker Info */}
                          <div style={{ background: 'rgba(45,106,45,0.06)', borderRadius: 10, padding: '0.875rem' }}>
                            <p style={{ fontSize: '0.72rem', color: 'var(--clay)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t("Seeker")}</p>
                            <p style={{ fontWeight: 700, color: 'var(--soil)', fontSize: '0.95rem' }}>{booking.seeker?.name || t('Unknown')}</p>
                            {(isConfirmed || isInProgress) && booking.seeker?.phone && (
                              <p style={{ fontSize: '0.82rem', color: 'var(--leaf)', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FiPhone size={12} /> {booking.seeker.phone}
                              </p>
                            )}
                            {booking.seeker?.district && (
                              <p style={{ fontSize: '0.78rem', color: 'var(--clay)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FiMapPin size={11} /> {booking.seeker.district}{booking.seeker.village ? `, ${booking.seeker.village}` : ''}
                              </p>
                            )}
                          </div>
                          {/* Item Info */}
                          <div style={{ background: 'rgba(193,68,14,0.06)', borderRadius: 10, padding: '0.875rem' }}>
                            <p style={{ fontSize: '0.72rem', color: 'var(--clay)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t("Item")}</p>
                            <p style={{ fontWeight: 700, color: 'var(--soil)', fontSize: '0.95rem' }}>
                              {booking.equipment?.title || t('Specialist Service')}
                            </p>
                            <p style={{ fontSize: '0.82rem', color: 'var(--clay)', marginTop: 2 }}>
                              <FiCalendar size={11} style={{ display: 'inline', marginRight: 4 }} />
                              {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                            </p>
                            {booking.purpose && (
                              <p style={{ fontSize: '0.78rem', color: 'var(--clay)', marginTop: 4, fontStyle: 'italic' }}>
                                "{booking.purpose.length > 60 ? booking.purpose.slice(0, 60) + '...' : booking.purpose}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {isPending && (
                            <>
                              <button onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                style={{ background: 'var(--leaf)', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiCheckCircle size={16} /> {t("Accept Booking")}
                              </button>
                              <button onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                style={{ background: 'white', color: '#dc2626', border: '2px solid #dc2626', borderRadius: 8, padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiXCircle size={16} /> {t("Decline")}
                              </button>
                            </>
                          )}
                          {isConfirmed && (
                            <button onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <FiCheckCircle size={16} /> {t("Mark as Completed")}
                            </button>
                          )}
                          {isInProgress && (
                            <button onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <FiCheckCircle size={16} /> {t("Mark as Completed")}
                            </button>
                          )}
                        </div>
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
                      <select
                        value={eq.availabilityStatus}
                        onChange={(e) => handleEquipmentStatusChange(eq._id, e.target.value)}
                        style={{ 
                          background: eq.availabilityStatus === 'available' ? '#f0faf0' : '#fef2f2', 
                          color: eq.availabilityStatus === 'available' ? 'var(--leaf)' : '#dc2626', 
                          padding: '2px 8px', 
                          borderRadius: 20, 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          border: `1px solid ${eq.availabilityStatus === 'available' ? '#bbf7d0' : '#fecaca'}`,
                          outline: 'none',
                          cursor: 'pointer',
                          appearance: 'none',
                          textAlign: 'center'
                        }}
                      >
                        <option value="available">✅ {t("Available")}</option>
                        <option value="maintenance">🚫 {t("Unavailable")}</option>
                      </select>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--clay)', marginBottom: '0.5rem' }}>{t(eq.category)} · {eq.district}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontWeight: 700, color: 'var(--terracotta)', margin: 0 }}>{formatCurrency(eq.pricePerDay)}/{t("day")}</p>
                      <button
                        onClick={() => openEditModal(eq)}
                        className="btn btn-outline btn-sm"
                        style={{
                          color: 'var(--soil)',
                          borderColor: 'var(--sand)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.8rem',
                          padding: '0.4rem 0.8rem'
                        }}
                      >
                        ✏️ {t("Edit")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Review & Rating Modal */}
      {reviewModalBooking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid var(--sand)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--soil)', margin: 0 }}>
                {reviewTargetType === 'equipment' ? `🚜 ${t("Rate Equipment")}` : `👷 ${t("Rate Specialist")}`}
              </h3>
              <button
                onClick={() => setReviewModalBooking(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clay)', fontSize: '1.25rem', padding: 4 }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--clay)', marginBottom: '1.25rem' }}>
              {reviewTargetType === 'equipment'
                ? (reviewModalBooking.equipment?.title || t('Equipment Rental'))
                : (reviewModalBooking.specialistOwner?.name || reviewModalBooking.specialist?.user?.name || t('Specialist Service'))}
            </p>

            <form onSubmit={handleSubmitReview}>
              {/* Star Rating selector */}
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--soil)', marginBottom: '0.5rem' }}>
                  {t("Your Rating")} ({reviewScore} / 5)
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewScore(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '2rem',
                        color: star <= reviewScore ? '#E8A020' : '#D1D5DB',
                        transition: 'transform 0.15s',
                        padding: '0 4px'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--soil)', marginBottom: '0.5rem' }}>
                  {t("Write your feedback (optional)")}
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={reviewTargetType === 'equipment'
                    ? t("How was the equipment condition, reliability, and performance?")
                    : t("How was the specialist's punctuality, technical skill, and behavior?")}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius)',
                    border: '1.5px solid var(--sand)',
                    fontFamily: 'inherit',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                    outline: 'none',
                    color: 'var(--soil)'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setReviewModalBooking(null)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: 8,
                    border: '1px solid var(--sand)',
                    background: 'white',
                    color: 'var(--clay)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.88rem'
                  }}
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--terracotta)',
                    color: 'white',
                    fontWeight: 700,
                    cursor: submittingReview ? 'not-allowed' : 'pointer',
                    opacity: submittingReview ? 0.7 : 1,
                    fontSize: '0.88rem'
                  }}
                >
                  {submittingReview ? t("Submitting...") : t("Submit Rating")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {editModalEquipment && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'white', borderRadius: '12px', padding: '2rem',
              width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>✏️ {t("Edit Equipment")}</h3>
              <button onClick={() => setEditModalEquipment(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>{t("Title")}</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  required
                  className="form-control"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--sand)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>{t("Price/Day (₹)")}</label>
                  <input
                    type="number"
                    value={editFormData.pricePerDay}
                    onChange={(e) => setEditFormData({...editFormData, pricePerDay: e.target.value})}
                    required
                    className="form-control"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--sand)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>{t("Price/Hour (₹) (Optional)")}</label>
                  <input
                    type="number"
                    value={editFormData.pricePerHour}
                    onChange={(e) => setEditFormData({...editFormData, pricePerHour: e.target.value})}
                    className="form-control"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--sand)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>{t("Description")}</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows={3}
                  className="form-control"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--sand)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <button 
                  type="button"
                  onClick={() => {
                    handleDelistEquipment(editModalEquipment._id, editModalEquipment.title);
                    setEditModalEquipment(null);
                  }}
                  style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  🗑️ {t("Delist")}
                </button>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setEditModalEquipment(null)} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                    {t("Cancel")}
                  </button>
                  <button type="submit" disabled={submittingEdit} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                    {submittingEdit ? t("Saving...") : t("Save Changes")}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
