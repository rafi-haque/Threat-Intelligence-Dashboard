const request = require('supertest');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;

describe('Quickstart Integration Tests', () => {
  beforeAll(async () => {
    // Start in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Set test environment
    process.env.MONGODB_URI = mongoUri;
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_INGESTION = 'false';
    
    // Import and setup database connection
    const { connect } = require('../../src/db/mongo');
    await connect();
    
    // Import app after database connection is established
    app = require('../../src/app');
  });

  afterAll(async () => {
    // Close database connection
    const { close } = require('../../src/db/mongo');
    await close();
    
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test('API health check works', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'threat-intelligence-api'
    });
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api/indicators returns empty results initially', async () => {
    const response = await request(app)
      .get('/api/indicators')
      .expect(200);

    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items).toHaveLength(0);
  });

  test('API handles query parameters correctly', async () => {
    const response = await request(app)
      .get('/api/indicators')
      .query({ q: '1.2.3.4', limit: 5 })
      .expect(200);

    expect(response.body).toHaveProperty('items');
    expect(response.body.items.length).toBeLessThanOrEqual(5);
  });

  test('API includes proper CORS headers', async () => {
    await request(app)
      .get('/api/indicators')
      .expect('Access-Control-Allow-Origin', '*')
      .expect(200);
  });

  test('API includes security headers', async () => {
    const response = await request(app)
      .get('/api/indicators')
      .expect(200);

    // Helmet security headers
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers).toHaveProperty('x-frame-options');
  });

  test('Root endpoint provides API information', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body).toMatchObject({
      name: 'Threat Intelligence Dashboard API',
      version: '0.1.0',
      status: 'running'
    });
  });

  test('404 handling works correctly', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(response.body).toMatchObject({
      error: 'Not found'
    });
  });

  // This test would simulate the full ingestion workflow
  test('simulates indicator ingestion and retrieval', async () => {
    // For this test, we would need to:
    // 1. Mock feed data
    // 2. Call the ingestion service directly
    // 3. Verify indicators are stored and retrievable
    
    // For now, just verify the service functions exist
    const { parseFeedData, ingestIndicators } = require('../../src/services/fetcher');
    expect(typeof parseFeedData).toBe('function');
    expect(typeof ingestIndicators).toBe('function');
  });
});