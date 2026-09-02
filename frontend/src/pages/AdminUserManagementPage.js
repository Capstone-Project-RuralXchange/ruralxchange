import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../utils/api';
import { KARNATAKA_DISTRICTS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiUsers, FiShield, FiUserCheck, FiUserX, FiSearch, FiFilter,
  FiPlus, FiEdit2, FiTrash2, FiEye, FiCheckCircle, FiXCircle,
  FiRefreshCw, FiPhone, FiMail, FiMapPin, FiCalendar, FiTool,
  FiBriefcase, FiX, FiCheck, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';

const ROLE_CONFIG = {
  seeker: { label: 'Seeker', icon: '🔍', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  provider: { label: 'Provider', icon: '🚜', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  specialist: { label: 'Specialist', icon: '👷', bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  admin: { label: 'Admin', icon: '👑', bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8' }
};

const AdminUserManagementPage = () => {
  const { user: currentUser } = useAuth();

  // State
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');

  // Modals
  const [viewUserModal, setViewUserModal] = useState(null);
  const [editUserModal, setEditUserModal] = useState(null);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [userFullDetails, setUserFullDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Form states for Add User
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'seeker',
    district: 'Mandya',
    village: '',
    preferredLanguage: 'kn',
    isVerified: true,
    isActive: true,
    bio: ''
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Fetch Stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await adminAPI.getStats();
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load system stats');
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        role: selectedRole,
        district: selectedDistrict,
        isActive: selectedStatus === 'active' ? 'true' : selectedStatus === 'suspended' ? 'false' : 'all',
        isVerified: selectedVerification === 'verified' ? 'true' : selectedVerification === 'unverified' ? 'false' : 'all',
        search: search.trim(),
        sort: sortBy
      };

      const res = await adminAPI.getUsers(params);
      if (res.data?.success) {
        setUsers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [selectedRole, selectedDistrict, selectedStatus, selectedVerification, search, sortBy, pagination.limit]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Load Full User Details
  const handleOpenViewModal = async (user) => {
    setViewUserModal(user);
    setDetailsLoading(true);
    try {
      const res = await adminAPI.getUserById(user._id);
      if (res.data?.success) {
        setUserFullDetails(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch detailed profile');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Toggle Status (Active / Suspended)
  const handleToggleStatus = async (user) => {
    if (user._id === currentUser?._id) {
      toast.error('You cannot deactivate your own admin account');
      return;
    }

    const newStatus = !user.isActive;
    try {
      const res = await adminAPI.updateStatus(user._id, { isActive: newStatus });
      if (res.data?.success) {
        toast.success(`User ${newStatus ? 'activated' : 'suspended'} successfully`);
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: newStatus } : u));
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Toggle Verification
  const handleToggleVerification = async (user) => {
    const newVerification = !user.isVerified;
    try {
      const res = await adminAPI.updateStatus(user._id, { isVerified: newVerification });
      if (res.data?.success) {
        toast.success(`User marked as ${newVerification ? 'Verified' : 'Unverified'}`);
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isVerified: newVerification } : u));
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update verification');
    }
  };

  // Change Role Quick
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminAPI.updateRole(userId, newRole);
      if (res.data?.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        if (editUserModal?._id === userId) {
          setEditUserModal(prev => ({ ...prev, role: newRole }));
        }
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change role');
    }
  };

  // Delete User
  const handleDeleteUser = async (user) => {
    if (user._id === currentUser?._id) {
      toast.error('You cannot delete your own admin account');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.phone})? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await adminAPI.deleteUser(user._id);
      if (res.data?.success) {
        toast.success('User deleted successfully');
        setUsers(prev => prev.filter(u => u._id !== user._id));
        if (viewUserModal?._id === user._id) setViewUserModal(null);
        if (editUserModal?._id === user._id) setEditUserModal(null);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Submit Add User Form
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.phone || !addForm.password || !addForm.district) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSubmittingAdd(true);
      const res = await adminAPI.createUser(addForm);
      if (res.data?.success) {
        toast.success(`User "${res.data.data.name}" created successfully 🎉`);
        setAddUserModalOpen(false);
        setAddForm({
          name: '',
          phone: '',
          email: '',
          password: '',
          role: 'seeker',
          district: 'Mandya',
          village: '',
          preferredLanguage: 'kn',
          isVerified: true,
          isActive: true,
          bio: ''
        });
        fetchUsers(1);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Submit Edit User Form
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingEdit(true);
      const res = await adminAPI.updateUser(editUserModal._id, editUserModal);
      if (res.data?.success) {
        toast.success('User updated successfully');
        setUsers(prev => prev.map(u => u._id === editUserModal._id ? res.data.data : u));
        setEditUserModal(null);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmittingEdit(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '2rem 0 4rem 0' }}>
      <div className="container">

        {/* ── Page Header ── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #FFFFFF, #FFF9F0)',
          padding: '1.75rem 2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow)'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(193,68,14,0.1)', color: 'var(--terracotta)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <FiShield /> Admin Role-Based Access Control (RBAC)
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--soil)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              User Management Console
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Manage users, assign RBAC roles, toggle account verification, and oversee platform activity across Karnataka.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => { fetchStats(); fetchUsers(pagination.page); }}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.1rem',
                borderRadius: 'var(--radius)',
                border: '1.5px solid var(--border)',
                background: 'white',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <FiRefreshCw className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button
              onClick={() => setAddUserModalOpen(true)}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius)',
                background: 'linear-gradient(135deg, var(--terracotta), #A33000)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: '0 4px 14px rgba(193,68,14,0.3)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <FiPlus /> Add New User
            </button>
          </div>
        </div>

        {/* ── KPI Stats Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {[
            { label: 'Total Users', value: stats?.users?.total || 0, icon: <FiUsers />, color: 'var(--soil)', bg: '#FFFFFF' },
            { label: 'Seekers', value: stats?.users?.seekers || 0, icon: '🔍', color: '#1D4ED8', bg: '#EFF6FF' },
            { label: 'Providers', value: stats?.users?.providers || 0, icon: '🚜', color: '#B45309', bg: '#FEF3C7' },
            { label: 'Specialists', value: stats?.users?.specialists || 0, icon: '👷', color: '#047857', bg: '#ECFDF5' },
            { label: 'Admins', value: stats?.users?.admins || 0, icon: '👑', color: '#BE185D', bg: '#FDF2F8' },
            { label: 'Verified Accounts', value: stats?.users?.verified || 0, icon: <FiUserCheck />, color: 'var(--leaf)', bg: '#F2F8F2' },
          ].map((item, idx) => (
            <div key={idx} style={{
              background: item.bg,
              padding: '1.25rem',
              borderRadius: 'var(--radius)',
              border: '1.5px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '1.2rem', color: item.color }}>{item.icon}</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: item.color, fontFamily: 'var(--font-display)' }}>
                {statsLoading ? '...' : item.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters & Search Bar ── */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow)',
          marginBottom: '1.5rem'
        }}>
          {/* Top Row: Search + District + Status + Verification */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search name, phone, email, village..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                  borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--border)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--surface-2)',
                  color: 'var(--soil)'
                }}
              />
            </div>

            {/* District Filter */}
            <div>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--border)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--surface-2)',
                  color: 'var(--soil)',
                  cursor: 'pointer'
                }}
              >
                <option value="all">📍 All Districts ({KARNATAKA_DISTRICTS.length})</option>
                {KARNATAKA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--border)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--surface-2)',
                  color: 'var(--soil)',
                  cursor: 'pointer'
                }}
              >
                <option value="all">⚡ All Statuses</option>
                <option value="active">🟢 Active Only</option>
                <option value="suspended">🔴 Suspended Only</option>
              </select>
            </div>

            {/* Verification Filter */}
            <div>
              <select
                value={selectedVerification}
                onChange={(e) => setSelectedVerification(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--border)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--surface-2)',
                  color: 'var(--soil)',
                  cursor: 'pointer'
                }}
              >
                <option value="all">🛡️ All Verification</option>
                <option value="verified">✅ Verified</option>
                <option value="unverified">⏳ Unverified</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--border)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--surface-2)',
                  color: 'var(--soil)',
                  cursor: 'pointer'
                }}
              >
                <option value="-createdAt">📅 Newest First</option>
                <option value="createdAt">📅 Oldest First</option>
                <option value="name">🔤 Name (A - Z)</option>
                <option value="-totalBookings">🏆 Most Bookings</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Role Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.25rem' }}>
              Filter by Role:
            </span>
            {[
              { id: 'all', label: 'All Roles', count: stats?.users?.total },
              { id: 'seeker', label: '🔍 Seekers', count: stats?.users?.seekers },
              { id: 'provider', label: '🚜 Providers', count: stats?.users?.providers },
              { id: 'specialist', label: '👷 Specialists', count: stats?.users?.specialists },
              { id: 'admin', label: '👑 Admins', count: stats?.users?.admins },
            ].map(r => {
              const active = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: `1.5px solid ${active ? 'var(--terracotta)' : 'var(--border)'}`,
                    background: active ? 'var(--terracotta)' : 'var(--surface-2)',
                    color: active ? 'white' : 'var(--soil)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span>{r.label}</span>
                  {r.count !== undefined && (
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '10px',
                      background: active ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                      color: active ? 'white' : 'var(--text-muted)'
                    }}>
                      {r.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Users Table ── */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌾</div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--soil)', marginBottom: '0.5rem' }}>No users found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try modifying your search or role filters.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#FDF6E3', borderBottom: '1.5px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>User / Profile</th>
                    <th style={{ padding: '1rem 1rem' }}>Role (RBAC)</th>
                    <th style={{ padding: '1rem 1rem' }}>Location</th>
                    <th style={{ padding: '1rem 1rem' }}>Verification</th>
                    <th style={{ padding: '1rem 1rem' }}>Status</th>
                    <th style={{ padding: '1rem 1rem' }}>Joined</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const roleInfo = ROLE_CONFIG[u.role] || ROLE_CONFIG.seeker;
                    const isSelf = u._id === currentUser?._id;

                    return (
                      <tr
                        key={u._id}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: i % 2 === 0 ? '#FFFFFF' : '#FFFEFA',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#FFF9F0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? '#FFFFFF' : '#FFFEFA'}
                      >
                        {/* User Profile */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${roleInfo.text}, var(--harvest))`,
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: 'var(--shadow-sm)',
                              flexShrink: 0
                            }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--soil)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {u.name}
                                {isSelf && (
                                  <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(193,68,14,0.1)', color: 'var(--terracotta)', fontWeight: 700 }}>
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <FiPhone style={{ fontSize: '0.75rem' }} /> {u.phone}
                                </span>
                                {u.email && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <FiMail style={{ fontSize: '0.75rem' }} /> {u.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Select */}
                        <td style={{ padding: '1rem 1rem' }}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <select
                              value={u.role}
                              disabled={isSelf}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              style={{
                                appearance: 'none',
                                background: roleInfo.bg,
                                color: roleInfo.text,
                                border: `1.5px solid ${roleInfo.border}`,
                                borderRadius: 'var(--radius-full)',
                                padding: '0.35rem 1.75rem 0.35rem 0.75rem',
                                fontSize: '0.825rem',
                                fontWeight: 700,
                                cursor: isSelf ? 'not-allowed' : 'pointer',
                                outline: 'none'
                              }}
                            >
                              <option value="seeker">🔍 Seeker</option>
                              <option value="provider">🚜 Provider</option>
                              <option value="specialist">👷 Specialist</option>
                              <option value="admin">👑 Admin</option>
                            </select>
                            <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.7rem', color: roleInfo.text }}>▼</span>
                          </div>
                        </td>

                        {/* Location */}
                        <td style={{ padding: '1rem 1rem' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--soil)' }}>
                            {u.district}
                          </div>
                          {u.village && (
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                              {u.village}
                            </div>
                          )}
                        </td>

                        {/* Verification */}
                        <td style={{ padding: '1rem 1rem' }}>
                          <button
                            onClick={() => handleToggleVerification(u)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.3rem 0.65rem',
                              borderRadius: 'var(--radius)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: 'none',
                              background: u.isVerified ? '#ECFDF5' : '#FEF3C7',
                              color: u.isVerified ? '#047857' : '#B45309'
                            }}
                            title="Click to toggle verification"
                          >
                            {u.isVerified ? <FiCheckCircle /> : <FiXCircle />}
                            {u.isVerified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>

                        {/* Active / Suspended Status */}
                        <td style={{ padding: '1rem 1rem' }}>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isSelf}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.3rem 0.65rem',
                              borderRadius: 'var(--radius)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                              border: 'none',
                              background: u.isActive ? '#EFF6FF' : '#FEF2F2',
                              color: u.isActive ? '#1D4ED8' : '#DC2626'
                            }}
                            title={isSelf ? 'Cannot deactivate self' : 'Click to toggle status'}
                          >
                            <span style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: u.isActive ? '#1D4ED8' : '#DC2626'
                            }} />
                            {u.isActive ? 'Active' : 'Suspended'}
                          </button>
                        </td>

                        {/* Joined Date */}
                        <td style={{ padding: '1rem 1rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button
                              onClick={() => handleOpenViewModal(u)}
                              style={{
                                padding: '0.45rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                background: 'white',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer'
                              }}
                              title="View Full Profile"
                            >
                              <FiEye />
                            </button>
                            <button
                              onClick={() => setEditUserModal({ ...u })}
                              style={{
                                padding: '0.45rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                background: 'white',
                                color: '#1D4ED8',
                                cursor: 'pointer'
                              }}
                              title="Edit User"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={isSelf}
                              style={{
                                padding: '0.45rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                background: 'white',
                                color: isSelf ? '#D1D5DB' : '#DC2626',
                                cursor: isSelf ? 'not-allowed' : 'pointer'
                              }}
                              title={isSelf ? 'Cannot delete self' : 'Delete User'}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && users.length > 0 && (
            <div style={{
              padding: '1rem 1.5rem',
              background: '#FDF6E3',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing <strong>{users.length}</strong> of <strong>{pagination.total}</strong> users (Page {pagination.page} of {pagination.pages})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsers(pagination.page - 1)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: pagination.page <= 1 ? '#F3F4F6' : 'white',
                    color: pagination.page <= 1 ? '#9CA3AF' : 'var(--soil)',
                    cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <FiChevronLeft /> Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: pagination.page >= pagination.pages ? '#F3F4F6' : 'white',
                    color: pagination.page >= pagination.pages ? '#9CA3AF' : 'var(--soil)',
                    cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── District Distribution Section ── */}
        {stats?.districtStats && stats.districtStats.length > 0 && (
          <div style={{
            marginTop: '2rem',
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 2rem',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--soil)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📍 Regional Distribution (Top Districts)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {stats.districtStats.map((item, i) => (
                <div key={i} style={{
                  background: 'var(--surface-2)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--soil)' }}>{item._id || 'Unknown'}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--terracotta)' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL 1: VIEW USER FULL DETAILS ── */}
      {viewUserModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(45, 27, 14, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-xl)',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={() => { setViewUserModal(null); setUserFullDetails(null); }}
              style={{
                position: 'absolute',
                right: '1.5rem',
                top: '1.5rem',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--soil)'
              }}
            >
              <FiX />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--terracotta), var(--harvest))',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {viewUserModal.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--soil)' }}>{viewUserModal.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '4px' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: ROLE_CONFIG[viewUserModal.role]?.bg || '#EFF6FF',
                    color: ROLE_CONFIG[viewUserModal.role]?.text || '#1D4ED8'
                  }}>
                    {ROLE_CONFIG[viewUserModal.role]?.icon} {ROLE_CONFIG[viewUserModal.role]?.label}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    📍 {viewUserModal.district}{viewUserModal.village ? `, ${viewUserModal.village}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {detailsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 0.5rem auto' }}></div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading user history...</p>
              </div>
            ) : userFullDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Contact & Meta */}
                <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div><strong>Phone:</strong> {userFullDetails.user.phone}</div>
                  <div><strong>Email:</strong> {userFullDetails.user.email || 'Not provided'}</div>
                  <div><strong>Language:</strong> {userFullDetails.user.preferredLanguage?.toUpperCase() || 'EN'}</div>
                  <div><strong>Status:</strong> {userFullDetails.user.isActive ? '🟢 Active' : '🔴 Suspended'}</div>
                  <div><strong>Verification:</strong> {userFullDetails.user.isVerified ? '✅ Verified' : '⏳ Unverified'}</div>
                  <div><strong>Joined:</strong> {new Date(userFullDetails.user.createdAt).toLocaleDateString()}</div>
                </div>

                {/* Specialist Profile If present */}
                {userFullDetails.specialist && (
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--soil)', marginBottom: '0.5rem' }}>👷 Specialist Profile</h4>
                    <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid #A7F3D0', fontSize: '0.85rem' }}>
                      <div><strong>Skill:</strong> {userFullDetails.specialist.specialization} ({userFullDetails.specialist.skillTier})</div>
                      <div><strong>Experience:</strong> {userFullDetails.specialist.experienceYears} Years</div>
                      <div><strong>Rate:</strong> ₹{userFullDetails.specialist.dailyRate}/day · ₹{userFullDetails.specialist.hourlyRate}/hour</div>
                      <div><strong>Rating:</strong> ⭐ {userFullDetails.specialist.rating?.average || 0} ({userFullDetails.specialist.rating?.count || 0} reviews)</div>
                    </div>
                  </div>
                )}

                {/* Equipment Listings */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--soil)', marginBottom: '0.5rem' }}>
                    🚜 Equipment Listings ({userFullDetails.equipment?.length || 0})
                  </h4>
                  {userFullDetails.equipment?.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No equipment listed by this user.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {userFullDetails.equipment.map(eq => (
                        <div key={eq._id} style={{ background: 'white', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                          <div>
                            <strong>{eq.title}</strong> ({eq.category})
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>₹{eq.pricePerDay}/day · Status: {eq.availabilityStatus}</div>
                          </div>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: eq.isActive ? '#EFF6FF' : '#FEF2F2', color: eq.isActive ? '#1D4ED8' : '#DC2626' }}>
                            {eq.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Requirements */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--soil)', marginBottom: '0.5rem' }}>
                    📋 Notice Board Posts ({userFullDetails.requirements?.length || 0})
                  </h4>
                  {userFullDetails.requirements?.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No requirements posted.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {userFullDetails.requirements.map(req => (
                        <div key={req._id} style={{ background: 'white', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                          <strong>{req.title}</strong> · Status: <span style={{ textTransform: 'capitalize' }}>{req.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD USER MODAL ── */}
      {addUserModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(45, 27, 14, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-xl)',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={() => setAddUserModalOpen(false)}
              style={{
                position: 'absolute',
                right: '1.5rem',
                top: '1.5rem',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--soil)'
              }}
            >
              <FiX />
            </button>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--soil)', marginBottom: '0.25rem' }}>
              Create New User
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Add a user with explicit RBAC role assignment in RuralXchange.
            </p>

            <form onSubmit={handleAddUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Anand Gowda"
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Phone Number (10 digits) *</label>
                  <input
                    type="text"
                    required
                    pattern="^[6-9]\d{9}$"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="9876543210"
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="At least 6 characters"
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Email (Optional)</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="user@example.com"
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Assigned RBAC Role *</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'white' }}
                  >
                    <option value="seeker">🔍 Seeker (Needs equipment/services)</option>
                    <option value="provider">🚜 Provider (Rents equipment)</option>
                    <option value="specialist">👷 Specialist (Offers skills)</option>
                    <option value="admin">👑 Administrator (Full Console Access)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>District (Karnataka) *</label>
                  <select
                    value={addForm.district}
                    onChange={(e) => setAddForm({ ...addForm, district: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'white' }}
                  >
                    {KARNATAKA_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Village / Taluk</label>
                  <input
                    type="text"
                    value={addForm.village}
                    onChange={(e) => setAddForm({ ...addForm, village: e.target.value })}
                    placeholder="e.g. Maddur"
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={addForm.isVerified}
                    onChange={(e) => setAddForm({ ...addForm, isVerified: e.target.checked })}
                  />
                  <span>Mark as Verified Account</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={addForm.isActive}
                    onChange={(e) => setAddForm({ ...addForm, isActive: e.target.checked })}
                  />
                  <span>Active Account</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.5rem', borderRadius: 'var(--radius)', background: 'var(--terracotta)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingAdd ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: EDIT USER MODAL ── */}
      {editUserModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(45, 27, 14, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-xl)',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={() => setEditUserModal(null)}
              style={{
                position: 'absolute',
                right: '1.5rem',
                top: '1.5rem',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--soil)'
              }}
            >
              <FiX />
            </button>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--soil)', marginBottom: '0.25rem' }}>
              Edit User Profile
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Modify account attributes and access permissions.
            </p>

            <form onSubmit={handleEditUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={editUserModal.name || ''}
                  onChange={(e) => setEditUserModal({ ...editUserModal, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Phone</label>
                  <input
                    type="text"
                    required
                    value={editUserModal.phone || ''}
                    onChange={(e) => setEditUserModal({ ...editUserModal, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Email</label>
                  <input
                    type="email"
                    value={editUserModal.email || ''}
                    onChange={(e) => setEditUserModal({ ...editUserModal, email: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Role</label>
                  <select
                    value={editUserModal.role}
                    disabled={editUserModal._id === currentUser?._id}
                    onChange={(e) => setEditUserModal({ ...editUserModal, role: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'white' }}
                  >
                    <option value="seeker">🔍 Seeker</option>
                    <option value="provider">🚜 Provider</option>
                    <option value="specialist">👷 Specialist</option>
                    <option value="admin">👑 Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>District</label>
                  <select
                    value={editUserModal.district}
                    onChange={(e) => setEditUserModal({ ...editUserModal, district: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'white' }}
                  >
                    {KARNATAKA_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>Village / Taluk</label>
                <input
                  type="text"
                  value={editUserModal.village || ''}
                  onChange={(e) => setEditUserModal({ ...editUserModal, village: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editUserModal.isVerified || false}
                    onChange={(e) => setEditUserModal({ ...editUserModal, isVerified: e.target.checked })}
                  />
                  <span>Verified User</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: editUserModal._id === currentUser?._id ? 'not-allowed' : 'pointer' }}>
                  <input
                    type="checkbox"
                    disabled={editUserModal._id === currentUser?._id}
                    checked={editUserModal.isActive || false}
                    onChange={(e) => setEditUserModal({ ...editUserModal, isActive: e.target.checked })}
                  />
                  <span>Active Account</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.5rem', borderRadius: 'var(--radius)', background: 'var(--terracotta)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUserManagementPage;
