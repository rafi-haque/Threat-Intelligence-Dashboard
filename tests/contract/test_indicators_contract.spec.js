const request = require('supertest');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

// This will be the Express app once implemented
let app;

describe('Indicators API Contract', () => {
  beforeAll(async () => {
    app = require('../../backend/src/app');
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  test('GET /api/indicators returns JSON with correct schema', async () => {
    // This test will fail until T008 (endpoint implementation) is complete
    expect(app).toBeDefined();
    
    const response = await request(app)
      .get('/api/indicators')
      .expect('Content-Type', /json/)
      .expect(200);

    // Validate OpenAPI contract schema
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);

    // If items exist, validate structure
    if (response.body.items.length > 0) {
      const item = response.body.items[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('type');
      expect(item).toHaveProperty('value');
      expect(item).toHaveProperty('last_seen');
      expect(typeof item.id).toBe('string');
      expect(typeof item.type).toBe('string');
      expect(typeof item.value).toBe('string');
      expect(typeof item.last_seen).toBe('string');
    }
  });

  test('GET /api/indicators accepts query parameters', async () => {
    expect(app).toBeDefined();

    const response = await request(app)
      .get('/api/indicators')
      .query({ q: '1.2.3.4', limit: 10, source: 'test-feed' })
      .expect(200);

    expect(response.body).toHaveProperty('items');
  });

  test('GET /api/indicators handles pagination limit', async () => {
    expect(app).toBeDefined();

    const response = await request(app)
      .get('/api/indicators')
      .query({ limit: 5 })
      .expect(200);

    expect(response.body.items.length).toBeLessThanOrEqual(5);
  });
});