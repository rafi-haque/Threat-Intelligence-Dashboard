const https = require('https');
const http = require('http');
const { URL } = require('url');
const { upsertIndicator, createEvent } = require('../models/indicator');

/**
 * Fetch data from a URL
 */
async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const request = client.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          // Try to parse as JSON first
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          // If JSON parsing fails, return as text (for text-based feeds)
          console.log(`Received non-JSON data from ${url}, treating as text`);
          resolve(data);
        }
      });
    });
    
    request.on('error', (error) => {
      console.error(`Failed to fetch ${url}:`, error);
      reject(error);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Parse indicators from feed data
 */
function parseIndicators(feedData, feedId) {
  try {
    const indicators = [];
    let rawIndicators = [];

    // Get feed configuration from environment
    const feeds = JSON.parse(process.env.DATA_FEEDS || '[]');
    const feed = feeds.find(f => f.id === feedId);
    
    if (!feed) {
      console.error(`Feed configuration not found for feedId: ${feedId}`);
      return [];
    }

    // Enhanced feed parsing with better categorization
    const url = feed.url;
    
    if (url.includes('feodotracker.abuse.ch')) {
      // Feodo Tracker IP blocklist - Banking Trojans
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('//')) {
          const ip = trimmedLine.split(/[\s\t#]/)[0];
          if (ip && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
            indicators.push({
              type: 'ip',
              value: ip,
              sources: [{
                feed_id: feedId,
                original_id: null,
                fetched_at: new Date()
              }],
              metadata: {
                category: 'Banking Trojan',
                severity: 'high',
                source: 'Feodo Tracker',
                threat_type: 'c2',
                family: 'banking_trojan'
              }
            });
          }
        }
      }
    } else if (feedId.includes('feed-2')) {
      // Handle SSLBL CSV format
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes(',')) {
          // CSV format: IP,Port
          const parts = trimmedLine.split(',');
          const ip = parts[0];
          if (ip && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
            indicators.push({
              type: 'ip',
              value: ip,
              sources: [{
                feed_id: feedId,
                original_id: null,
                fetched_at: new Date()
              }],
              metadata: {
                category: 'Malicious SSL',
                port: parts[1] || 'unknown',
                source: 'SSL Blacklist'
              }
            });
          }
        }
      }
    } else if (url.includes('firehol') || url.includes('blocklist-ipsets')) {
      // FireHOL IP sets - Various threat categories
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('//')) {
          const indicator = trimmedLine.split(/[\s\t#]/)[0];
          if (indicator && (
            /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(indicator) ||
            /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/.test(indicator)
          )) {
            indicators.push({
              type: 'ip',
              value: indicator,
              sources: [{
                feed_id: feedId,
                original_id: null,
                fetched_at: new Date()
              }],
              metadata: {
                category: 'Malicious IP',
                severity: 'medium',
                source: 'FireHOL',
                threat_type: 'malicious_ip',
                family: 'firehol_level1'
              }
            });
          }
        }
      }
    } else if (url.includes('urlhaus.abuse.ch')) {
      // URLhaus - Malicious URLs
      if (url.includes('text_recent')) {
        // Text format: one URL per line
        const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith('#') && (trimmedLine.startsWith('http://') || trimmedLine.startsWith('https://'))) {
            indicators.push({
              type: 'url',
              value: trimmedLine,
              sources: [{
                feed_id: feedId,
                original_id: null,
                fetched_at: new Date()
              }],
              metadata: {
                category: 'Malicious URL',
                severity: 'high',
                source: 'URLhaus',
                threat_type: 'malware_url',
                family: 'urlhaus'
              }
            });
          }
        }
      }
    } else if (feedId.includes('feed-5')) {
      // Handle ThreatFox hostfile format (domain blocklist)
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('0.0.0.0')) {
          // Hostfile format: 0.0.0.0 domain.com
          const parts = trimmedLine.split(/\s+/);
          const domain = parts[1];
          if (domain && domain !== 'localhost' && domain.includes('.')) {
            indicators.push({
              type: 'domain',
              value: domain,
              sources: [{
                feed_id: feedId,
                original_id: null,
                fetched_at: new Date()
              }],
              metadata: {
                category: 'Malicious Domain',
                source: 'ThreatFox'
              }
            });
          }
        }
      }
    } else if (url.includes('bazaar.abuse.ch')) {
      // MalwareBazaar - Malware hashes
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && /^[a-fA-F0-9]{64}$/.test(trimmedLine)) {
          indicators.push({
            type: 'hash',
            value: trimmedLine.toLowerCase(),
            sources: [{
              feed_id: feedId,
              original_id: null,
              fetched_at: new Date()
            }],
            metadata: {
              category: 'Malware Hash',
              severity: 'high',
              source: 'MalwareBazaar',
              threat_type: 'malware',
              family: 'malware_sample',
              hash_type: 'sha256'
            }
          });
        }
      }
    } else if (feedId.includes('feed-7')) {
      // Handle Zeus malware domains from Maltrail
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('//')) {
          const indicator = trimmedLine.split(/[\s\t#]/)[0];
          if (indicator && indicator.includes('.')) {
            indicators.push({
              type: detectIndicatorType(indicator),
              value: indicator,
              sources: [{
                feed_id: feedId,
                original_id: null,
                fetched_at: new Date()
              }],
              metadata: {
                category: 'Zeus Banking Trojan',
                source: 'Maltrail'
              }
            });
          }
        }
      }
    } else if (feedId.includes('feed-8')) {
      // Handle GreenSnow IP blocklist
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmedLine)) {
          indicators.push({
            type: 'ip',
            value: trimmedLine,
            sources: [{
              feed_id: feedId,
              original_id: null,
              fetched_at: new Date()
            }],
            metadata: {
              category: 'Suspicious IP',
              source: 'GreenSnow'
            }
          });
        }
      }
    } else {
      // Handle standard formats
      if (feedData.indicators && Array.isArray(feedData.indicators)) {
        rawIndicators = feedData.indicators;
      } else if (Array.isArray(feedData)) {
        rawIndicators = feedData;
      } else if (feedData.data && Array.isArray(feedData.data)) {
        rawIndicators = feedData.data;
      }

      for (const item of rawIndicators) {
        if (!item.type || !item.value) {
          continue;
        }

        const indicator = {
          type: item.type.toLowerCase(),
          value: item.value,
          sources: [{
            feed_id: feedId,
            original_id: item.id || null,
            fetched_at: new Date()
          }]
        };

        if (item.metadata) {
          indicator.metadata = item.metadata;
        }

        indicators.push(indicator);
      }
    }

    console.log(`Parsed ${indicators.length} indicators from ${feedId}`);
    return indicators;
  } catch (error) {
    console.error(`Error parsing feed data for ${feedId}:`, error);
    return [];
  }
}

/**
 * Detect indicator type based on value pattern
 */
function detectIndicatorType(value) {
  // IP address patterns
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) {
    return 'ip';
  }
  
  // Domain patterns
  if (/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/.test(value)) {
    return 'domain';
  }
  
  // Hash patterns
  if (/^[a-fA-F0-9]{32}$/.test(value)) {
    return 'hash'; // MD5
  }
  if (/^[a-fA-F0-9]{40}$/.test(value)) {
    return 'hash'; // SHA1
  }
  if (/^[a-fA-F0-9]{64}$/.test(value)) {
    return 'hash'; // SHA256
  }
  
  // URL patterns
  if (/^https?:\/\//.test(value)) {
    return 'url';
  }
  
  // Default to domain if it looks like one
  if (value.includes('.') && !value.includes('/')) {
    return 'domain';
  }
  
  return 'other';
}

/**
 * Ingest indicators into the database
 */
async function ingestIndicators(indicators, feedId) {
  const results = {
    processed: 0,
    inserted: 0,
    updated: 0,
    errors: 0
  };

  for (const indicator of indicators) {
    try {
      const result = await upsertIndicator(indicator);
      results.processed++;
      
      if (result.matched) {
        results.updated++;
      } else {
        results.inserted++;
      }
    } catch (error) {
      console.error(`Error ingesting indicator ${indicator.value}:`, error);
      results.errors++;
    }
  }

  console.log(`Ingestion complete for ${feedId}:`, results);
  return results;
}

/**
 * Process a single feed
 */
async function processFeed(feedConfig) {
  const { id, url, name } = feedConfig;
  
  try {
    console.log(`Processing feed: ${name} (${id})`);
    
    // Fetch feed data
    const feedData = await fetchUrl(url);
    if (!feedData) {
      console.warn(`No data received from feed: ${id}`);
      return { success: false, error: 'No data received' };
    }

    // Parse indicators
    const indicators = parseIndicators(feedData, id);
    if (indicators.length === 0) {
      console.warn(`No indicators parsed from feed: ${id}`);
      return { success: false, error: 'No indicators parsed' };
    }

    // Create event record
    await createEvent({
      feed_id: id,
      raw_payload: feedData,
      parsed_indicators: indicators.length
    });

    // Ingest indicators
    const ingestionResults = await ingestIndicators(indicators, id);
    
    return {
      success: true,
      feed_id: id,
      indicators_processed: ingestionResults.processed,
      indicators_inserted: ingestionResults.inserted,
      indicators_updated: ingestionResults.updated,
      errors: ingestionResults.errors
    };
  } catch (error) {
    console.error(`Error processing feed ${id}:`, error);
    return {
      success: false,
      feed_id: id,
      error: error.message
    };
  }
}

/**
 * Process all configured feeds
 */
async function processAllFeeds() {
  const feedsConfig = getFeedsConfiguration();
  const results = [];

  for (const feedConfig of feedsConfig) {
    const result = await processFeed(feedConfig);
    results.push(result);
  }

  console.log('All feeds processed:', results);
  return results;
}

/**
 * Get feeds configuration from environment
 */
function getFeedsConfiguration() {
  const dataFeeds = process.env.DATA_FEEDS;
  if (!dataFeeds) {
    console.warn('No DATA_FEEDS configured');
    return [];
  }

  try {
    const feeds = JSON.parse(dataFeeds);
    return feeds.map((feed, index) => {
      if (typeof feed === 'string') {
        // Simple URL format
        return {
          id: `feed-${index + 1}`,
          url: feed,
          name: `Feed ${index + 1}`
        };
      } else {
        // Object format with id, url, name
        return {
          id: feed.id || `feed-${index + 1}`,
          url: feed.url,
          name: feed.name || `Feed ${index + 1}`
        };
      }
    });
  } catch (error) {
    console.error('Error parsing DATA_FEEDS configuration:', error);
    return [];
  }
}

module.exports = {
  fetchUrl,
  parseIndicators,
  ingestIndicators,
  processFeed,
  processAllFeeds,
  getFeedsConfiguration,
  ingestFromFeeds: processAllFeeds
};