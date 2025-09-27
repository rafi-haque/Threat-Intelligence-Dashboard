/**
 * Enhanced Threat Intelligence Feed Parser
 * Supports multiple reliable threat intelligence sources with proper categorization
 */

async function parseIndicators(feedData, feedId, feed) {
  const indicators = [];
  
  try {
    const url = feed.url;
    
    if (url.includes('feodotracker.abuse.ch')) {
      // Feodo Tracker - Banking Trojan C&C IPs
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
    } else if (url.includes('firehol') || url.includes('blocklist-ipsets')) {
      // FireHOL Level 1 - High confidence malicious IPs
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
                severity: 'high',
                source: 'FireHOL',
                threat_type: 'malicious_ip',
                family: 'firehol_level1'
              }
            });
          }
        }
      }
    } else if (url.includes('bazaar.abuse.ch')) {
      // MalwareBazaar - Recent malware samples
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
    } else if (url.includes('greensnow.co')) {
      // GreenSnow - Spam/scanning IPs
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmedLine)) {
          indicators.push({
            type: 'ip',
            value: trimmedLine,
            sources: [{
              feed_id: feedId,
              original_id: null,
              fetched_at: new Date()
            }],
            metadata: {
              category: 'Spam Source',
              severity: 'medium',
              source: 'GreenSnow',
              threat_type: 'spam',
              family: 'spam_source'
            }
          });
        }
      }
    } else if (url.includes('urlhaus.abuse.ch') && url.includes('text_recent')) {
      // URLhaus - Recent malicious URLs
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
    } else if (url.includes('threatfox.abuse.ch')) {
      // ThreatFox - Active IOCs
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes(',')) {
          const parts = trimmedLine.split(',');
          if (parts.length >= 3) {
            const ioc_type = parts[0];
            const ioc_value = parts[1];
            const threat_type = parts[2] || 'unknown';
            
            if (ioc_value && (ioc_type === 'ip:port' || ioc_type === 'domain' || ioc_type === 'url')) {
              indicators.push({
                type: ioc_type.includes('ip') ? 'ip' : (ioc_type === 'domain' ? 'domain' : 'url'),
                value: ioc_value,
                sources: [{
                  feed_id: feedId,
                  original_id: null,
                  fetched_at: new Date()
                }],
                metadata: {
                  category: 'Active Threat',
                  severity: 'high',
                  source: 'ThreatFox',
                  threat_type: threat_type,
                  family: parts[3] || 'unknown',
                  confidence: parts[4] || 'unknown'
                }
              });
            }
          }
        }
      }
    } else if (url.includes('maltrail') && url.includes('suspicious')) {
      // Maltrail - Suspicious domains/IPs
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const indicator = trimmedLine.split(/[\s\t#]/)[0];
          if (indicator) {
            const type = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(indicator) ? 'ip' : 'domain';
            indicators.push({
              type: type,
              value: indicator,
              sources: [{
                feed_id: feedId,
                original_id: null,
                fetched_at: new Date()
              }],
              metadata: {
                category: 'Suspicious Activity',
                severity: 'medium',
                source: 'Maltrail',
                threat_type: 'suspicious',
                family: 'maltrail_suspicious'
              }
            });
          }
        }
      }
    } else if (url.includes('phishstats.info')) {
      // PhishStats - Phishing domains
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes(',')) {
          const parts = trimmedLine.split(',');
          const domain = parts[1];
          if (domain && domain.includes('.') && !domain.includes('http')) {
            indicators.push({
              type: 'domain',
              value: domain,
              sources: [{
                feed_id: feedId,
                original_id: null,
                fetched_at: new Date()
              }],
              metadata: {
                category: 'Phishing',
                severity: 'high',
                source: 'PhishStats',
                threat_type: 'phishing',
                family: 'phishing_domain',
                score: parts[0] || 'unknown'
              }
            });
          }
        }
      }
    } else if (url.includes('digitalside.it')) {
      // DigitalSide OSINT - Threat intelligence IPs
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmedLine)) {
          indicators.push({
            type: 'ip',
            value: trimmedLine,
            sources: [{
              feed_id: feedId,
              original_id: null,
              fetched_at: new Date()
            }],
            metadata: {
              category: 'Threat Intelligence',
              severity: 'medium',
              source: 'DigitalSide OSINT',
              threat_type: 'osint',
              family: 'threat_intel'
            }
          });
        }
      }
    } else if (url.includes('pan-unit42') || url.includes('diamondfox')) {
      // Unit42 - APT IOCs
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          let type, value;
          if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmedLine)) {
            type = 'ip';
            value = trimmedLine;
          } else if (trimmedLine.includes('.') && !trimmedLine.includes('/') && !trimmedLine.includes('http')) {
            type = 'domain';
            value = trimmedLine;
          } else if (trimmedLine.startsWith('http')) {
            type = 'url';
            value = trimmedLine;
          }
          
          if (type && value) {
            indicators.push({
              type: type,
              value: value,
              sources: [{
                feed_id: feedId,
                original_id: null,
                fetched_at: new Date()
              }],
              metadata: {
                category: 'APT Intelligence',
                severity: 'high',
                source: 'Unit42',
                threat_type: 'apt',
                family: 'unit42_ioc'
              }
            });
          }
        }
      }
    } else {
      // Enhanced fallback parser
      console.log(`Using enhanced fallback parser for ${feedId}`);
      const lines = (typeof feedData === 'string' ? feedData : JSON.stringify(feedData)).split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('//')) {
          let type = 'unknown';
          let value = trimmedLine.split(/[\s\t#]/)[0];
          let category = 'Generic';
          let severity = 'medium';
          
          if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) {
            type = 'ip';
            category = 'Suspicious IP';
          } else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/.test(value)) {
            type = 'ip';
            category = 'IP Range';
          } else if (/^[a-fA-F0-9]{32}$/.test(value)) {
            type = 'hash';
            category = 'MD5 Hash';
            severity = 'high';
          } else if (/^[a-fA-F0-9]{40}$/.test(value)) {
            type = 'hash';
            category = 'SHA1 Hash';
            severity = 'high';
          } else if (/^[a-fA-F0-9]{64}$/.test(value)) {
            type = 'hash';
            category = 'SHA256 Hash';
            severity = 'high';
          } else if (value.includes('.') && !value.includes('/') && !value.includes('http')) {
            type = 'domain';
            category = 'Suspicious Domain';
          } else if (value.startsWith('http://') || value.startsWith('https://')) {
            type = 'url';
            category = 'Suspicious URL';
          }
          
          if (type !== 'unknown') {
            indicators.push({
              type: type,
              value: value,
              sources: [{
                feed_id: feedId,
                original_id: null,
                fetched_at: new Date()
              }],
              metadata: {
                category: category,
                severity: severity,
                source: 'Generic Feed',
                threat_type: 'generic',
                family: 'fallback_parser'
              }
            });
          }
        }
      }
    }

    console.log(`Parsed ${indicators.length} indicators from ${feedId}`);
    return indicators;

  } catch (error) {
    console.error(`Error parsing indicators from ${feedId}:`, error.message);
    return [];
  }
}

module.exports = { parseIndicators };