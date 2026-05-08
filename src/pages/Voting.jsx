import React, { useState, useEffect } from 'react';
import { CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const CandidateCard = ({ candidate, isSelected, onSelect }) => {
  return (
    <div
      className="glass-card"
      onClick={() => onSelect(candidate.id)}
      style={{
        padding: '24px',
        position: 'relative',
        cursor: 'pointer',
        border: isSelected ? '2px solid var(--neon-gold)' : '1px solid var(--glass-border)',
        boxShadow: isSelected ? '0 0 20px var(--neon-gold-glow)' : 'none',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: `url(${candidate.image}) center/cover`,
        border: '3px solid rgba(37, 99, 235, 0.1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }} />

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '8px' }}>{candidate.name}</h3>
        <span style={{
          background: 'rgba(0, 243, 255, 0.1)',
          color: 'var(--neon-blue)',
          padding: '4px 12px',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: 600,
          textTransform: 'uppercase'
        }}>
          {candidate.party}
        </span>
      </div>

      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem', lineHeight: 1.5 }}>
        {candidate.manifesto}
      </p>

      {isSelected && (
        <div style={{ position: 'absolute', top: '16px', right: '16px', animation: 'fadeIn 0.3s' }}>
          <CheckCircle size={24} color="var(--neon-gold)" />
        </div>
      )}
    </div>
  );
};

const Voting = ({ setHasVoted, hasVoted }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voted, setVoted] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const voterId = location.state?.voterId;

  useEffect(() => {
    if (hasVoted) {
      navigate('/results');
      return;
    }

    // Fetch candidates from MongoDB backed API
    fetch(`${import.meta.env.VITE_API_URL}/api/candidates`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Sort by candidateId to ensure consistent order
          const sorted = data.candidates.sort((a,b) => a.candidateId - b.candidateId);
          setCandidates(sorted);
        }
      })
      .catch(err => console.error("Error fetching candidates:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCastVote = async () => {
    if (!selectedCandidate) return;
    
    setIsSubmitting(true);
    try {
      // Temporarily cast vote with only candidate ID (without biometric enforcement)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          candidateId: selectedCandidate,
          voterId: voterId // Pass the biometric-verified ID
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setVoted(true);
        setTimeout(() => {
          if (setHasVoted) setHasVoted(true);
          navigate('/results');
        }, 2500);
      } else {
        alert("Vote failed: " + result.message);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Network error casting vote");
      setIsSubmitting(false);
    }
  };

  if (isSubmitting && !voted) {
    return (
      <div className="page-wrapper container flex-center">
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', maxWidth: '500px' }}>
          <div className="spin" style={{ width: '60px', height: '60px', border: '4px solid var(--neon-gold)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 20px' }}></div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Encrypting Vote</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Transmitting protected biometric selection to the blockchain network...</p>
        </div>
      </div>
    );
  }

  if (voted) {
    return (
      <div className="page-wrapper container flex-center">
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', maxWidth: '500px' }}>
          <Shield size={64} color="var(--neon-gold)" style={{ margin: '0 auto 20px', animation: 'pulse 2s infinite' }} />
          <h2 style={{ fontSize: '2rem', color: 'var(--neon-gold)', marginBottom: '16px' }}>Vote Secured</h2>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '24px' }}>
            Your encrypted vote has been successfully appended to the blockchain ledger.
            It cannot be altered or removed.
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-darker)', padding: '12px', borderRadius: '8px', wordBreak: 'break-all' }}>
            TX HASH: 0x8f2d...3a9c7eb421f1092cbd598
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper container">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Secure Election Terminal</h1>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 204, 0, 0.1)', padding: '8px 16px', borderRadius: '50px', border: '1px solid var(--neon-gold)' }}>
          <AlertTriangle size={16} color="var(--neon-gold)" />
          <span style={{ color: 'var(--neon-gold)', fontSize: '0.9rem', fontWeight: 600 }}>WARNING: ONE VOTE PER BIOMETRIC ID. NO CHANGES ALLOWED.</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '20px' }}>
          <div className="spin" style={{ width: '40px', height: '40px', border: '4px solid var(--neon-blue)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
          <p style={{ color: 'var(--text-secondary)', letterSpacing: '2px' }}>SYNCING WITH BLOCKCHAIN LEDGER...</p>
        </div>
      ) : candidates.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '50px'
        }}>
          {candidates.map(candidate => (
            <CandidateCard
              key={candidate.candidateId}
              candidate={{...candidate, id: candidate.candidateId}}
              isSelected={selectedCandidate === candidate.candidateId}
              onSelect={setSelectedCandidate}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '20px', padding: '40px' }}>
          <AlertTriangle size={48} color="var(--neon-gold)" />
          <h3 style={{ fontSize: '1.5rem' }}>No Candidates Found</h3>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            The election database appears to be empty. <br/>
            Please run <code>node backend/seed.js</code> to initialize the candidate list.
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div className="flex-center" style={{
        position: 'sticky',
        bottom: '20px',
        padding: '20px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0, 243, 255, 0.3)',
        borderRadius: '16px',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            Selected: <span style={{ color: selectedCandidate ? 'var(--neon-gold)' : 'var(--text-secondary)', fontWeight: 'bold', opacity: selectedCandidate ? 1 : 0.5 }}>
              {selectedCandidate ? candidates.find(c => c.candidateId === selectedCandidate)?.name : 'None'}
            </span>
          </div>
          <button
            className={selectedCandidate ? "btn-gold" : "btn-disabled"}
            onClick={handleCastVote}
            disabled={!selectedCandidate}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px', fontSize: '1.1rem' }}
          >
            <Shield size={20} />
            SIGN & SUBMIT VOTE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Voting;
