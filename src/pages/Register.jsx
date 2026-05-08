import React, { useState, useRef, useEffect } from 'react';
import { Camera, UserPlus, ShieldAlert, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';

const Register = ({ setIsRegistered }) => {
  const navigate = useNavigate();
  const [captured, setCaptured] = useState(false);
  
  // Real camera refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Admin auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState(false);
  
  const [district, setDistrict] = useState('District 1 - Cyber Sector');
  const [fullName, setFullName] = useState('');
  const [voterId, setVoterId] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      // Try local models first, then fallback to CDN
      const MODEL_URL = '/models'; 
      const BACKUP_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), // Faster for Web
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]).catch(async () => {
          console.log("Local models not found, loading from CDN...");
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(BACKUP_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(BACKUP_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(BACKUP_URL)
          ]);
        });
        setModelsLoaded(true);
        console.log("Face-API models loaded successfully");
      } catch (err) {
        console.error("Error loading face-api models:", err);
        alert("Warning: Face recognition models failed to load. Please check your internet connection.");
      }
    };
    loadModels();
  }, []);

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (adminCode === 'ADHI2004') {
      setIsAdmin(true);
      setAdminError(false);
    } else {
      setAdminError(true);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!faceDescriptor) {
      alert("Please capture your face first.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          voterId,
          district,
          faceDescriptor: Array.from(faceDescriptor)
        })
      });

      const result = await response.json();

      if (result.success) {
        if (setIsRegistered) setIsRegistered(true);
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        alert("Registration Failed: " + result.message);
      }

    } catch (err) {
      console.error(err);
      alert("Network Error during registration");
    }
  };

  useEffect(() => {
    let stream;
    if (isAdmin && !captured) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Error accessing camera:", err));
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isAdmin, captured]);

  const capturePhoto = async () => {
    if (!modelsLoaded) {
      alert("Please wait while models are loading...");
      return;
    }

    if (videoRef.current && canvasRef.current) {
      setIsProcessing(true);
      try {
        // Use TinyFaceDetector for better performance in the browser
        const detection = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

        if (detection) {
          setFaceDescriptor(detection.descriptor);
          const context = canvasRef.current.getContext('2d');
          context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          setCaptured(true);
        } else {
          alert("No face detected! Please center your face in the camera and ensure good lighting.");
        }
      } catch (err) {
        console.error("Capture error:", err);
        alert("An error occurred during scanning. Please refresh and try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const retakePhoto = () => {
    setCaptured(false);
  };

  if (!isAdmin) {
    return (
      <div className="page-wrapper container flex-center">
        <div className="glass-panel" style={{ 
          maxWidth: '450px', 
          width: '100%', 
          padding: '40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '100px', height: '100px', background: 'var(--neon-gold)', filter: 'blur(80px)', opacity: 0.1 }}></div>
          
          <ShieldAlert size={56} color="var(--neon-gold)" style={{ margin: '0 auto 20px auto' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Admin Access Required</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '30px' }}>
            Voter registration is restricted to authorized election officials only. Please enter the override passcode.
          </p>

          <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter Override Code..." 
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                style={{ 
                  textAlign: 'center', 
                  letterSpacing: '3px',
                  borderColor: adminError ? '#ff4444' : 'var(--glass-border)'
                }}
                required 
              />
              {adminError && <div style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '8px' }}>ACCESS DENIED. INVALID CLEARANCE.</div>}
            </div>

            <button type="submit" className="btn-gold" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <Key size={18} />
              AUTHENTICATE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper container flex-center">
      <div className="glass-panel" style={{ 
        maxWidth: '800px', 
        width: '100%', 
        padding: '40px',
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)',
        gap: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        <style>
        {`
          @media (max-width: 768px) {
            .register-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
        </style>

        <div style={{ position: 'absolute', top: '0', left: '0', height: '100%', width: '4px', background: 'linear-gradient(to bottom, var(--neon-blue), transparent)' }}></div>

        {/* Left Col - Face Capture */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Voter Registration</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Capture facial biometrics to create a secure digital voting identity.</p>
          </div>

          <div style={{
            width: '100%',
            height: '250px',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            borderRadius: '12px',
            background: captured ? 'rgba(37, 99, 235, 0.05)' : '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: captured ? 'none' : 'block' }} 
            />
            <canvas 
              ref={canvasRef} 
              width="300" 
              height="250" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: captured ? 'block' : 'none' }} 
            />
            
            {/* Guide Overlay */}
            <div style={{ position: 'absolute', pointerEvents: 'none', width: '120px', height: '150px', border: '2px dashed rgba(0, 243, 255, 0.5)', borderRadius: '50%', boxShadow: captured ? '0 0 15px var(--neon-blue-glow)' : 'none' }}></div>
            
            {captured && (
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--neon-blue)', color: '#000', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>CAPTURED</div>
            )}
          </div>

          <button 
            type="button" 
            className={!modelsLoaded || isProcessing ? "btn-disabled" : "btn-primary"} 
            style={{ width: '100%' }}
            onClick={captured ? retakePhoto : capturePhoto}
            disabled={!modelsLoaded || isProcessing}
          >
            {isProcessing ? 'PROCESSING...' : (captured ? 'RE-TAKE SCAN' : 'CAPTURE FACE')}
          </button>
        </div>

        {/* Right Col - Form */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} onSubmit={handleRegister}>
            
            <div>
              <label className="input-label">FULL NAME</label>
              <input type="text" className="input-field" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div>
              <label className="input-label">VOTER IDENTIFICATION NUMBER</label>
              <input type="text" className="input-field" placeholder="VOT-9876-5432-10" value={voterId} onChange={(e) => setVoterId(e.target.value)} required />
            </div>

            <div>
              <label className="input-label">RESIDENTIAL DISTRICT</label>
              <select className="input-field" value={district} onChange={(e) => setDistrict(e.target.value)} style={{ appearance: 'none', background: 'var(--bg-dark)' }}>
                <option value="District 1 - Cyber Sector">District 1 - Cyber Sector</option>
                <option value="District 2 - Neon Heights">District 2 - Neon Heights</option>
                <option value="District 3 - Nexus Grid">District 3 - Nexus Grid</option>
              </select>
            </div>

            <button type="submit" className={captured ? "btn-gold" : "btn-disabled"} disabled={!captured} style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <UserPlus size={20} />
              ENCRYPT & REGISTER
            </button>
            {!captured && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>Face scan required to submit.</p>}

          </form>
        </div>

      </div>
    </div>
  );
}

export default Register;
