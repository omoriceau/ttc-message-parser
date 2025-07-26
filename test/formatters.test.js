import { describe, it, expect, vi } from 'vitest';
import {
  formatAlertsTable,
  formatResultsTables,
  formatAsJSON,
  formatSummary
} from '../src/formatters.js';

// Mock console.log to capture output
const mockConsoleLog = vi.fn();
vi.stubGlobal('console', { log: mockConsoleLog });

describe('Formatters', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  describe('formatAlertsTable', () => {
    it('should format API alerts as table', () => {
      const alerts = [
        {
          id: 'test-id-1',
          line: 'Line 1',
          title: 'Test Alert 1',
          severity: 'High'
        },
        {
          id: 'test-id-2',
          line: 'Line 2',
          title: 'Test Alert 2',
          severity: 'Medium'
        }
      ];

      formatAlertsTable(alerts);

      expect(mockConsoleLog).toHaveBeenCalled();
      const output = mockConsoleLog.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toContain('Formatted TTC Alert Results');
      expect(output).toContain('test-id-'); // ID gets truncated in table
      expect(output).toContain('Line 1');
      expect(output).toContain('Test Alert 1');
      expect(output).toContain('Total alerts: 2');
    });

    it('should handle empty alerts array', () => {
      formatAlertsTable([]);

      expect(mockConsoleLog).toHaveBeenCalled();
      const output = mockConsoleLog.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('No alerts to display');
    });

    it('should handle alerts with missing fields', () => {
      const alerts = [
        { id: 'partial-1' },
        { line: 'Line 1', title: 'Partial Alert' }
      ];

      expect(() => formatAlertsTable(alerts)).not.toThrow();
    });
  });

  describe('formatResultsTables', () => {
    it('should format mixed results with separate tables', () => {
      const results = [
        {
          type: 'service_disruption',
          start_date: 'July 25, 2025',
          location_start: 'St George',
          location_end: 'St Andrew',
          service_type: 'subway',
          work_type: 'planned work'
        },
        {
          type: 'accessibility_issue',
          station: 'Bessarion',
          equipment_type: 'elevator',
          location_start: 'concourse',
          location_end: 'platform'
        }
      ];

      formatResultsTables(results);

      expect(mockConsoleLog).toHaveBeenCalled();
      const output = mockConsoleLog.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toContain('SERVICE DISRUPTIONS');
      expect(output).toContain('ACCESSIBILITY ISSUES');
      expect(output).toContain('St George');
      expect(output).toContain('Bessarion');
    });

    it('should handle only service disruptions', () => {
      const results = [
        {
          type: 'service_disruption',
          start_date: 'July 25, 2025',
          location_start: 'Test Station'
        }
      ];

      formatResultsTables(results);

      const output = mockConsoleLog.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('SERVICE DISRUPTIONS');
      expect(output).not.toContain('ACCESSIBILITY ISSUES');
    });

    it('should handle only accessibility issues', () => {
      const results = [
        {
          type: 'accessibility_issue',
          station: 'Test Station',
          equipment_type: 'elevator'
        }
      ];

      formatResultsTables(results);

      const output = mockConsoleLog.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('ACCESSIBILITY ISSUES');
      expect(output).not.toContain('SERVICE DISRUPTIONS');
    });

    it('should handle empty results', () => {
      formatResultsTables([]);

      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  describe('formatAsJSON', () => {
    it('should format data as JSON with title', () => {
      const data = [
        { id: 1, name: 'Test Item 1' },
        { id: 2, name: 'Test Item 2' }
      ];
      const title = 'Test Results';

      formatAsJSON(data, title);

      expect(mockConsoleLog).toHaveBeenCalled();
      const output = mockConsoleLog.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toContain('Test Results:');
      expect(output).toContain('"id": 1');
      expect(output).toContain('"name": "Test Item 1"');
    });

    it('should handle empty data', () => {
      formatAsJSON([], 'Empty Results');

      const output = mockConsoleLog.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('Empty Results:');
      expect(output).toContain('[]');
    });

    it('should handle null/undefined data', () => {
      expect(() => formatAsJSON(null, 'Null Data')).not.toThrow();
      expect(() => formatAsJSON(undefined, 'Undefined Data')).not.toThrow();
    });
  });

  describe('formatSummary', () => {
    it('should format comprehensive summary', () => {
      const data = [
        {
          type: 'service_disruption',
          line: 'Line 1',
          location_start: 'St George'
        },
        {
          type: 'service_disruption',
          line: 'Line 2',
          location_start: 'Bloor'
        },
        {
          type: 'accessibility_issue',
          station: 'Bessarion',
          equipment_type: 'elevator'
        },
        {
          type: 'accessibility_issue',
          station: 'Spadina',
          equipment_type: 'escalator'
        },
        {
          id: 'api-alert-1',
          line: 'Line 1',
          disruption_type: 'service'
        }
      ];

      formatSummary(data);

      expect(mockConsoleLog).toHaveBeenCalled();
      const output = mockConsoleLog.mock.calls.map(call => call[0]).join('\n');
      
      expect(output).toContain('PARSING SUMMARY');
      expect(output).toContain('Total items parsed: 5');
      expect(output).toContain('Service disruptions: 2');
      expect(output).toContain('Accessibility issues: 2');
      expect(output).toContain('API alerts: 1');
      expect(output).toContain('Line 1: 1'); // Only service disruptions count for line breakdown
      expect(output).toContain('Line 2: 1');
      expect(output).toContain('Bessarion: 1');
      expect(output).toContain('Spadina: 1');
    });

    it('should handle empty data', () => {
      formatSummary([]);

      const output = mockConsoleLog.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('No data to summarize');
    });

    it('should handle data with missing fields', () => {
      const data = [
        { type: 'service_disruption' },
        { type: 'accessibility_issue' },
        { id: 'api-alert' }
      ];

      expect(() => formatSummary(data)).not.toThrow();
    });

    it('should count unknown lines correctly', () => {
      const data = [
        { type: 'service_disruption' }, // No line specified
        { type: 'service_disruption', line: null }
      ];

      formatSummary(data);

      const output = mockConsoleLog.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('Unknown: 2');
    });
  });
});