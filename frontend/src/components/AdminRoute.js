import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiArrowLeft } from 'react-icons/fi';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Verifying admin authorization...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: '520px',
          margin: '0 auto',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(193, 68, 14, 0.1)',
            color: 'var(--terracotta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            margin: '0 auto 1.5rem auto'
          }}>
            <FiShield />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--soil)', marginBottom: '0.75rem', fontWeight: 700 }}>
            Admin Access Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your account role is currently <strong>{user.role}</strong>. This section is strictly restricted to RuralXchange system administrators.
          </p>
          <Link
            to="/dashboard"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius)'
            }}
          >
            <FiArrowLeft /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
