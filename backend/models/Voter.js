import mongoose from 'mongoose';

const voterSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  voterId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  district: {
    type: String,
    required: true
  },
  // Face embedding/descriptor (e.g. 128D array extracted from face-api.js)
  // Saved as an array of numbers so we can query and compare mathematical Euclidean distance
  faceDescriptor: {
    type: [Number], 
    required: true
  },
  hasVoted: {
    type: Boolean,
    default: false
  },
  previousHash: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Voter', voterSchema);
