const { getDb } = require('../db/mongo');

/**
 * Clean up old indicators based on retention policy (90 days)
 */
async function cleanupOldIndicators() {
  const db = getDb();
  const collection = db.collection('indicators');
  
  // Calculate cutoff date (90 days ago)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  
  try {
    const result = await collection.deleteMany({
      last_seen: { $lt: cutoffDate }
    });
    
    console.log(`Cleanup completed: Removed ${result.deletedCount} old indicators`);
    return {
      success: true,
      deletedCount: result.deletedCount,
      cutoffDate: cutoffDate.toISOString()
    };
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

/**
 * Clean up old events (optional - events may have different retention)
 */
async function cleanupOldEvents(retentionDays = 30) {
  const db = getDb();
  const collection = db.collection('events');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  try {
    const result = await collection.deleteMany({
      ingested_at: { $lt: cutoffDate }
    });
    
    console.log(`Event cleanup completed: Removed ${result.deletedCount} old events`);
    return {
      success: true,
      deletedCount: result.deletedCount,
      cutoffDate: cutoffDate.toISOString()
    };
  } catch (error) {
    console.error('Error during event cleanup:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
async function getDatabaseStats() {
  const db = getDb();
  
  try {
    const indicatorCount = await db.collection('indicators').countDocuments();
    const eventCount = await db.collection('events').countDocuments();
    
    // Get some sample data for analysis
    const typeStats = await db.collection('indicators').aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const recentActivity = await db.collection('indicators').aggregate([
      {
        $match: {
          last_seen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $count: 'recent_indicators'
      }
    ]).toArray();
    
    return {
      total_indicators: indicatorCount,
      total_events: eventCount,
      type_breakdown: typeStats,
      recent_activity: recentActivity[0]?.recent_indicators || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
}

/**
 * Run full maintenance routine
 */
async function runMaintenance() {
  console.log('Starting maintenance routine...');
  
  try {
    const stats = await getDatabaseStats();
    console.log('Database stats before cleanup:', stats);
    
    const indicatorCleanup = await cleanupOldIndicators();
    const eventCleanup = await cleanupOldEvents();
    
    const finalStats = await getDatabaseStats();
    console.log('Database stats after cleanup:', finalStats);
    
    return {
      success: true,
      before: stats,
      after: finalStats,
      cleanup: {
        indicators: indicatorCleanup,
        events: eventCleanup
      }
    };
  } catch (error) {
    console.error('Maintenance routine failed:', error);
    throw error;
  }
}

// If run directly, execute maintenance
if (require.main === module) {
  (async () => {
    try {
      const { connect } = require('../db/mongo');
      await connect();
      await runMaintenance();
      process.exit(0);
    } catch (error) {
      console.error('Maintenance failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  cleanupOldIndicators,
  cleanupOldEvents,
  getDatabaseStats,
  runMaintenance
};