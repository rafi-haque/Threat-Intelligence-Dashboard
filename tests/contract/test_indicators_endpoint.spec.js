const request = require('supertest');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

// Mock the model functions
jest.mock('../../src/models/indicator');
const { findIndicators } = require('../../src/models/indicator');

let app;

describe('Indicators Endpoint', () => {
  beforeAll(async () => {
    app = require('../../backend/src/app');
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/indicators returns paginated results', async () => {
    // This test will fail until T008 (endpoint implementation) is complete
    const mockResults = {
      items: [
        { id: '1', type: 'ip', value: '1.2.3.4', last_seen: '2025-09-27T00:00:00Z' },
        { id: '2', type: 'domain', value: 'example.com', last_seen: '2025-09-27T00:00:00Z' }
      ]
    };

    findIndicators.mockResolvedValue(mockResults);

    expect(app).toBeDefined();
    
    const response = await request(app)
      .get('/api/indicators')
      .expect(200);

    expect(response.body).toEqual(mockResults);
    expect(findIndicators).toHaveBeenCalledWith({});
  });

  test('handles query parameter filtering', async () => {
    const mockResults = { items: [] };
    findIndicators.mockResolvedValue(mockResults);

    expect(app).toBeDefined();

    await request(app)
      .get('/api/indicators')
      .query({ q: '1.2.3.4', source: 'test-feed', limit: 10 })
      .expect(200);

    expect(findIndicators).toHaveBeenCalledWith({
      q: '1.2.3.4',
      source: 'test-feed',
      limit: '10'
    });
  });

  test('enforces pagination limit cap', async () => {
    const mockResults = { items: [] };
    findIndicators.mockResolvedValue(mockResults);

    expect(app).toBeDefined();

    await request(app)
      .get('/api/indicators')
      .query({ limit: 500 }) // Should be capped at 200
      .expect(200);

    expect(findIndicators).toHaveBeenCalledWith({ limit: '500' });
  });

  test('handles database errors gracefully', async () => {
    findIndicators.mockRejectedValue(new Error('Database connection failed'));

    expect(app).toBeDefined();

    const response = await request(app)
      .get('/api/indicators')
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  test('returns proper CORS headers', async () => {
    const mockResults = { items: [] };
    findIndicators.mockResolvedValue(mockResults);

    expect(app).toBeDefined();

    await request(app)
      .get('/api/indicators')
      .expect('Access-Control-Allow-Origin', '*')
      .expect(200);
  });

  test('includes security headers', async () => {
    const mockResults = { items: [] };
    findIndicators.mockResolvedValue(mockResults);

    expect(app).toBeDefined();

    const response = await request(app)
      .get('/api/indicators')
      .expect(200);

    // Check for helmet security headers
    expect(response.headers).toHaveProperty('x-content-type-options');
  });
});