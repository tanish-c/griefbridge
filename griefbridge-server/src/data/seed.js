import Procedure from '../models/Procedure.model.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { setupDNS } from '../config/dns.config.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seedProcedures() {
  try {
    // Setup custom DNS servers
    setupDNS();
    
    // Connect to DB
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      retryWrites: true
    });
    console.log('✓ Connected to MongoDB');

    // Read procedure corpus
    const corpusPath = path.join(__dirname, 'procedures.corpus.json');
    const corpusData = JSON.parse(fs.readFileSync(corpusPath, 'utf-8'));

    // Clear existing procedures
    console.log('Clearing existing procedures...');
    await Procedure.deleteMany({});

    // Insert procedures
    console.log(`Seeding ${corpusData.length} procedures...`);
    await Procedure.insertMany(corpusData);

    console.log(`✓ Successfully seeded ${corpusData.length} procedures`);
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding error:', error.message);
    console.error(error);
    try {
      await mongoose.disconnect();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

seedProcedures();
