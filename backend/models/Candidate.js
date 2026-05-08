import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  candidateId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  party: {
    type: String,
    required: true
  },
  manifesto: {
    type: String
  },
  image: {
    type: String
  },
  color: {
    type: String
  },
  voteCount: {
    type: Number,
    default: 0
  }
});

export default mongoose.model('Candidate', candidateSchema);
