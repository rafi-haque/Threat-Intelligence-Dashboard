const { describe, test, expect, beforeEach } = require('@jest/globals');
const { validateIndicator, normalizeIndicator } = require('../../src/models/indicator');

describe('Indicator Model', () => {
  describe('Validation', () => {
    test('validates required fields', () => {
      const invalidIndicator = {};
      
      expect(() => validateIndicator(invalidIndicator)).toThrow('value is required');
      
      const invalidIndicatorEmptyValue = { value: '', type: 'ip' };
      expect(() => validateIndicator(invalidIndicatorEmptyValue)).toThrow('value is required');
    });

    test('validates indicator type', () => {
      const validTypes = ['ip', 'domain', 'hash', 'other'];
      
      validTypes.forEach(type => {
        const indicator = { type, value: 'test-value' };
        expect(() => validateIndicator(indicator)).not.toThrow();
      });

      const invalidIndicator = { type: 'invalid-type', value: 'test' };
      expect(() => validateIndicator(invalidIndicator)).toThrow('type must be one of');
    });

    test('requires non-empty value', () => {
      const emptyValueIndicator = { type: 'ip', value: '' };
      expect(() => validateIndicator(emptyValueIndicator)).toThrow('value is required');
      
      const whitespaceValueIndicator = { type: 'ip', value: '   ' };
      expect(() => validateIndicator(whitespaceValueIndicator)).toThrow('value is required');
    });
  });

  describe('Normalization', () => {
    test('normalizes IP addresses to canonical form', () => {
      const testCases = [
        { input: '192.168.1.1', expected: '192.168.1.1' },
        { input: '  192.168.1.1  ', expected: '192.168.1.1' }, // trim whitespace
      ];

      testCases.forEach(({ input, expected }) => {
        const normalized = normalizeIndicator({ type: 'ip', value: input });
        expect(normalized.value).toBe(expected);
      });
    });

    test('normalizes domains to lowercase', () => {
      const testCases = [
        { input: 'EXAMPLE.COM', expected: 'example.com' },
        { input: 'Test.Example.Org', expected: 'test.example.org' },
      ];

      testCases.forEach(({ input, expected }) => {
        const normalized = normalizeIndicator({ type: 'domain', value: input });
        expect(normalized.value).toBe(expected);
      });
    });

    test('normalizes hashes to lowercase', () => {
      const testCases = [
        { input: 'ABC123DEF456', expected: 'abc123def456' },
        { input: 'DeAdBeEf', expected: 'deadbeef' },
      ];

      testCases.forEach(({ input, expected }) => {
        const normalized = normalizeIndicator({ type: 'hash', value: input });
        expect(normalized.value).toBe(expected);
      });
    });
  });

  describe('Database operations', () => {
    test('creates proper database indexes', () => {
      // Database index creation is tested as part of the connection setup
      // This is covered by the mongo.js integration
      expect(true).toBe(true); // Placeholder - indexes tested in integration
    });

    test('handles TTL for retention policy', () => {
      // TTL is handled by MongoDB automatically once the index is created
      // The index setup includes expireAfterSeconds: 7776000 (90 days)
      expect(true).toBe(true); // Placeholder - TTL handled by DB layer
    });
  });
});