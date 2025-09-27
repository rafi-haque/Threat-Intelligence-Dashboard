#!/usr/bin/env node

/**
 * Database Reset and Repopulation Script
 * 
 * This script will:
 * 1. Connect to MongoDB
 * 2. Clear all existing threat intelligence data
 * 3. Reset database indexes
 * 4. Trigger fresh data ingestion from all configured feeds
 * 
 * Usage: node reset-database.js
 */

require('dotenv').config({ path: './backend/.env' });
const { MongoClient } = require('mongodb');
const path = require('path');

// Import backend services
const { connectDB, createIndexes } = require('./backend/src/config/database');
const ingestionService = require('./backend/src/services/ingestion');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tidb';
const DB_NAME = process.env.DB_NAME || 'tidb';

class DatabaseReset {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    console.log('🔌 Connecting to MongoDB...');
    this.client = new MongoClient(MONGODB_URI);
    await this.client.connect();
    this.db = this.client.db(DB_NAME);
    console.log('✅ Connected to MongoDB successfully');
  }

  async clearAllData() {
    console.log('🗑️  Clearing all existing data...');
    
    try {
      // Get all collections
      const collections = await this.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      console.log(`📋 Found ${collectionNames.length} collections: ${collectionNames.join(', ')}`);
      
      // Clear each collection
      for (const collectionName of collectionNames) {
        const result = await this.db.collection(collectionName).deleteMany({});
        console.log(`   ✅ Cleared ${collectionName}: ${result.deletedCount} documents deleted`);
      }
      
      console.log('🧹 All data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing data:', error.message);
      throw error;
    }
  }

  async recreateIndexes() {
    console.log('🔧 Recreating database indexes...');
    
    try {
      // Drop existing indexes (except _id)
      const collections = await this.db.listCollections().toArray();
      
      for (const collection of collections) {
        const collectionObj = this.db.collection(collection.name);
        const indexes = await collectionObj.indexes();
        
        // Drop all indexes except _id_
        for (const index of indexes) {
          if (index.name !== '_id_') {
            await collectionObj.dropIndex(index.name);
            console.log(`   🗑️  Dropped index: ${index.name} from ${collection.name}`);
          }
        }
      }
      
      // Recreate indexes using the database service
      await createIndexes();
      console.log('✅ Database indexes recreated successfully');
      
    } catch (error) {
      console.error('❌ Error recreating indexes:', error.message);
      throw error;
    }
  }

  async repopulateData() {
    console.log('📥 Starting fresh data ingestion...');
    
    try {
      // Trigger the ingestion service
      const results = await ingestionService.runIngestion();
      
      console.log('📊 Ingestion Results:');
      console.log(`   • Total feeds processed: ${results.length}`);
      
      let totalIndicators = 0;
      let successfulFeeds = 0;
      let failedFeeds = 0;
      
      results.forEach((result, index) => {
        if (result.success) {
          successfulFeeds++;
          totalIndicators += result.indicators_processed || 0;
          console.log(`   ✅ Feed ${index + 1}: ${result.indicators_processed} indicators processed`);
        } else {
          failedFeeds++;
          console.log(`   ❌ Feed ${index + 1}: ${result.error}`);
        }
      });
      
      console.log('📈 Summary:');
      console.log(`   • Successful feeds: ${successfulFeeds}`);
      console.log(`   • Failed feeds: ${failedFeeds}`);
      console.log(`   • Total indicators ingested: ${totalIndicators.toLocaleString()}`);
      
      if (totalIndicators === 0) {
        console.warn('⚠️  Warning: No indicators were ingested. Check your data feeds configuration.');
      }
      
    } catch (error) {
      console.error('❌ Error during data ingestion:', error.message);
      throw error;
    }
  }

  async verifyData() {
    console.log('🔍 Verifying database state...');
    
    try {
      const collections = await this.db.listCollections().toArray();
      
      for (const collection of collections) {
        const count = await this.db.collection(collection.name).countDocuments();
        console.log(`   📊 ${collection.name}: ${count.toLocaleString()} documents`);
      }
      
      // Check specific collections
      const indicatorsCount = await this.db.collection('indicators').countDocuments();
      const sourcesCount = await this.db.collection('sources').countDocuments();
      
      console.log('✅ Database verification complete');
      console.log(`   • Total threat indicators: ${indicatorsCount.toLocaleString()}`);
      console.log(`   • Data sources: ${sourcesCount.toLocaleString()}`);
      
      return { indicatorsCount, sourcesCount };
      
    } catch (error) {
      console.error('❌ Error verifying data:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  async run() {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting Database Reset and Repopulation...');
      console.log('=' .repeat(60));
      
      // Step 1: Connect to database
      await this.connect();
      
      // Step 2: Clear all existing data
      await this.clearAllData();
      
      // Step 3: Recreate indexes
      await this.recreateIndexes();
      
      // Step 4: Repopulate with fresh data
      await this.repopulateData();
      
      // Step 5: Verify the results
      const verification = await this.verifyData();
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log('=' .repeat(60));
      console.log('🎉 Database reset and repopulation completed successfully!');
      console.log(`⏱️  Total time: ${duration} seconds`);
      
      if (verification.indicatorsCount > 0) {
        console.log('✅ Database is ready for use');
      } else {
        console.log('⚠️  Database is empty - check your data feed configuration');
      }
      
    } catch (error) {
      console.error('💥 Database reset failed:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Interactive mode
async function promptUser() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('⚠️  This will DELETE ALL data in the database. Are you sure? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// Main execution
async function main() {
  console.log('🛡️  Threat Intelligence Database Reset Tool');
  console.log('=' .repeat(60));
  
  // Check if running in non-interactive mode
  const isNonInteractive = process.argv.includes('--force') || process.argv.includes('-f');
  
  if (!isNonInteractive) {
    const confirmed = await promptUser();
    if (!confirmed) {
      console.log('❌ Operation cancelled by user');
      process.exit(0);
    }
  }
  
  const resetTool = new DatabaseReset();
  await resetTool.run();
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Process interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Process terminated');
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = DatabaseReset;