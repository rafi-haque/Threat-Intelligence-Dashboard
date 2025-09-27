import { useState } from 'react';
import './IndicatorList.css';

function IndicatorList({ indicators, loading, error, onSort, sortField, sortOrder }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ip': return '🌐';
      case 'domain': return '🏠'; 
      case 'hash': return '#️⃣';
      case 'url': return '🔗';
      default: return '❓';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'ip': return '#2196F3';
      case 'domain': return '#4CAF50';
      case 'hash': return '#FF9800';
      case 'url': return '#9C27B0';
      default: return '#757575';
    }
  };

  const truncateValue = (value, maxLength = 50) => {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
  };

  if (loading) {
    return <div className="indicator-list loading">Loading indicators...</div>;
  }

  if (error) {
    return <div className="indicator-list error">Error: {error}</div>;
  }

  if (indicators.length === 0) {
    return <div className="indicator-list empty">No indicators found</div>;
  }

  return (
    <div className="indicator-list">
      <div className="indicator-table">
        <div className="table-header">
          <button 
            className={`sort-btn ${sortField === 'type' ? 'active' : ''}`}
            onClick={() => onSort && onSort('type')}
          >
            <span className="sort-text">Type</span>
            {sortField === 'type' && (
              <span className="sort-arrow">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          <button 
            className={`sort-btn ${sortField === 'value' ? 'active' : ''}`}
            onClick={() => onSort && onSort('value')}
          >
            <span className="sort-text">Value</span>
            {sortField === 'value' && (
              <span className="sort-arrow">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          <button 
            className={`sort-btn ${sortField === 'last_seen' ? 'active' : ''}`}
            onClick={() => onSort && onSort('last_seen')}
          >
            <span className="sort-text">Last Seen</span>
            {sortField === 'last_seen' && (
              <span className="sort-arrow">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          <span className="header-text">Category</span>
          <span className="header-text">Sources</span>
          <span className="header-text">Actions</span>
        </div>

        {indicators.map((indicator) => (
          <div key={indicator.id}>
            <div className="table-row" onClick={() => toggleRowExpansion(indicator.id)}>
              <div className="type-cell">
                <span 
                  className="type-icon" 
                  style={{ color: getTypeColor(indicator.type) }}
                >
                  {getTypeIcon(indicator.type)}
                </span>
                <span className="type-text">{indicator.type.toUpperCase()}</span>
              </div>
              <div className="value-cell">
                <code className="indicator-value" title={indicator.value}>
                  {truncateValue(indicator.value)}
                </code>
              </div>
              <div className="date-cell">
                <span className="date-text">
                  {formatDate(indicator.last_seen)}
                </span>
              </div>
              <div className="category-cell">
                <span className="category-badge">
                  {indicator.metadata?.category || 'Unknown'}
                </span>
              </div>
              <div className="sources-cell">
                <span className="source-count">
                  {indicator.sources?.length || 0}
                </span>
              </div>
              <div className="actions-cell">
                <button 
                  className="expand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRowExpansion(indicator.id);
                  }}
                >
                  {expandedRows.has(indicator.id) ? '−' : '+'}
                </button>
              </div>
            </div>

            {expandedRows.has(indicator.id) && (
              <div className="expanded-row">
                <div className="expanded-content">
                  <div className="detail-section">
                    <h4>Details</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">ID:</span>
                        <span className="detail-value">{indicator.id}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">First Seen:</span>
                        <span className="detail-value">{formatDate(indicator.first_seen)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Full Value:</span>
                        <code className="detail-value">{indicator.value}</code>
                      </div>
                      {indicator.metadata?.source && (
                        <div className="detail-item">
                          <span className="detail-label">Source:</span>
                          <span className="detail-value">{indicator.metadata.source}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {indicator.sources && indicator.sources.length > 0 && (
                    <div className="detail-section">
                      <h4>Sources ({indicator.sources.length})</h4>
                      <div className="sources-list">
                        {indicator.sources.slice(0, 5).map((source, index) => (
                          <div key={index} className="source-item">
                            <span className="source-feed">
                              {source.feed_id}
                            </span>
                            <span className="source-date">
                              {formatDate(source.fetched_at)}
                            </span>
                          </div>
                        ))}
                        {indicator.sources.length > 5 && (
                          <div className="source-item more">
                            ... and {indicator.sources.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {indicator.metadata && Object.keys(indicator.metadata).length > 0 && (
                    <div className="detail-section">
                      <h4>Metadata</h4>
                      <div className="metadata-list">
                        {Object.entries(indicator.metadata).map(([key, value]) => (
                          <div key={key} className="metadata-item">
                            <span className="metadata-key">{key}:</span>
                            <span className="metadata-value">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default IndicatorList;