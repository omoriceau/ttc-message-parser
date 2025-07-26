import { describe, it, expect } from 'vitest';
import {
  cleanHtmlEntities,
  convertTo24Hour,
  standardizeDate,
  extractLineNumber,
  cleanStationName,
  containsTimeInfo,
  extractTimes,
  determineServiceType,
  isWeekendDisruption
} from '../src/utils.js';

describe('Utils', () => {
  describe('cleanHtmlEntities', () => {
    it('should clean common HTML entities', () => {
      const testCases = [
        { input: 'St George &amp; St Andrew', expected: 'St George & St Andrew' },
        { input: 'Line &#8211; Service', expected: 'Line – Service' },
        { input: '&lt;tag&gt;', expected: '<tag>' },
        { input: '&quot;quoted&quot;', expected: '"quoted"' },
        { input: '&#39;apostrophe&#39;', expected: "'apostrophe'" },
        { input: 'Normal&nbsp;text', expected: 'Normal text' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(cleanHtmlEntities(input)).toBe(expected);
      });
    });

    it('should handle text without HTML entities', () => {
      const text = 'Regular text without entities';
      expect(cleanHtmlEntities(text)).toBe(text);
    });

    it('should handle unknown entities', () => {
      const text = 'Text with &unknown; entity';
      expect(cleanHtmlEntities(text)).toBe('Text with &unknown; entity');
    });
  });

  describe('convertTo24Hour', () => {
    it('should convert AM times correctly', () => {
      const testCases = [
        { input: '11 a.m.', expected: '11:00' },
        { input: '12 AM', expected: '00:00' },
        { input: '1:30 am', expected: '01:30' },
        { input: '9 a.m.', expected: '09:00' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(convertTo24Hour(input)).toBe(expected);
      });
    });

    it('should convert PM times correctly', () => {
      const testCases = [
        { input: '11 p.m.', expected: '23:00' },
        { input: '12 PM', expected: '12:00' },
        { input: '1:30 pm', expected: '13:30' },
        { input: '6:45 p.m.', expected: '18:45' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(convertTo24Hour(input)).toBe(expected);
      });
    });

    it('should handle edge cases', () => {
      expect(convertTo24Hour('12:00 AM')).toBe('00:00');
      expect(convertTo24Hour('12:00 PM')).toBe('12:00');
      expect(convertTo24Hour('12 am')).toBe('00:00');
      expect(convertTo24Hour('12 pm')).toBe('12:00');
    });
  });

  describe('standardizeDate', () => {
    it('should standardize valid date strings', () => {
      const testCases = [
        { input: 'July 25, 2025', expected: 'July 25, 2025' },
        { input: 'january 1, 2024', expected: 'january 1, 2024' }, // Function returns as-is if no proper match
        { input: 'DECEMBER 31, 2023', expected: 'DECEMBER 31, 2023' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(standardizeDate(input)).toBe(expected);
      });
    });

    it('should handle invalid or malformed dates', () => {
      expect(standardizeDate('invalid date')).toBe('invalid date');
      expect(standardizeDate('')).toBe(null); // Empty string returns null
      expect(standardizeDate(null)).toBe(null);
      expect(standardizeDate(undefined)).toBe(null);
    });

    it('should trim whitespace', () => {
      expect(standardizeDate('  July 25, 2025  ')).toBe('July 25, 2025');
    });
  });

  describe('extractLineNumber', () => {
    it('should extract line numbers from various formats', () => {
      const testCases = [
        { input: 'line 1 (yonge-university)', expected: 'Line 1' },
        { input: 'Line 2 Bloor-Danforth', expected: 'Line 2' },
        { input: 'line 4', expected: 'Line 4' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(extractLineNumber(input)).toBe(expected);
      });
    });

    it('should return original string if no line number found', () => {
      expect(extractLineNumber('Bus Route 123')).toBe('Bus Route 123');
      expect(extractLineNumber('Streetcar')).toBe('Streetcar');
    });

    it('should handle null/undefined input', () => {
      expect(extractLineNumber(null)).toBe(null);
      expect(extractLineNumber(undefined)).toBe(null);
    });
  });

  describe('cleanStationName', () => {
    it('should clean station names', () => {
      const testCases = [
        { input: 'St George Station', expected: 'St George' },
        { input: 'Bloor-Yonge stations', expected: 'Bloor-Yonge' },
        { input: '  Spadina  ', expected: 'Spadina' },
        { input: 'Union   Station  ', expected: 'Union' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(cleanStationName(input)).toBe(expected);
      });
    });

    it('should handle null/undefined input', () => {
      expect(cleanStationName(null)).toBe(null);
      expect(cleanStationName(undefined)).toBe(null);
      expect(cleanStationName('')).toBe(null);
    });

    it('should normalize whitespace', () => {
      expect(cleanStationName('St   George   Station')).toBe('St George');
    });
  });

  describe('containsTimeInfo', () => {
    it('should detect time information', () => {
      const testCases = [
        { input: 'starting at 11 p.m.', expected: true },
        { input: 'by 9:30 AM', expected: true },
        { input: 'until 6 a.m.', expected: true },
        { input: 'no time here', expected: false },
        { input: '', expected: false },
        { input: null, expected: false }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(containsTimeInfo(input)).toBe(expected);
      });
    });
  });

  describe('extractTimes', () => {
    it('should extract all time strings from text', () => {
      const text = 'Service from 6:00 a.m. to 11:30 p.m. daily';
      const times = extractTimes(text);
      
      expect(times).toHaveLength(2);
      expect(times).toContain('6:00 a.m.');
      expect(times).toContain('11:30 p.m.');
    });

    it('should handle text with no times', () => {
      expect(extractTimes('No times in this text')).toHaveLength(0);
      expect(extractTimes('')).toHaveLength(0);
      expect(extractTimes(null)).toHaveLength(0);
    });

    it('should handle various time formats', () => {
      const text = '11 AM, 2:30 pm, 6 a.m., 9:45 P.M.';
      const times = extractTimes(text);
      
      expect(times).toHaveLength(4);
    });
  });

  describe('determineServiceType', () => {
    it('should determine service types from text', () => {
      const testCases = [
        { input: 'subway service between stations', expected: 'subway' },
        { input: 'bus route 123', expected: 'bus' },
        { input: 'streetcar line', expected: 'streetcar' },
        { input: 'train service', expected: 'train' },
        { input: 'unknown service', expected: null },
        { input: '', expected: null },
        { input: null, expected: null }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(determineServiceType(input)).toBe(expected);
      });
    });

    it('should be case insensitive', () => {
      expect(determineServiceType('SUBWAY SERVICE')).toBe('subway');
      expect(determineServiceType('Bus Route')).toBe('bus');
    });
  });

  describe('isWeekendDisruption', () => {
    it('should detect weekend disruptions', () => {
      const testCases = [
        { input: 'this weekend there will be', expected: true },
        { input: 'on Saturday service', expected: true },
        { input: 'Sunday closure', expected: true },
        { input: 'weekend service', expected: true },
        { input: 'weekday service', expected: false },
        { input: 'Monday to Friday', expected: false },
        { input: '', expected: false },
        { input: null, expected: false }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(isWeekendDisruption(input)).toBe(expected);
      });
    });

    it('should be case insensitive', () => {
      expect(isWeekendDisruption('THIS WEEKEND')).toBe(true);
      expect(isWeekendDisruption('Saturday')).toBe(true);
    });
  });
});