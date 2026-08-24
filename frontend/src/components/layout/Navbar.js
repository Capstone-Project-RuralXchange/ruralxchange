import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiPlusCircle, FiGlobe } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const languageMap = {
    en: 'English',
    kn: 'ಕನ್ನಡ',
    hi: 'हिंदी',
  };
  
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    transition: 'all 0.3s ease',
    background: scrolled ? 'rgba(253,246,227,0.97)' : '#FDF6E3',
    borderBottom: `1px solid ${scrolled ? '#E8D5B0' : '#F0E0C0'}`,
    boxShadow: scrolled ? '0 4px 20px rgba(45,27,14,0.08)' : 'none',
    backdropFilter: scrolled ? 'blur(10px)' : 'none',
  };

  const linkStyle = (path) => ({
    color: isActive(path) ? 'var(--terracotta)' : 'var(--text-secondary)',
    fontWeight: isActive(path) ? 700 : 500,
    fontSize: '0.9rem',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius)',
    transition: 'all 0.2s',
    background: isActive(path) ? 'rgba(193,68,14,0.08)' : 'transparent',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  });

  return (
    <nav style={navStyle}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--terracotta), var(--harvest))',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(193,68,14,0.3)'
          }}>
            <GiWheat style={{ color: 'white', fontSize: '1.2rem' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--soil)', letterSpacing: '-0.5px' }}>
              RuralX<span style={{ color: 'var(--terracotta)' }}>change</span>
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '-2px' }}>Rural Service Marketplace</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          <Link to="/equipment" style={linkStyle('/equipment')}>{t('Equipment')}</Link>
          <Link to="/specialists" style={linkStyle('/specialists')}>{t('Specialists')}</Link>
          <Link to="/requirements" style={linkStyle('/requirements')}>{t('Notice Board')}</Link>
          <Link to="/seasonal" style={linkStyle('/seasonal')}>🗓️ {t('Season')}</Link>
        </div>

        {/* Auth section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Language Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '0.4rem 0.6rem',
                cursor: 'pointer', color: 'var(--soil)', fontSize: '0.85rem', fontWeight: 600
              }}
            >
              <FiGlobe /> {i18n.language.toUpperCase()}
            </button>
            {langDropdownOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '110%',
                background: 'white', borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
                minWidth: 120, zIndex: 100
              }}>
                {Object.entries(languageMap).map(([code, label]) => (
                    <button
                      key={code}
                      onClick={() => { i18n.changeLanguage(code); localStorage.setItem('language', code); setLangDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '0.5rem 1rem',
                        textAlign: 'left',
                        background: i18n.language === code ? '#FFF5EC' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {label}
                    </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'linear-gradient(135deg, #FFF5EC, #FFE8D0)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '0.4rem 0.9rem 0.4rem 0.4rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--terracotta), var(--harvest))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.85rem'
                }}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.875rem' }}>
                  {(user?.name || 'User').split(' ')[0]}
                </span>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: 'white', borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                  minWidth: 200, zIndex: 100,
                  animation: 'scaleIn 0.15s ease'
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--soil)', fontSize: '0.9rem' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{user?.district} · {user?.role}</div>
                  </div>
                  {[
                    { to: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
                    { to: '/profile', icon: <FiUser />, label: 'My Profile' },
                    { to: '/list-equipment', icon: <FiPlusCircle />, label: 'List Equipment' },
                  ].map(item => (
                    <Link key={item.to} to={item.to} style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.65rem 1rem', color: 'var(--text-secondary)',
                      fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.15s',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF5EC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ color: 'var(--terracotta)' }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem' }}>
                    <button onClick={logout} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.65rem 0.75rem', background: 'none', border: 'none',
                      cursor: 'pointer', color: '#C1440E', fontSize: '0.875rem', fontWeight: 600,
                      borderRadius: 'var(--radius)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF0EA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">{t('Sign In')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm">{t('Join Free')}</Link>
            </>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--soil)', fontSize: '1.4rem', display: 'none' }}
            className="hamburger"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{
          background: 'white', borderTop: '1px solid var(--border)',
          padding: '1rem', animation: 'fadeIn 0.2s ease'
        }}>
          {[
            { to: '/equipment', label: `🚜 ${t('Equipment')}` },
            { to: '/specialists', label: `👷 ${t('Specialists')}` },
            { to: '/requirements', label: `📋 ${t('Notice Board')}` },
            { to: '/seasonal', label: `🗓️ ${t('Season')}` },
            { to: '/dashboard', label: `📊 ${t('Dashboard')}`, auth: true },
          ].map(item => (!item.auth || user) && (
            <Link key={item.to} to={item.to} style={{
              display: 'block', padding: '0.75rem 0.5rem',
              color: 'var(--text-primary)', fontWeight: 500,
              borderBottom: '1px solid var(--border)', textDecoration: 'none',
            }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
