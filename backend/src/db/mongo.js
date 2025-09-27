const { MongoClient } = require('mongodb');

let client;
let db;

/**
 * Initialize MongoDB connection
 */
async function connect() {
  if (client) {
    return db;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || 'tidb';

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    
    console.log(`Connected to MongoDB: ${dbName}`);
    
    // Create indexes on first connection
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

/**
 * Create database indexes for performance and TTL
 */
async function createIndexes() {
  if (!db) {
    throw new Error('Database not connected');
  }

  try {
    const indicators = db.collection('indicators');
    
    // Index for search queries (type + value)
    await indicators.createIndex({ type: 1, value: 1 });
    
    // TTL index for 90-day retention (90 days = 7776000 seconds)
    await indicators.createIndex(
      { last_seen: 1 }, 
      { expireAfterSeconds: 7776000 }
    );
    
    // Index for source filtering
    await indicators.createIndex({ 'sources.feed_id': 1 });
    
    const events = db.collection('events');
    
    // Index for events by feed and ingestion time
    await events.createIndex({ feed_id: 1, ingested_at: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Failed to create indexes:', error);
    throw error;
  }
}

/**
 * Get database instance
 */
function getDb() {
  if (!db) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return db;
}

/**
 * Close database connection
 */
async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connect,
  getDb,
  close,
  createIndexes
};