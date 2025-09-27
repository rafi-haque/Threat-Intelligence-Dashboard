const { processAllFeeds } = require('./fetcher');

/**
 * Ingestion orchestrator - runs the full ingestion pipeline
 */
async function runIngestion() {
  console.log('Starting ingestion pipeline...');
  
  try {
    const results = await processAllFeeds();
    
    const summary = {
      total_feeds: results.length,
      successful_feeds: results.filter(r => r.success).length,
      failed_feeds: results.filter(r => !r.success).length,
      total_indicators: results
        .filter(r => r.success)
        .reduce((sum, r) => sum + (r.indicators_processed || 0), 0),
      timestamp: new Date().toISOString()
    };

    console.log('Ingestion pipeline completed:', summary);
    return summary;
  } catch (error) {
    console.error('Ingestion pipeline failed:', error);
    throw error;
  }
}

/**
 * Schedule ingestion to run periodically
 */
function scheduleIngestion(intervalMinutes = 60) {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  console.log(`Scheduling ingestion every ${intervalMinutes} minutes`);
  
  // Run immediately
  runIngestion().catch(console.error);
  
  // Schedule recurring runs
  const interval = setInterval(() => {
    runIngestion().catch(console.error);
  }, intervalMs);

  return interval;
}

module.exports = {
  runIngestion,
  scheduleIngestion
};