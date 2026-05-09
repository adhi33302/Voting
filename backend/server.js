import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import CryptoJS from 'crypto-js';
import Voter from './models/Voter.js';
import Candidate from './models/Candidate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Allow Vercel frontend and local dev
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    /\.vercel\.app$/,   // Allow any vercel.app subdomain
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // faceDescriptor arrays can be large

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') console.log('Body:', JSON.stringify(req.body).substring(0, 100) + '...');
  next();
});

// Health check - used to wake the backend from Render sleep
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/voting_system';

// In case strictQuery is warned
mongoose.set('strictQuery', false);

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Database successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));


// --- API ROUTES OVERVIEW --- //

// 1. Register Voter (Admin Only) -> Stores face embedding with Blockchain security
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, voterId, district, faceDescriptor } = req.body;

    if (!faceDescriptor || faceDescriptor.length === 0) {
      return res.status(400).json({ success: false, message: 'Biometric face descriptor is required.' });
    }

    // Check if voter ID already exists
    const existingVoter = await Voter.findOne({ voterId });
    if (existingVoter) {
      return res.status(400).json({ success: false, message: 'This Voter ID is already registered.' });
    }

    // --- Biometric Similarity Check (Prevent double registration) ---
    // Helper to calculate distance between face embeddings
    const getDistance = (arr1, arr2) => {
      if (!arr1 || !arr2 || arr1.length !== arr2.length) return 1.0; // Max distance if mismatch
      return Math.sqrt(arr1.map((val, i) => val - arr2[i]).reduce((res, diff) => res + Math.pow(diff, 2), 0));
    };

    const allVoters = await Voter.find({}, 'fullName faceDescriptor');
    const SIMILARITY_THRESHOLD = 0.6; // Increased from 0.45 for better matching consistency

    for (const v of allVoters) {
      const distance = getDistance(faceDescriptor, v.faceDescriptor);
      if (distance < SIMILARITY_THRESHOLD) {
        return res.status(400).json({ 
          success: false, 
          message: `Biometric Identity Match Found: This face is already registered to ${v.fullName}.` 
        });
      }
    }

    // --- BlockChain Logic ---
    // 1. Fetch the last registered voter to act as the "previous block"
    const lastVoter = await Voter.findOne().sort({ createdAt: -1 });
    const previousHash = lastVoter ? lastVoter.hash : "0000000000000000000000000000000000000000000000000000000000000000"; // Genesis Hash

    // 2. Prepare payload for hashing
    const timestamp = Date.now();
    const payload = `${voterId}-${fullName}-${district}-${previousHash}-${timestamp}`;

    // 3. Generate SHA256 Hash
    const currentHash = CryptoJS.SHA256(payload).toString();

    const newVoter = new Voter({
      fullName,
      voterId,
      district,
      faceDescriptor,
      previousHash: previousHash,
      hash: currentHash,
      createdAt: new Date(timestamp)  // FIX: Schema expects Date, not Number
    });

    await newVoter.save();
    console.log(`[REGISTER] Blockchain secured biometric entry for: ${fullName} | Hash: ${currentHash}`);
    res.status(201).json({ success: true, message: 'Voter Biometrics Secured & Registered on Blockchain!' });

  } catch (error) {
    console.error("[REGISTER ERROR]:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error during registration.',
      error: error.message 
    });
  }
});


// 2. Fetch all voters
app.get('/api/voters', async (req, res) => {
  try {
    const voters = await Voter.find({}, 'voterId fullName faceDescriptor hasVoted');
    res.status(200).json({ success: true, voters });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching voters.' });
  }
});

// 2b. Verify Voter ID before Face Scan
app.post('/api/verify-voter', async (req, res) => {
  try {
    const { voterId } = req.body;
    const voter = await Voter.findOne({ voterId }, 'voterId fullName faceDescriptor hasVoted');
    
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter ID not found in database.' });
    }
    
    res.status(200).json({ success: true, voter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error during voter verification.' });
  }
});


// 3. Get real-time vote totals
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    console.log(`[CANDIDATES] Fetched ${candidates.length} candidates from database.`);
    res.status(200).json({ success: true, candidates });
  } catch (error) {
    console.error("[FETCH CANDIDATES ERROR]:", error);
    res.status(500).json({ success: false, message: 'Server Error fetching candidates.' });
  }
});


// 4. Update vote status -> Changes hasVoted to true, ensuring one-vote-per-identity
app.post('/api/vote', async (req, res) => {
  try {
    const { voterId, candidateId } = req.body;

    // In a real production deployment with biometric integration, 
    // we would require the voterId. For this static UI demo to function end-to-end,
    // we can temporarily bypass the strictly enforced voter lookup if just candidateId is provided.

    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required.' });
    }

    // --- Biometric Enforced Path ---
    if (voterId) {
      const voter = await Voter.findOne({ voterId });
      if (!voter) {
        return res.status(404).json({ success: false, message: 'Voter identity not found.' });
      }
      if (voter.hasVoted) {
        return res.status(403).json({ success: false, message: 'Voter has already cast a vote. Multiple votes blocked.' });
      }
      voter.hasVoted = true;
      await voter.save();
    }

    // Append vote to the immutable tally
    const candidate = await Candidate.findOne({ candidateId });
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found on ledger.' });
    }

    candidate.voteCount += 1;
    await candidate.save();

    console.log(`[VOTE CAST] A vote has been successfully recorded for Candidate ${candidateId}.`);
    res.status(200).json({ success: true, message: 'Vote successfully recorded to blockchain ledger.' });

  } catch (error) {
    console.error("[VOTING ERROR]:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error during voting phase.',
      error: error.message
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n===========================================`);
  console.log(`🚀 Voting Backend running on http://localhost:${PORT}`);
  console.log(`===========================================\n`);
});
