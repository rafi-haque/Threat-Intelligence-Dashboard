const { findIndicators } = require('../models/indicator');

/**
 * Handle GET /api/indicators requests with enhanced filtering and sorting
 */
async function getIndicators(req, res) {
  try {
    const query = {
      // Search parameters
      q: req.query.q,                    // General search query
      query: req.query.query,            // Alternative search parameter
      
      // Filtering parameters
      source: req.query.source,          // Filter by data source
      type: req.query.type,              // Filter by indicator type (ip, domain, url, hash)
      category: req.query.category,      // Filter by threat category
      severity: req.query.severity,      // Filter by severity (low, medium, high)
      threat_type: req.query.threat_type,// Filter by threat type
      family: req.query.family,          // Filter by malware family
      
      // Date filtering
      since: req.query.since,            // Only indicators seen after this date
      until: req.query.until,            // Only indicators seen before this date
      
      // Pagination
      limit: req.query.limit,
      offset: req.query.offset,
      skip: req.query.skip,
      
      // Sorting
      sort: req.query.sort,
      order: req.query.order
    };

    // Remove undefined values
    Object.keys(query).forEach(key => {
      if (query[key] === undefined) {
        delete query[key];
      }
    });

    const results = await findIndicators(query);
    res.json(results);
  } catch (error) {
    console.error('Error in getIndicators:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve indicators'
    });
  }
}

/**
 * Handle GET /api/indicators/:id requests (individual indicator)
 */
async function getIndicatorById(req, res) {
  try {
    const { id } = req.params;
    
    // For now, just return a placeholder
    // This could be expanded to fetch individual indicators by ID
    res.status(404).json({
      error: 'Not found',
      message: 'Individual indicator lookup not implemented'
    });
  } catch (error) {
    console.error('Error in getIndicatorById:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * Handle GET /api/indicators/stats requests - Enhanced statistics
 */
async function getIndicatorStats(req, res) {
  try {
    const { getDb } = require('../db/mongo');
    const db = getDb();
    const collection = db.collection('indicators');

    // Get total count
    const total = await collection.countDocuments();

    // Get recent count (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await collection.countDocuments({
      'last_seen': { $gte: oneDayAgo }
    });

    // Get distinct values for each field
    const types = await collection.distinct('type');
    const categories = await collection.distinct('metadata.category');
    const sources = await collection.distinct('metadata.source'); 
    const severities = await collection.distinct('metadata.severity');

    // Get counts for each type
    const typeBreakdown = {};
    for (const type of types) {
      typeBreakdown[type] = await collection.countDocuments({ type });
    }

    // Get counts for each category
    const categoryBreakdown = {};
    for (const category of categories.filter(c => c)) {
      categoryBreakdown[category] = await collection.countDocuments({ 'metadata.category': category });
    }

    // Get counts for each source
    const sourceBreakdown = {};
    for (const source of sources.filter(s => s)) {
      sourceBreakdown[source] = await collection.countDocuments({ 'metadata.source': source });
    }

    // Get counts for each severity
    const severityBreakdown = {};
    for (const severity of severities.filter(s => s)) {
      severityBreakdown[severity] = await collection.countDocuments({ 'metadata.severity': severity });
    }

    const result = {
      total,
      recent_count: recentCount,
      types: {
        available: types,
        breakdown: typeBreakdown
      },
      categories: {
        available: categories.filter(c => c),
        breakdown: categoryBreakdown
      },
      sources: {
        available: sources.filter(s => s),
        breakdown: sourceBreakdown
      },
      severities: {
        available: severities.filter(s => s),
        breakdown: severityBreakdown
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Error in getIndicatorStats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve indicator statistics'
    });
  }
}

/**
 * Handle GET /api/indicators/categories requests - Get available categories
 */
async function getIndicatorCategories(req, res) {
  try {
    const { getDb } = require('../db/mongo');
    const db = getDb();
    const collection = db.collection('indicators');

    const categories = await collection.distinct('metadata.category');
    
    res.json({
      categories: categories.filter(c => c).sort()
    });
  } catch (error) {
    console.error('Error in getIndicatorCategories:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve categories'
    });
  }
}

/**
 * Handle GET /api/indicators/types requests - Get available types
 */
async function getIndicatorTypes(req, res) {
  try {
    const { getDb } = require('../db/mongo');
    const db = getDb();
    const collection = db.collection('indicators');

    const types = await collection.distinct('type');
    
    res.json({
      types: types.sort()
    });
  } catch (error) {
    console.error('Error in getIndicatorTypes:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve types'
    });
  }
}

module.exports = {
  getIndicators,
  getIndicatorById,
  getIndicatorStats,
  getIndicatorCategories,
  getIndicatorTypes
};