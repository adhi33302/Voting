import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Cpu, Fingerprint } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper container flex-center" style={{ flexDirection: 'column', textAlign: 'center' }}>

      <div className="landing-hero-badge" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
        Next-Generation Voting Protocol
      </div>

      <h1 style={{
        fontSize: 'clamp(2rem, 6vw, 4.5rem)',
        lineHeight: 1.1,
        fontWeight: 700,
        marginBottom: '1.2rem',
        color: 'var(--text-primary)'
      }}>
        Secure Blockchain <br />
        <span className="neon-text-blue" style={{ fontSize: 'clamp(2.4rem, 7vw, 5.5rem)' }}>Voting System</span>
      </h1>

      <p style={{
        maxWidth: '680px',
        margin: '0 auto 2.5rem auto',
        fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
        lineHeight: 1.6,
        color: 'var(--text-secondary)',
        fontWeight: 300,
        padding: '0 8px'
      }}>
        A decentralized, transparent, and immutable voting architecture powered by advanced blockchain technology and biometric facial recognition.
      </p>

      <div className="landing-cta-group">
        <button className="btn-primary" onClick={() => navigate('/login')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Fingerprint size={20} />
          Start Voting
        </button>
        <button className="btn-gold" onClick={() => navigate('/results')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} />
          Live Results
        </button>
      </div>

      {/* Feature Cards */}
      <div className="landing-features-grid">

        <div className="glass-card" style={{ padding: '28px', textAlign: 'left' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', border: '1px solid var(--neon-blue)' }}>
            <Lock size={22} color="var(--neon-blue)" />
          </div>
          <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', marginBottom: '10px', color: 'var(--text-primary)' }}>Immutable Ledger</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>Votes are securely encrypted and stored on a decentralized network, ensuring zero tampering or fraud.</p>
        </div>

        <div className="glass-card" style={{ padding: '28px', textAlign: 'left' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(217, 119, 6, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', border: '1px solid var(--neon-gold)' }}>
            <Fingerprint size={22} color="var(--neon-gold)" />
          </div>
          <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', marginBottom: '10px', color: 'var(--text-primary)' }}>Biometric Auth</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>AI-driven facial recognition ensures strictly one vote per verified real identity.</p>
        </div>

        <div className="glass-card" style={{ padding: '28px', textAlign: 'left' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', border: '1px solid var(--neon-blue)' }}>
            <Cpu size={22} color="var(--neon-blue)" />
          </div>
          <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', marginBottom: '10px', color: 'var(--text-primary)' }}>Real-Time Tally</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>Smart contracts instantly verify and count votes to provide transparent real-time results.</p>
        </div>

      </div>
    </div>
  );
};

export default Landing;
