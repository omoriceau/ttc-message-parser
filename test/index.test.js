import { describe, it, expect } from 'vitest';
import TTCParser, {
  parseApiAlerts,
  parseTextAlerts,
  parseApiAlertsOnly,
  parseTextAlertsOnly,
  formatters,
  utils
} from '../index.js';

describe('Index Exports', () => {
  describe('default export', () => {
    it('should export TTCParser as default', () => {
      expect(TTCParser).toBeDefined();
      expect(typeof TTCParser).toBe('function');
      
      const parser = new TTCParser();
      expect(parser).toBeInstanceOf(TTCParser);
    });
  });

  describe('named exports', () => {
    it('should export TTCParser class', () => {
      expect(TTCParser).toBeDefined();
      expect(typeof TTCParser).toBe('function');
    });

    it('should export parseApiAlerts function', () => {
      expect(parseApiAlerts).toBeDefined();
      expect(typeof parseApiAlerts).toBe('function');
    });

    it('should export parseTextAlerts function', () => {
      expect(parseTextAlerts).toBeDefined();
      expect(typeof parseTextAlerts).toBe('function');
    });

    it('should export parseApiAlertsOnly function', () => {
      expect(parseApiAlertsOnly).toBeDefined();
      expect(typeof parseApiAlertsOnly).toBe('function');
    });

    it('should export parseTextAlertsOnly function', () => {
      expect(parseTextAlertsOnly).toBeDefined();
      expect(typeof parseTextAlertsOnly).toBe('function');
    });

    it('should export formatters module', () => {
      expect(formatters).toBeDefined();
      expect(typeof formatters).toBe('object');
      expect(formatters.formatAlertsTable).toBeDefined();
      expect(formatters.formatAsJSON).toBeDefined();
    });

    it('should export utils module', () => {
      expect(utils).toBeDefined();
      expect(typeof utils).toBe('object');
      expect(utils.cleanHtmlEntities).toBeDefined();
      expect(utils.convertTo24Hour).toBeDefined();
    });
  });

  describe('integration tests', () => {
    it('should work with class methods and direct functions consistently', () => {
      const parser = new TTCParser();
      const testText = 'Bessarion: Elevator out of service between concourse and Line 4 platform.';
      
      // Test class method
      const classResults = parser.parseTextAlerts(testText);
      
      // Test direct function from class
      const directResults = parseTextAlerts(testText);
      
      // Test standalone function
      const standaloneResults = parseTextAlertsOnly(testText);
      
      expect(classResults).toEqual(directResults);
      expect(directResults).toEqual(standaloneResults);
      expect(classResults).toHaveLength(1);
    });

    it('should work with API parsing consistently', () => {
      const parser = new TTCParser();
      const testData = { Results: [] };
      
      const classResults = parser.parseApiAlerts(testData);
      const directResults = parseApiAlerts(testData);
      const standaloneResults = parseApiAlertsOnly(testData);
      
      expect(classResults).toEqual(directResults);
      expect(directResults).toEqual(standaloneResults);
      expect(classResults).toHaveLength(0);
    });

    it('should provide access to utility functions', () => {
      const htmlText = 'Test &amp; Example &#8211; Text';
      const cleaned = utils.cleanHtmlEntities(htmlText);
      
      expect(cleaned).toBe('Test & Example – Text');
    });

    it('should provide access to formatting functions', () => {
      const testData = [{ id: 'test', name: 'Test Alert' }];
      
      // Should not throw
      expect(() => formatters.formatAsJSON(testData, 'Test')).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully in all export variants', () => {
      const parser = new TTCParser();
      
      // All should handle invalid input without crashing
      expect(() => parser.parseApiAlerts('invalid')).toThrow();
      expect(() => parseApiAlerts('invalid')).toThrow();
      expect(() => parseApiAlertsOnly('invalid')).toThrow();
      
      // Text parsing should handle invalid input gracefully
      expect(parser.parseTextAlerts(null)).toHaveLength(0);
      expect(parseTextAlerts(null)).toHaveLength(0);
      expect(parseTextAlertsOnly(null)).toHaveLength(0);
    });
  });
});