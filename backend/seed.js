import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from './models/Candidate.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/voting_system';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Database successfully!');
    
    // Clear existing candidates
    await Candidate.deleteMany({});

    // Seed data
    const seedCandidates = [
      {
        candidateId: 1,
        name: "Nani",
        party: "Progressive Data Party",
        manifesto: "Focus on AI-driven city planning and universal digital basic income.",
        image: "https://images.indianexpress.com/2026/02/Natural-Star-Nani.jpg?w=1200",
        color: "var(--neon-blue)",
        voteCount: 0
      },
      {
        candidateId: 2,
        name: "Dulqar salman",
        party: "Techno-Syndicalists",
        manifesto: "Decentralizing power structures using resilient blockchain frameworks.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
        color: "var(--neon-gold)",
        voteCount: 0
      },
      {
        candidateId: 3,
        name: "Dhanush",
        party: "Eco-Tech Alliance",
        manifesto: "Merging green infrastructure with high-efficiency renewable energy grids.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
        color: "#00ffaa",
        voteCount: 0
      }
    ];

    await Candidate.insertMany(seedCandidates);
    console.log("Database seeded successfully with initial Candidate data.");
    process.exit(0);

  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });
