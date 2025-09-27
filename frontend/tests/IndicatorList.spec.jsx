import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import IndicatorList from '../src/components/IndicatorList';

describe('IndicatorList Component', () => {
  test('renders loading state', () => {
    render(<IndicatorList indicators={[]} loading={true} error={null} />);
    expect(screen.getByText('Loading indicators...')).toBeInTheDocument();
  });

  test('renders error state', () => {
    render(<IndicatorList indicators={[]} loading={false} error="Test error" />);
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
  });

  test('renders empty state', () => {
    render(<IndicatorList indicators={[]} loading={false} error={null} />);
    expect(screen.getByText('No indicators found')).toBeInTheDocument();
  });

  test('renders indicators list', () => {
    const mockIndicators = [
      {
        id: '1',
        type: 'ip',
        value: '192.168.1.1',
        last_seen: '2025-09-27T00:00:00Z',
        sources: [{ feed_id: 'test-feed' }]
      },
      {
        id: '2',
        type: 'domain',
        value: 'example.com',
        last_seen: '2025-09-27T01:00:00Z',
        sources: [{ feed_id: 'test-feed' }]
      }
    ];

    render(<IndicatorList indicators={mockIndicators} loading={false} error={null} />);
    
    expect(screen.getByText('Found 2 indicators')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  test('formats dates correctly', () => {
    const mockIndicators = [
      {
        id: '1',
        type: 'ip',
        value: '192.168.1.1',
        last_seen: '2025-09-27T12:30:00Z',
        sources: []
      }
    ];

    render(<IndicatorList indicators={mockIndicators} loading={false} error={null} />);
    
    // Check that a formatted date is displayed (exact format may vary by locale)
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  test('displays correct type icons', () => {
    const mockIndicators = [
      { id: '1', type: 'ip', value: '1.1.1.1', last_seen: '2025-09-27T00:00:00Z', sources: [] },
      { id: '2', type: 'domain', value: 'test.com', last_seen: '2025-09-27T00:00:00Z', sources: [] },
      { id: '3', type: 'hash', value: 'abc123', last_seen: '2025-09-27T00:00:00Z', sources: [] }
    ];

    render(<IndicatorList indicators={mockIndicators} loading={false} error={null} />);
    
    expect(screen.getByText('🌐')).toBeInTheDocument(); // IP icon
    expect(screen.getByText('🏠')).toBeInTheDocument(); // Domain icon
    expect(screen.getByText('#️⃣')).toBeInTheDocument(); // Hash icon
  });
});