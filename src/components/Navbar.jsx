import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Fingerprint, Activity } from 'lucide-react';

const Navbar = ({ isAuthenticated }) => {
  const location = useLocation();

  const navLinks = [
    { path: '/register', label: 'Register' },
    { path: '/login', label: 'Authenticate' },
    ...(isAuthenticated ? [{ path: '/voting', label: 'Vote' }] : []),
    { path: '/results', label: 'Live Results' }
  ];

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--glass-border)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '80px'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(37, 99, 235, 0.05)',
            padding: '10px',
            borderRadius: '12px',
            border: '1px solid var(--neon-blue)'
          }}>
            <Shield size={24} color="var(--neon-blue)" />
          </div>
          <span style={{ 
            fontSize: '1.2rem', 
            fontWeight: 700, 
            letterSpacing: '1px',
            color: 'var(--text-primary)'
          }}>
            SECURE<span className="neon-text-blue">VOTE</span>
          </span>
        </Link>

        <nav style={{ display: 'flex', gap: '24px' }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                style={{
                  textDecoration: 'none',
                  color: isActive ? 'var(--neon-blue)' : 'var(--text-secondary)',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  padding: '8px 0',
                  borderBottom: isActive ? '2px solid var(--neon-blue)' : '2px solid transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
