import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle, Fingerprint } from 'lucide-react';
import * as faceapi from 'face-api.js';

const FaceLogin = ({ isRegistered, setIsAuthenticated, hasVoted }) => {
  const [step, setStep] = useState(0); // 0: ID Input, 1: Scan, 2: Success
  const [inputVoterId, setInputVoterId] = useState('');
  const [verifiedVoter, setVerifiedVoter] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [scanError, setScanError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveDistance, setLiveDistance] = useState(null); // real-time match score
  const [matchCount, setMatchCount] = useState(0);        // consecutive confirmed frames
  const navigate = useNavigate();
  
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; 
      const BACKUP_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      
      try {
        // Load from local first, fallback to CDN
        // ssdMobilenetv1 is significantly more accurate than TinyFaceDetector
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]).catch(async () => {
          console.log("Local models not found, loading from CDN...");
          await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(BACKUP_URL),
            faceapi.nets.tinyFaceDetector.loadFromUri(BACKUP_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(BACKUP_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(BACKUP_URL)
          ]);
        });
        setModelsLoaded(true);
        console.log("Face-API models (including SSD) loaded successfully");
      } catch (err) {
        console.error("Error loading models:", err);
      }
    };
    loadModels();
  }, []);

  // Use a ref to keep track of scanning loop
  const scanningLoopRef = useRef(false);

  useEffect(() => {
    let stream;
    if (step === 1 && !authenticated) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Start scanning automatically once video is ready
            videoRef.current.onloadedmetadata = () => {
              handleAutoScan();
            };
          }
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
          alert("Could not access camera. Please ensure permissions are granted.");
        });
    }
    return () => {
      scanningLoopRef.current = false;
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [step, authenticated]);

  const handleAutoScan = async () => {
    if (scanningLoopRef.current || authenticated) return;
    scanningLoopRef.current = true;
    setScanning(true);
    setScanError(false);
    setLiveDistance(null);
    setMatchCount(0);

    // ─── Security constants ───────────────────────────────────────────────
    // A strict threshold: face embeddings further than this are rejected.
    // Face-api Euclidean distance: identical faces ≈ 0.0, different faces > 0.6
    // 0.38 allows natural lighting variation while blocking similar-looking people.
    const SIMILARITY_THRESHOLD = 0.38;

    // Require this many *consecutive* frames within threshold before granting access.
    // A random photo or look-alike is very unlikely to match 3 frames in a row.
    const REQUIRED_CONSECUTIVE_MATCHES = 3;

    const MAX_ATTEMPTS = 40; // ~20 seconds at 500ms intervals
    let attempts = 0;
    let consecutiveMatches = 0;

    console.log(`[BiometricScan] Starting — threshold: ${SIMILARITY_THRESHOLD}, required frames: ${REQUIRED_CONSECUTIVE_MATCHES}`);

    while (scanningLoopRef.current && !authenticated && attempts < MAX_ATTEMPTS) {
      if (!videoRef.current || !verifiedVoter || !modelsLoaded) break;

      try {
        // Prefer SsdMobilenetv1 (higher accuracy) — fall back to TinyFaceDetector
        let detection = null;
        try {
          detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.6 }))
            .withFaceLandmarks()
            .withFaceDescriptor();
        } catch {
          detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptor();
        }

        if (detection) {
          const liveDescriptor = detection.descriptor;
          const savedDescriptor = new Float32Array(verifiedVoter.faceDescriptor);
          const distance = faceapi.euclideanDistance(liveDescriptor, savedDescriptor);

          setLiveDistance(distance);
          console.log(`[BiometricScan] Attempt ${attempts + 1} — distance: ${distance.toFixed(4)}, consecutive: ${consecutiveMatches}`);

          if (distance < SIMILARITY_THRESHOLD) {
            consecutiveMatches++;
            setMatchCount(consecutiveMatches);

            if (consecutiveMatches >= REQUIRED_CONSECUTIVE_MATCHES) {
              // ✅ Confirmed — enough consecutive frames matched
              setAuthenticated(true);
              setScanning(false);
              scanningLoopRef.current = false;
              setStep(2);
              if (setIsAuthenticated) setIsAuthenticated(true);
              setTimeout(() => {
                navigate('/voting', { state: { voterId: verifiedVoter.voterId } });
              }, 1500);
              return;
            }
          } else {
            // Reset streak — one bad frame resets the counter
            consecutiveMatches = 0;
            setMatchCount(0);
          }
        } else {
          // No face detected in frame — also resets streak
          consecutiveMatches = 0;
          setMatchCount(0);
        }
      } catch (err) {
        console.error("Scanning attempt failed:", err);
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Timed out without enough consecutive matches
    if (!authenticated && scanningLoopRef.current) {
      setScanning(false);
      setScanError(true);
      setLiveDistance(null);
      scanningLoopRef.current = false;
    }
  };

  const handleVerifyId = async (e) => {
    e.preventDefault();
    if (!inputVoterId.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/verify-voter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId: inputVoterId })
      });
      const data = await response.json();

      if (data.success) {
        if (data.voter.hasVoted) {
          alert("This voter has already cast their vote.");
        } else {
          setVerifiedVoter(data.voter);
          setStep(1);
        }
      } else {
        alert(data.message || "Invalid Voter ID");
      }
    } catch (err) {
      console.error("Verification error:", err);
      alert("Network error. Please ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    // Manual retry if auto-scan timed out or failed
    handleAutoScan();
  };

  return (
    <div className="page-wrapper container flex-center">
      <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '40px', textAlign: 'center', position: 'relative' }}>
        
        <Fingerprint size={48} color={authenticated ? "var(--neon-gold)" : "var(--neon-blue)"} style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Secure Login</h2>
        
        {step === 0 && (
          <form onSubmit={handleVerifyId} style={{ marginTop: '30px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Please enter your Voter ID to begin biometric verification.</p>
            <input 
              type="text" 
              className="input-field" 
              placeholder="VOT-XXXX-XXXX" 
              value={inputVoterId} 
              onChange={(e) => setInputVoterId(e.target.value)} 
              required
              style={{ textAlign: 'center', letterSpacing: '1px', marginBottom: '20px' }}
            />
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'VERIFYING...' : 'VERIFY IDENTITY'}
            </button>
          </form>
        )}

        {step >= 1 && (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
              ID Verified: <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>{verifiedVoter?.fullName}</span><br />
              Position your face for biometric authentication.
            </p>

            <div className="face-scanner-box" style={{
              border: authenticated
                ? '2px solid var(--neon-gold)'
                : scanError
                  ? '2px solid rgba(255, 68, 68, 0.7)'
                  : '2px dashed rgba(37, 99, 235, 0.4)',
              background: 'var(--bg-darker)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.5s ease'
            }} className={`face-scanner-box${scanning ? ' pulse-active' : ''}`}>

              {/* Camera feed - always visible while on scan step */}
              {step === 1 && !authenticated && (
                <video ref={videoRef} autoPlay playsInline muted style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  objectFit: 'cover',
                  opacity: scanning ? 0.3 : 1,
                  transition: 'opacity 0.3s ease'
                }} />
              )}

              {/* Decorative Corners — red tint on error */}
              {['top-left','top-right','bottom-left','bottom-right'].map((pos) => {
                const isTop = pos.startsWith('top');
                const isLeft = pos.endsWith('left');
                const cornerColor = scanError ? '#ff4444' : 'var(--neon-blue)';
                return (
                  <div key={pos} style={{
                    position: 'absolute',
                    top: isTop ? 10 : 'auto', bottom: !isTop ? 10 : 'auto',
                    left: isLeft ? 10 : 'auto', right: !isLeft ? 10 : 'auto',
                    width: 20, height: 20,
                    borderTop: isTop ? `3px solid ${cornerColor}` : 'none',
                    borderBottom: !isTop ? `3px solid ${cornerColor}` : 'none',
                    borderLeft: isLeft ? `3px solid ${cornerColor}` : 'none',
                    borderRight: !isLeft ? `3px solid ${cornerColor}` : 'none',
                    transition: 'border-color 0.4s ease'
                  }} />
                );
              })}

              {/* Scan-line animation — always shown when not authenticated */}
              {!authenticated && (
                <div className="scan-line" style={{
                  top: 0,
                  animation: 'scanningFrame 2s infinite linear',
                  zIndex: 10,
                  background: scanError ? 'rgba(255,68,68,0.5)' : undefined
                }} />
              )}

              {/* ANALYZING label + live confidence while actively scanning */}
              {scanning && (
                <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 11 }}>
                  <div style={{ color: 'var(--neon-blue)', fontSize: '0.8rem', letterSpacing: '2px', animation: 'blink 1s infinite' }}>
                    ANALYZING BIOMETRICS...
                  </div>
                  {liveDistance !== null && (
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px',
                      color: liveDistance < 0.38 ? '#00ff88' : liveDistance < 0.5 ? '#ffcc00' : '#ff4444',
                      background: 'rgba(0,0,0,0.55)', padding: '2px 10px', borderRadius: '4px'
                    }}>
                      {liveDistance < 0.38
                        ? `✔ MATCH — HOLD STILL (${matchCount}/3)`
                        : `DISTANCE: ${liveDistance.toFixed(3)} — NOT MATCHING`}
                    </div>
                  )}
                </div>
              )}

              {/* Warning banner — overlaid at bottom, camera stays live behind it */}
              {scanError && !scanning && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'rgba(180, 0, 0, 0.82)',
                  backdropFilter: 'blur(4px)',
                  padding: '12px 16px',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textAlign: 'center',
                  lineHeight: 1.5,
                  zIndex: 20,
                  animation: 'fadeIn 0.4s ease'
                }}>
                  ⚠ IDENTITY MISMATCH<br />
                  <span style={{ fontWeight: 400, fontSize: '0.72rem', opacity: 0.9 }}>
                    Face does not match Voter ID record. Please try again.
                  </span>
                </div>
              )}

              {/* Success state */}
              {authenticated && (
                <div style={{ animation: 'fadeIn 0.5s', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                  <CheckCircle size={80} color="var(--neon-gold)" />
                  <div style={{ marginTop: '20px', color: 'var(--neon-gold)', fontWeight: 600 }}>ACCESS GRANTED</div>
                </div>
              )}
            </div>

            {!authenticated && (
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={() => setStep(0)}>BACK</button>
                <button className="btn-primary" onClick={handleScan} disabled={scanning || !modelsLoaded}>
                  {scanning ? 'SCANNING...' : 'SCAN FACE'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FaceLogin;
