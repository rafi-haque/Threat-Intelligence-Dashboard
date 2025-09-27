#!/bin/bash

# Quick Data Population Script
# Downloads and inserts sample threat intelligence data directly into MongoDB

set -e

echo "🚀 Quick Data Population for Threat Intelligence Database"
echo "========================================================="

# Configuration
DB_NAME="tidb"
COLLECTION="indicators"

echo "📊 Inserting sample threat intelligence indicators..."

# Insert sample threat indicators directly into MongoDB
mongosh "${DB_NAME}" --quiet --eval "
// Clear existing data
db.indicators.deleteMany({});
db.sources.deleteMany({});

console.log('🗑️  Cleared existing data');

// Sample threat indicators
const sampleIndicators = [
  {
    value: '192.168.1.100',
    type: 'ip',
    first_seen: new Date('2024-01-01'),
    last_seen: new Date(),
    sources: [{
      feed_id: 'sample-feed',
      fetched_at: new Date()
    }],
    metadata: {
      category: 'malicious',
      source: 'Sample Data'
    }
  },
  {
    value: 'malicious-domain.com',
    type: 'domain',
    first_seen: new Date('2024-01-02'),
    last_seen: new Date(),
    sources: [{
      feed_id: 'sample-feed',
      fetched_at: new Date()
    }],
    metadata: {
      category: 'malicious',
      source: 'Sample Data'
    }
  },
  {
    value: 'abc123def456ghi789',
    type: 'hash',
    first_seen: new Date('2024-01-03'),
    last_seen: new Date(),
    sources: [{
      feed_id: 'sample-feed',
      fetched_at: new Date()
    }],
    metadata: {
      category: 'malware',
      source: 'Sample Data'
    }
  }
];

// Insert sample data
const result = db.indicators.insertMany(sampleIndicators);
console.log('✅ Inserted ' + result.insertedIds.length + ' sample indicators');

// Create a source record
db.sources.insertOne({
  feed_id: 'sample-feed',
  name: 'Sample Threat Feed',
  url: 'https://example.com/sample-feed',
  fetched_at: new Date(),
  status: 'active'
});

console.log('✅ Created sample source record');

// Verify data
const count = db.indicators.countDocuments();
console.log('📊 Total indicators in database: ' + count);

if (count > 0) {
  console.log('✅ Database populated successfully!');
} else {
  console.log('❌ Database population failed');
}
"

echo "🎉 Sample data population completed!"
echo
echo "🌐 You can now:"
echo "   • View data at: http://localhost:3000"
echo "   • Test API at: http://localhost:8000/api/indicators"
echo
echo "💡 To populate with real threat intelligence data:"
echo "   • Run: npm run populate"
echo "   • Or: ./reset-database.sh"