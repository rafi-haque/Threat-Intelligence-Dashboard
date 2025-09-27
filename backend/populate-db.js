#!/usr/bin/env node

/**
 * Population script to add initial threat intelligence data
 * This script adds some sample data and then triggers real data ingestion
 */

require('dotenv').config();
const { connect, close } = require('./src/db/mongo');
const { upsertIndicator } = require('./src/models/indicator');
const { ingestFromFeeds } = require('./src/services/fetcher');

// Sample threat indicators for immediate population
const sampleIndicators = [
  {
    type: 'ip',
    value: '1.2.3.4',
    sources: [{ feed_id: 'sample-data', fetched_at: new Date() }],
    metadata: { category: 'test', confidence: 'low' }
  },
  {
    type: 'domain',
    value: 'malicious-example.com',
    sources: [{ feed_id: 'sample-data', fetched_at: new Date() }],
    metadata: { category: 'test', confidence: 'medium' }
  },
  {
    type: 'hash',
    value: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
    sources: [{ feed_id: 'sample-data', fetched_at: new Date() }],
    metadata: { category: 'malware', confidence: 'high' }
  },
  {
    type: 'url',
    value: 'https://bad-example.com/malware.exe',
    sources: [{ feed_id: 'sample-data', fetched_at: new Date() }],
    metadata: { category: 'malware', confidence: 'high' }
  }
];

async function populateDatabase() {
  try {
    console.log('🚀 Starting database population...');
    
    // Connect to database
    await connect();
    console.log('✅ Connected to database');
    
    // Add sample data
    console.log('📝 Adding sample indicators...');
    let sampleCount = 0;
    for (const indicator of sampleIndicators) {
      try {
        await upsertIndicator(indicator);
        sampleCount++;
        console.log(`   ✓ Added ${indicator.type}: ${indicator.value}`);
      } catch (error) {
        console.error(`   ✗ Failed to add ${indicator.value}:`, error.message);
      }
    }
    
    console.log(`✅ Added ${sampleCount} sample indicators`);
    
    // Trigger real data ingestion
    if (process.env.ENABLE_INGESTION === 'true') {
      console.log('🌍 Fetching real threat intelligence data...');
      console.log('   This may take a few minutes...');
      
      const results = await ingestFromFeeds();
      console.log('✅ Real data ingestion completed:', results);
    } else {
      console.log('⚠️  Real data ingestion is disabled. Set ENABLE_INGESTION=true in .env to fetch real data.');
    }
    
    console.log('🎉 Database population completed!');
    
  } catch (error) {
    console.error('❌ Population failed:', error);
    process.exit(1);
  } finally {
    await close();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  populateDatabase();
}

module.exports = { populateDatabase };