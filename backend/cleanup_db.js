import mongoose from 'mongoose';
import Voter from './models/Voter.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/voting_system';

async function cleanup() {
  await mongoose.connect(MONGO_URI);
  const voters = await Voter.find({});
  let deletedCount = 0;
  for (const v of voters) {
    if (!v.faceDescriptor || v.faceDescriptor.length !== 128) {
      await Voter.deleteOne({ _id: v._id });
      deletedCount++;
    }
  }
  console.log(`Successfully removed ${deletedCount} corrupted voter entries.`);
  process.exit(0);
}

cleanup();
