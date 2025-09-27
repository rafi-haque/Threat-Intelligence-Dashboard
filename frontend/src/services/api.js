const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * API client for threat intelligence backend
 */
class ApiClient {
  async get(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Fetch indicators with enhanced filtering, pagination, and sorting
   */
  async getIndicators(options = {}) {
    const {
      query = '',
      source = '',
      category = '',
      type = '',
      severity = '',
      threat_type = '',
      family = '',
      since = '',
      until = '',
      limit = 100,
      offset = 0,
      sort = '',
      order = 'asc'
    } = options;

    const params = {};
    
    if (query) params.q = query;
    if (source) params.source = source;
    if (category) params.category = category;
    if (type) params.type = type;
    if (severity) params.severity = severity;
    if (threat_type) params.threat_type = threat_type;
    if (family) params.family = family;
    if (since) params.since = since;
    if (until) params.until = until;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    if (sort) params.sort = sort;
    if (order) params.order = order;

    return this.get('/indicators', params);
  }

  /**
   * Get indicator statistics using the enhanced backend API
   */
  async getIndicatorStats() {
    return await this.get('/indicators/stats');
  }

  /**
   * Get available indicator categories
   */
  async getIndicatorCategories() {
    return await this.get('/indicators/categories');
  }

  /**
   * Get available indicator types
   */
  async getIndicatorTypes() {
    return await this.get('/indicators/types');
  }

  /**
   * Get API health status
   */
  async getHealth() {
    return this.get('/health');
  }
}

const apiClient = new ApiClient();
export default apiClient;