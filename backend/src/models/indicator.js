const { ObjectId } = require('mongodb');
const { getDb } = require('../db/mongo');

/**
 * Validate indicator data according to schema rules
 */
function validateIndicator(indicator) {
  if (!indicator.value || indicator.value.trim() === '') {
    throw new Error('value is required and must be non-empty');
  }

  const validTypes = ['ip', 'domain', 'hash', 'url', 'other'];
  if (!indicator.type || !validTypes.includes(indicator.type)) {
    throw new Error(`type must be one of: ${validTypes.join(', ')}`);
  }

  return true;
}

/**
 * Normalize indicator values according to type
 */
function normalizeIndicator(indicator) {
  const normalized = { ...indicator };

  switch (indicator.type) {
    case 'ip':
      // Trim whitespace and ensure canonical dotted quad format
      normalized.value = indicator.value.trim();
      break;
      
    case 'domain':
      // Lowercase and normalize domains
      normalized.value = indicator.value.toLowerCase().trim();
      break;
      
    case 'hash':
      // Lowercase hex hashes
      normalized.value = indicator.value.toLowerCase().trim();
      break;
      
    case 'url':
      // Normalize URLs (basic cleanup)
      normalized.value = indicator.value.trim();
      break;
      
    default:
      // For 'other' type, just trim whitespace
      normalized.value = indicator.value.trim();
  }

  return normalized;
}

/**
 * Find indicators matching query criteria
 */
async function findIndicators(query = {}) {
  const db = getDb();
  const collection = db.collection('indicators');
  
  const filter = {};
  const options = {};

  // Handle search query
  if (query.q) {
    // Search across type and value fields
    filter.$or = [
      { value: { $regex: query.q, $options: 'i' } },
      { type: query.q }
    ];
  }

  // Handle source filtering (enhanced - both feed_id and metadata.source)
  if (query.source) {
    filter.$or = filter.$or || [];
    filter.$or.push(
      { 'sources.feed_id': query.source },
      { 'metadata.source': query.source }
    );
  }

  // Handle category filtering
  if (query.category) {
    filter['metadata.category'] = query.category;
  }

  // Handle severity filtering
  if (query.severity) {
    filter['metadata.severity'] = query.severity;
  }

  // Handle threat_type filtering
  if (query.threat_type) {
    filter['metadata.threat_type'] = query.threat_type;
  }

  // Handle family filtering
  if (query.family) {
    filter['metadata.family'] = query.family;
  }

  // Handle date filtering
  if (query.since || query.until) {
    filter.last_seen = {};
    if (query.since) {
      filter.last_seen.$gte = new Date(query.since);
    }
    if (query.until) {
      filter.last_seen.$lte = new Date(query.until);
    }
  }

  // Handle pagination limit with more generous defaults
  if (query.limit) {
    const limit = parseInt(query.limit, 10);
    if (limit > 0) {
      options.limit = Math.min(limit, 10000); // Cap at 10,000 for performance
    }
  } else {
    // Default to 100 results instead of 50
    options.limit = 100;
  }

  // Handle pagination offset/skip
  if (query.offset || query.skip) {
    const skip = parseInt(query.offset || query.skip, 10);
    if (skip > 0) {
      options.skip = skip;
    }
  }

  // Handle sorting
  if (query.sort) {
    const sortField = query.sort;
    const sortOrder = query.order === 'desc' ? -1 : 1;
    
    // Allow sorting by common fields
    const allowedSortFields = ['value', 'type', 'first_seen', 'last_seen'];
    if (allowedSortFields.includes(sortField)) {
      options.sort = { [sortField]: sortOrder };
    }
  } else {
    // Default sort by last_seen descending (most recent first)
    options.sort = { last_seen: -1 };
  }

  try {
    const cursor = collection.find(filter, options);
    const results = await cursor.toArray();
    
    return {
      items: results.map(item => ({
        id: item._id.toString(),
        type: item.type,
        value: item.value,
        first_seen: item.first_seen,
        last_seen: item.last_seen,
        sources: item.sources || [],
        metadata: item.metadata || {}
      }))
    };
  } catch (error) {
    console.error('Error finding indicators:', error);
    throw error;
  }
}

/**
 * Insert or update an indicator (upsert)
 */
async function upsertIndicator(indicatorData) {
  validateIndicator(indicatorData);
  const normalized = normalizeIndicator(indicatorData);
  
  const db = getDb();
  const collection = db.collection('indicators');
  
  const now = new Date();
  
  const indicator = {
    type: normalized.type,
    value: normalized.value,
    first_seen: indicatorData.first_seen || now,
    last_seen: now,
    sources: indicatorData.sources || [],
    metadata: indicatorData.metadata || {}
  };

  try {
    // Upsert based on type + value combination
    const result = await collection.updateOne(
      { type: indicator.type, value: indicator.value },
      {
        $set: {
          last_seen: indicator.last_seen,
          metadata: indicator.metadata
        },
        $setOnInsert: {
          type: indicator.type,
          value: indicator.value,
          first_seen: indicator.first_seen
        },
        $addToSet: {
          sources: { $each: indicator.sources }
        }
      },
      { upsert: true }
    );

    return {
      id: result.upsertedId?.toString() || null,
      matched: result.matchedCount > 0,
      modified: result.modifiedCount > 0
    };
  } catch (error) {
    console.error('Error upserting indicator:', error);
    throw error;
  }
}

/**
 * Create a raw event record
 */
async function createEvent(eventData) {
  const db = getDb();
  const collection = db.collection('events');
  
  const event = {
    feed_id: eventData.feed_id,
    raw_payload: eventData.raw_payload,
    parsed_indicators: eventData.parsed_indicators || [],
    ingested_at: new Date()
  };

  try {
    const result = await collection.insertOne(event);
    return {
      id: result.insertedId.toString(),
      ...event
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

module.exports = {
  validateIndicator,
  normalizeIndicator,
  findIndicators,
  upsertIndicator,
  createEvent
};