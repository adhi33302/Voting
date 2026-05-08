import mongoose from 'mongoose';
import Voter from './models/Voter.js';
import Candidate from './models/Candidate.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/voting_system';

async function check() {
  await mongoose.connect(MONGO_URI);
  const voters = await Voter.find({});
  voters.forEach(v => {
    console.log(`Voter: ${v.fullName}, Descriptor: ${JSON.stringify(v.faceDescriptor)}`);
  });
  process.exit(0);
}

check();
