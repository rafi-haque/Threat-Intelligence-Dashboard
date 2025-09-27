const express = require('express');
const { getIndicators, getIndicatorById, getIndicatorStats, getIndicatorCategories, getIndicatorTypes } = require('../api/indicators');
const { ingestFromFeeds } = require('../services/fetcher');

const router = express.Router();

// GET /api/indicators - Query indicators with enhanced filtering
router.get('/indicators', getIndicators);

// GET /api/indicators/stats - Get statistics about indicators
router.get('/indicators/stats', getIndicatorStats);

// GET /api/indicators/categories - Get available threat categories
router.get('/indicators/categories', getIndicatorCategories);

// GET /api/indicators/types - Get available indicator types
router.get('/indicators/types', getIndicatorTypes);

// GET /api/indicators/:id - Get specific indicator
router.get('/indicators/:id', getIndicatorById);

// POST /api/ingest - Manual trigger for data ingestion
router.post('/ingest', async (req, res) => {
  try {
    const results = await ingestFromFeeds();
    res.json({
      status: 'success',
      message: 'Data ingestion completed',
      results: results
    });
  } catch (error) {
    console.error('Manual ingestion failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Data ingestion failed',
      error: error.message
    });
  }
});

// Health check endpoint  
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'threat-intelligence-api'
  });
});

module.exports = router;