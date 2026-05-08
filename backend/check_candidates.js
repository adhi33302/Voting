import mongoose from 'mongoose';
import Candidate from './models/Candidate.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/voting_system';

async function check() {
  await mongoose.connect(MONGO_URI);
  const candidates = await Candidate.find({});
  console.log(`Found ${candidates.length} candidates:`);
  candidates.forEach(c => {
    console.log(`- ${c.name} (${c.party}) ID: ${c.candidateId}`);
  });
  process.exit(0);
}

check();
