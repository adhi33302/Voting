import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Cpu, Fingerprint } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper container flex-center" style={{ flexDirection: 'column', textAlign: 'center' }}>
      
      <div style={{
        marginTop: '2rem',
        marginBottom: '2rem',
        display: 'inline-block',
        padding: '16px 32px',
        background: 'rgba(37, 99, 235, 0.05)',
        border: '1px solid rgba(37, 99, 235, 0.1)',
        borderRadius: '50px',
        color: 'var(--neon-blue)',
        fontWeight: 600,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        fontSize: '0.85rem',
        boxShadow: '0 0 20px rgba(0, 243, 255, 0.1)'
      }}>
        Next-Generation Voting Protocol
      </div>

      <h1 style={{ 
        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
        lineHeight: 1.1, 
        fontWeight: 700,
        marginBottom: '1.5rem',
        color: 'var(--text-primary)'
      }}>
        Secure Blockchain <br />
        <span className="neon-text-blue" style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}>Voting System</span>
      </h1>

      <p style={{
        maxWidth: '700px',
        margin: '0 auto 3rem auto',
        fontSize: '1.2rem',
        lineHeight: 1.6,
        color: 'var(--text-secondary)',
        fontWeight: 300
      }}>
        A decentralized, transparent, and immutable voting architecture powered by advanced blockchain technology and biometric facial recognition.
      </p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '5rem' }}>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        width: '100%'
      }}>
        
        <div className="glass-card" style={{ padding: '32px', textAlign: 'left' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0, 243, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid var(--neon-blue)' }}>
            <Lock size={24} color="var(--neon-blue)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Immutable Ledger</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Votes are securely encrypted and stored on a decentralized network, ensuring zero tampering or fraud.</p>
        </div>

        <div className="glass-card" style={{ padding: '32px', textAlign: 'left' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255, 204, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid var(--neon-gold)' }}>
            <Fingerprint size={24} color="var(--neon-gold)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Biometric Auth</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>AI-driven facial recognition ensures strictly one vote per verified real identity.</p>
        </div>

        <div className="glass-card" style={{ padding: '32px', textAlign: 'left' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0, 243, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid var(--neon-blue)' }}>
            <Cpu size={24} color="var(--neon-blue)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Real-Time Tally</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Smart contracts instantly verify and count votes to provide transparent realtime results.</p>
        </div>

      </div>
    </div>
  );
};

export default Landing;
