import React from 'react';
import { Link } from 'react-router-dom';
import { GiWheat } from 'react-icons/gi';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer style={{
      background: 'var(--soil)',
      color: '#E8D5B0',
      padding: '3rem 0 1.5rem',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--terracotta), var(--harvest))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GiWheat style={{ color: 'white', fontSize: '1.2rem' }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.5px' }}>
                RuralX<span style={{ color: 'var(--harvest)' }}>change</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#B8997A', maxWidth: 220 }}>
              {t("Connecting rural communities with equipment, skilled workers, and professionals — all in one platform.")}
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#8B7050' }}>
              <span style={{ background: 'rgba(232,160,32,0.2)', color: 'var(--harvest)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600 }}>
                {t("✓ Serving Karnataka")}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>{t("Platform")}</h4>
            {[
              { to: '/equipment', label: t('Browse Equipment') },
              { to: '/specialists', label: t('Find Specialists') },
              { to: '/requirements', label: t('Notice Board') },
              { to: '/seasonal', label: t('Season Calendar') },
              { to: '/list-equipment', label: t('List Your Equipment') },
              { to: '/become-specialist', label: t('Register as Specialist') },
            ].map(link => (
              <Link key={link.to} to={link.to} style={{
                display: 'block', color: '#B8997A', fontSize: '0.85rem',
                marginBottom: '0.5rem', textDecoration: 'none', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--harvest)'}
              onMouseLeave={e => e.target.style.color = '#B8997A'}
              >
                → {link.label}
              </Link>
            ))}
          </div>

          {/* For Users */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>{t("For Users")}</h4>
            {[
              { to: '/register', label: t('Create Account') },
              { to: '/dashboard', label: t('My Dashboard') },
              { to: '/login', label: t('Sign In') },
            ].map(link => (
              <Link key={link.to} to={link.to} style={{
                display: 'block', color: '#B8997A', fontSize: '0.85rem',
                marginBottom: '0.5rem', textDecoration: 'none', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--harvest)'}
              onMouseLeave={e => e.target.style.color = '#B8997A'}
              >
                → {link.label}
              </Link>
            ))}
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>{t("Languages")}</h4>
              {['English', 'ಕನ್ನಡ', 'हिंदी'].map(lang => (
                <span key={lang} style={{
                  display: 'inline-block', marginRight: '0.5rem', marginBottom: '0.5rem',
                  background: 'rgba(255,255,255,0.08)', color: '#D4B896',
                  padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem',
                }}>
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>{t("Contact")}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: <FiPhone />, text: '+91 80000 00000' },
                { icon: <FiMail />, text: 'support@ruralxchange.in' },
                { icon: <FiMapPin />, text: 'Bengaluru, Karnataka' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B8997A', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--harvest)' }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#8B7050', lineHeight: 1.6 }}>
                <strong style={{ color: '#B8997A' }}>B.M.S. College of Engineering</strong><br />
                Dept. of Information Science & Engineering<br />
                Capstone Project · AY 2025-26
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#6B5035' }}>
            © {new Date().getFullYear()} RuralXchange. Built with ❤️ for rural India.
          </p>
          <p style={{ fontSize: '0.8rem', color: '#6B5035' }}>
            MERN Stack · MongoDB · Express · React · Node.js
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
