import { describe, it, expect, vi } from 'vitest';
import TTCParser from '../src/ttc-parser.js';

describe('TTCParser', () => {
  let parser;

  beforeEach(() => {
    parser = new TTCParser();
  });

  describe('constructor', () => {
    it('should create a new TTCParser instance', () => {
      expect(parser).toBeInstanceOf(TTCParser);
    });
  });

  describe('parseApiAlerts', () => {
    it('should parse valid API response', () => {
      const apiData = {
        Results: [{
          Id: 'test-id',
          Html: '<span class="field-routename">line 1 (yonge-university)</span><span class="field-satitle">St George to St Andrew stations – Early closure</span>'
        }]
      };

      const results = parser.parseApiAlerts(apiData);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-id');
      expect(results[0].line).toBe('Line 1');
    });

    it('should handle empty API response', () => {
      const results = parser.parseApiAlerts({ Results: [] });
      expect(results).toHaveLength(0);
    });

    it('should handle invalid JSON string', () => {
      expect(() => parser.parseApiAlerts('invalid json')).toThrow();
    });

    it('should handle missing Results property', () => {
      const results = parser.parseApiAlerts({});
      expect(results).toHaveLength(0);
    });
  });

  describe('parseTextAlerts', () => {
    it('should parse service disruption text', () => {
      const text = 'On Sunday, July 27, subway service between St George and Broadview stations will start by 11 a.m., due to planned track work.';
      const results = parser.parseTextAlerts(text);
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('service_disruption');
      expect(results[0].location_start).toBe('St George');
      expect(results[0].location_end).toBe('Broadview');
    });

    it('should parse accessibility issue text', () => {
      const text = 'Bessarion: Elevator out of service between concourse and Line 4 platform.';
      const results = parser.parseTextAlerts(text);
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('accessibility_issue');
      expect(results[0].station).toBe('Bessarion');
      expect(results[0].equipment_type).toBe('elevator');
    });

    it('should handle empty text', () => {
      const results = parser.parseTextAlerts('');
      expect(results).toHaveLength(0);
    });

    it('should parse mixed content', () => {
      const text = `
        On Sunday, July 27, subway service between St George and Broadview stations will start by 11 a.m.
        Bessarion: Elevator out of service between concourse and Line 4 platform.
      `;
      const results = parser.parseTextAlerts(text);
      
      expect(results).toHaveLength(2);
      expect(results.some(r => r.type === 'service_disruption')).toBe(true);
      expect(results.some(r => r.type === 'accessibility_issue')).toBe(true);
    });
  });

  describe('parseServiceDisruptions', () => {
    it('should return only service disruptions', () => {
      const text = `
        On Sunday, July 27, subway service between St George and Broadview stations will start by 11 a.m.
        Bessarion: Elevator out of service between concourse and Line 4 platform.
      `;
      const results = parser.parseServiceDisruptions(text);
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('service_disruption');
    });
  });

  describe('parseAccessibilityIssues', () => {
    it('should return only accessibility issues', () => {
      const text = `
        On Sunday, July 27, subway service between St George and Broadview stations will start by 11 a.m.
        Bessarion: Elevator out of service between concourse and Line 4 platform.
      `;
      const results = parser.parseAccessibilityIssues(text);
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('accessibility_issue');
    });
  });

  describe('cleanHtml', () => {
    it('should clean HTML entities', () => {
      const html = 'St George &amp; St Andrew &#8211; Early closure';
      const cleaned = parser.cleanHtml(html);
      expect(cleaned).toBe('St George & St Andrew – Early closure');
    });

    it('should handle text without HTML entities', () => {
      const text = 'Regular text';
      const cleaned = parser.cleanHtml(text);
      expect(cleaned).toBe('Regular text');
    });
  });

  describe('display methods', () => {
    it('should call displayApiAlertsTable without errors', () => {
      const alerts = [{ id: 'test', line: 'Line 1', title: 'Test alert' }];
      expect(() => parser.displayApiAlertsTable(alerts)).not.toThrow();
    });

    it('should call displayTextAlertsTable without errors', () => {
      const alerts = [{ type: 'service_disruption', location_start: 'Test' }];
      expect(() => parser.displayTextAlertsTable(alerts)).not.toThrow();
    });
  });
});