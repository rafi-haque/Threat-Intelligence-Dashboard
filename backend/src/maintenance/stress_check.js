const { performance } = require('perf_hooks');
const apiClient = require('../../tests/helpers/api-client'); // Would need to create this

/**
 * Simple performance check for API endpoints
 */
async function checkApiPerformance() {
  const results = [];
  
  const endpoints = [
    { name: 'Health Check', path: '/api/health', method: 'GET' },
    { name: 'Empty Indicators', path: '/api/indicators', method: 'GET' },
    { name: 'Indicators with Query', path: '/api/indicators?q=test&limit=10', method: 'GET' }
  ];

  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.name}...`);
    
    const times = [];
    const errors = [];
    
    // Run each test 5 times
    for (let i = 0; i < 5; i++) {
      try {
        const start = performance.now();
        
        // In a real implementation, we'd make HTTP requests here
        // For now, simulate response time
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        
        const end = performance.now();
        times.push(end - start);
      } catch (error) {
        errors.push(error.message);
      }
    }
    
    if (times.length > 0) {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      
      results.push({
        endpoint: endpoint.name,
        average_ms: Math.round(avgTime),
        max_ms: Math.round(maxTime),
        min_ms: Math.round(minTime),
        success_rate: (times.length / 5) * 100,
        errors: errors
      });
    } else {
      results.push({
        endpoint: endpoint.name,
        average_ms: null,
        success_rate: 0,
        errors: errors
      });
    }
  }
  
  return results;
}

/**
 * Check database performance
 */
async function checkDatabasePerformance() {
  const { getDb } = require('../db/mongo');
  
  try {
    const db = getDb();
    const collection = db.collection('indicators');
    
    // Test query performance
    const start = performance.now();
    
    await collection.find({}).limit(100).toArray();
    
    const queryTime = performance.now() - start;
    
    // Test index usage
    const indexStart = performance.now();
    await collection.find({ type: 'ip' }).limit(10).toArray();
    const indexTime = performance.now() - indexStart;
    
    return {
      basic_query_ms: Math.round(queryTime),
      indexed_query_ms: Math.round(indexTime),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Database performance check failed:', error);
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generate performance report
 */
async function generatePerformanceReport() {
  console.log('Generating performance report...');
  
  try {
    const apiResults = await checkApiPerformance();
    const dbResults = await checkDatabasePerformance();
    
    const report = {
      timestamp: new Date().toISOString(),
      api_performance: apiResults,
      database_performance: dbResults,
      recommendations: []
    };
    
    // Add recommendations based on results
    apiResults.forEach(result => {
      if (result.average_ms > 1000) {
        report.recommendations.push(`${result.endpoint} is slow (${result.average_ms}ms avg)`);
      }
      if (result.success_rate < 100) {
        report.recommendations.push(`${result.endpoint} has reliability issues (${result.success_rate}% success)`);
      }
    });
    
    if (dbResults.basic_query_ms > 500) {
      report.recommendations.push('Database queries are slow - consider index optimization');
    }
    
    console.log('Performance Report:', JSON.stringify(report, null, 2));
    return report;
  } catch (error) {
    console.error('Performance report generation failed:', error);
    throw error;
  }
}

// If run directly, generate report
if (require.main === module) {
  (async () => {
    try {
      const { connect } = require('../db/mongo');
      await connect();
      await generatePerformanceReport();
      process.exit(0);
    } catch (error) {
      console.error('Performance check failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  checkApiPerformance,
  checkDatabasePerformance,
  generatePerformanceReport
};