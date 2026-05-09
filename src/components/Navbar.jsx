import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Fingerprint, Activity, UserPlus, Home, ChevronRight, X, Menu } from 'lucide-react';

const Navbar = ({ isAuthenticated }) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/register', label: 'Register', icon: UserPlus },
    { path: '/login', label: 'Authenticate', icon: Fingerprint },
    ...(isAuthenticated ? [{ path: '/voting', label: 'Vote', icon: Shield }] : []),
    { path: '/results', label: 'Live Results', icon: Activity }
  ];

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* ── Top Navbar ── */}
      <header className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={closeDrawer}>
            <div className="navbar-logo-icon">
              <Shield size={22} color="var(--neon-blue)" />
            </div>
            <span className="navbar-logo-text">
              SECURE<span className="neon-text-blue">VOTE</span>
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="navbar-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link${location.pathname === link.path ? ' active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Hamburger — visible on mobile only */}
          <button
            className="navbar-hamburger"
            aria-label="Toggle menu"
            onClick={() => setDrawerOpen((v) => !v)}
          >
            {drawerOpen
              ? <X size={22} color="var(--text-primary)" />
              : <Menu size={22} color="var(--text-primary)" />
            }
          </button>
        </div>
      </header>

      {/* ── Mobile Slide-down Drawer ── */}
      <nav className={`navbar-drawer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen}>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`drawer-link${location.pathname === link.path ? ' active' : ''}`}
            onClick={closeDrawer}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <link.icon size={18} />
              {link.label}
            </span>
            <ChevronRight size={16} style={{ opacity: 0.4 }} />
          </Link>
        ))}
      </nav>

      {/* ── Mobile Bottom Nav (phones) ── */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <div className="mobile-bottom-nav-inner">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-nav-item${isActive ? ' active' : ''}`}
                onClick={closeDrawer}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Backdrop overlay for drawer */}
      {drawerOpen && (
        <div
          onClick={closeDrawer}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 198,
            background: 'rgba(0,0,0,0.15)',
            backdropFilter: 'blur(2px)'
          }}
        />
      )}
    </>
  );
};

export default Navbar;
