#!/bin/bash

# Threat Intelligence Data Sources Summary
# Generated on $(date)

echo "🛡️  THREAT INTELLIGENCE DASHBOARD - DATA SOURCES SUMMARY"
echo "============================================================"
echo ""

# Check if API is running
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo "✅ API Status: Online"
    
    # Get total count from MongoDB
    TOTAL_COUNT=$(mongosh --quiet --eval "db.indicators.countDocuments({})" tidb 2>/dev/null || echo "Unable to connect to MongoDB")
    echo "📊 Total Indicators in Database: $TOTAL_COUNT"
    echo ""
    
    echo "🔍 DATA SOURCES:"
    echo "──────────────────────────────────────────────────────────"
    echo "1. 🏴‍☠️ Feodo Tracker (abuse.ch)"
    echo "   - Type: Botnet C&C IP addresses"
    echo "   - URL: https://feodotracker.abuse.ch/"
    echo "   - Focus: Banking trojans, botnets"
    echo ""
    
    echo "2. 🔒 SSL IP Blacklist (abuse.ch)"
    echo "   - Type: Malicious SSL certificate IPs"
    echo "   - URL: https://sslbl.abuse.ch/"
    echo "   - Focus: Bad SSL certificates"
    echo ""
    
    echo "3. 🌐 URLhaus (abuse.ch)"
    echo "   - Type: Malicious URLs"
    echo "   - URL: https://urlhaus.abuse.ch/"
    echo "   - Focus: Malware distribution URLs"
    echo ""
    
    echo "4. 🔥 FireHOL Level 1 (firehol.org)"
    echo "   - Type: IP addresses and CIDR blocks"
    echo "   - URL: https://firehol.org/"
    echo "   - Focus: Community-maintained IP reputation"
    echo ""
    
    echo "5. 🦊 ThreatFox (abuse.ch)"
    echo "   - Type: Malicious domains (hostfile format)"
    echo "   - URL: https://threatfox.abuse.ch/"
    echo "   - Focus: IOCs from malware samples"
    echo ""
    
    echo "6. 💾 MalwareBazaar (abuse.ch)"
    echo "   - Type: SHA256 malware hashes"
    echo "   - URL: https://bazaar.abuse.ch/"
    echo "   - Focus: Recent malware samples"
    echo ""
    
    echo "7. 🏛️ Maltrail Zeus (stamparm)"
    echo "   - Type: Zeus banking trojan indicators"
    echo "   - URL: https://github.com/stamparm/maltrail"
    echo "   - Focus: Zeus malware family"
    echo ""
    
    echo "8. ❄️ GreenSnow (GreenSnow.co)"
    echo "   - Type: Suspicious IP addresses"
    echo "   - URL: https://blocklist.greensnow.co/"
    echo "   - Focus: Scanning and attack IPs"
    echo ""
    
    echo "──────────────────────────────────────────────────────────"
    echo "🔄 Update Frequency: Every 30 minutes (when server running)"
    echo "🚀 Manual Update: npm run populate (in backend directory)"
    echo "🌐 API Trigger: POST http://localhost:8000/api/ingest"
    echo ""
    
    echo "📈 SAMPLE API QUERIES:"
    echo "──────────────────────────────────────────────────────────"
    echo "# Get recent indicators"
    echo "curl 'http://localhost:8000/api/indicators?limit=10'"
    echo ""
    echo "# Search for specific IP"
    echo "curl 'http://localhost:8000/api/indicators?q=1.2.3.4'"
    echo ""
    echo "# Get only hash indicators"
    echo "curl 'http://localhost:8000/api/indicators?q=hash'"
    echo ""
    echo "# Health check"
    echo "curl 'http://localhost:8000/api/health'"
    echo ""
    
else
    echo "❌ API Status: Offline"
    echo "💡 Start the server with: ./start-dev.sh"
fi

echo "🎯 Dashboard URL: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000/api"