import React, { useState, useEffect } from 'react';
import { Activity, Shield, Users } from 'lucide-react';

const Results = () => {
  const [totalVotes, setTotalVotes] = useState(0);
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Fetch live data immediately and then poll every 3 seconds
    const fetchResults = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/candidates`);
        const data = await res.json();
        
        if (data.success) {
          // Sort by votes (descending)
          const sorted = data.candidates.sort((a,b) => b.voteCount - a.voteCount);
          setResults(sorted);
          
          // Calculate true total
          const sum = sorted.reduce((acc, curr) => acc + curr.voteCount, 0);
          setTotalVotes(sum);
        }
      } catch (err) {
        console.error("Error fetching live results:", err);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-wrapper container">
      
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Live Blockchain Tally</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div style={{ 
            background: 'rgba(0, 243, 255, 0.1)', 
            padding: '12px 24px', 
            borderRadius: '50px', 
            border: '1px solid var(--neon-blue)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Activity size={20} color="var(--neon-blue)" />
            <span style={{ color: 'var(--text-primary)' }}>Blockchain Sync: <span className="neon-text-blue">ACTIVE</span></span>
          </div>
          <div style={{ 
            background: 'rgba(255, 204, 0, 0.1)', 
            padding: '12px 24px', 
            borderRadius: '50px', 
            border: '1px solid var(--neon-gold)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Users size={20} color="var(--neon-gold)" />
            <span style={{ color: 'var(--text-primary)' }}>Total Verified Votes: <strong style={{ color: 'var(--neon-gold)' }}>{totalVotes.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        
        {results.map((candidate, index) => {
          const percentage = totalVotes === 0 ? 0 : ((candidate.voteCount / totalVotes) * 100).toFixed(1);
          
          return (
            <div key={candidate.candidateId} style={{ marginBottom: '30px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {index + 1}. {candidate.name}
                </span>
                <span style={{ fontSize: '1.2rem', color: candidate.color, fontWeight: 'bold' }}>
                  {percentage}% ({candidate.voteCount.toLocaleString()})
                </span>
              </div>

              {/* Progress Bar Container */}
              <div style={{ 
                width: '100%', 
                height: '24px', 
                background: 'var(--bg-darker)', 
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                {/* Progress Bar Fill */}
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, transparent, ${candidate.color})`,
                  boxShadow: `0 0 10px ${candidate.color}`,
                  borderRadius: '12px',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '4px',
                    height: '100%',
                    background: '#fff',
                    opacity: 0.5
                  }}></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  );
};

export default Results;
