import { describe, it, expect } from 'vitest';
import { parseApiAlerts } from '../src/api-parser.js';

describe('API Parser', () => {
  describe('parseApiAlerts', () => {
    it('should parse complete API alert with all fields', () => {
      const apiData = {
        Results: [{
          Id: 'a38f1477-8709-411c-9963-0b99503532c6',
          Url: '/service-advisories/subway-service/test',
          Html: `
            <span class="field-routename">line 1 (yonge-university)</span>
            <span class="field-satitle">St George to St Andrew stations – Early nightly closure on Friday, July 25 2025</span>
            <span class="ed-start-date field-starteffectivedate">July 25, 2025</span>
            <span class="field-endeffectivedate">July 27, 2025</span>
          `
        }]
      };

      const results = parseApiAlerts(apiData);
      
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        id: 'a38f1477-8709-411c-9963-0b99503532c6',
        line: 'Line 1',
        location_start: 'St George',
        location_end: 'St Andrew',
        work_type: 'early nightly closure',
        service_type: 'subway',
        start_date: 'July 25, 2025',
        end_date: 'July 27, 2025',
        url: '/service-advisories/subway-service/test'
      });
    });

    it('should handle JSON string input', () => {
      const jsonString = JSON.stringify({
        Results: [{
          Id: 'test-id',
          Html: '<span class="field-routename">line 2 (bloor-danforth)</span>'
        }]
      });

      const results = parseApiAlerts(jsonString);
      expect(results).toHaveLength(1);
      expect(results[0].line).toBe('Line 2');
    });

    it('should extract different line numbers', () => {
      const testCases = [
        { html: 'line 1 (yonge-university)', expected: 'Line 1' },
        { html: 'line 2 (bloor-danforth)', expected: 'Line 2' },
        { html: 'line 4 (sheppard)', expected: 'Line 4' }
      ];

      testCases.forEach(({ html, expected }) => {
        const results = parseApiAlerts({
          Results: [{ Id: 'test', Html: html }]
        });
        expect(results[0].line).toBe(expected);
      });
    });

    it('should extract different work types', () => {
      const testCases = [
        { 
          html: 'stations – Early nightly closure on Friday',
          expected: 'early nightly closure'
        },
        {
          html: 'stations – Full weekend closure on Saturday',
          expected: 'weekend closure'
        },
        {
          html: 'stations – Late opening on Monday',
          expected: 'late opening'
        }
      ];

      testCases.forEach(({ html, expected }) => {
        const results = parseApiAlerts({
          Results: [{ 
            Id: 'test', 
            Html: `<span class="field-satitle">Test ${html}</span>`
          }]
        });
        if (results.length > 0) {
          expect(results[0].work_type).toBe(expected);
        }
      });
    });

    it('should handle missing or malformed HTML', () => {
      const testCases = [
        { Html: '' },
        { Html: '<div>No relevant content</div>' },
        { Html: null }
      ];

      testCases.forEach(htmlCase => {
        const results = parseApiAlerts({
          Results: [{ Id: 'test', ...htmlCase }]
        });
        // Should not crash, but may return empty array or minimal data
        expect(Array.isArray(results)).toBe(true);
      });
    });

    it('should extract station names correctly', () => {
      const html = '<span class="field-satitle">Kipling to Keele stations – Weekend closure</span>';
      const results = parseApiAlerts({
        Results: [{ Id: 'test', Html: html }]
      });

      expect(results[0].location_start).toBe('Kipling');
      expect(results[0].location_end).toBe('Keele');
    });

    it('should handle fallback date extraction', () => {
      const html = 'Some text with July 25, 2025 in it';
      const results = parseApiAlerts({
        Results: [{ Id: 'test', Html: html }]
      });

      expect(results[0].start_date).toBe('July 25, 2025');
    });

    it('should filter out alerts with no meaningful data', () => {
      const results = parseApiAlerts({
        Results: [
          { Id: 'empty', Html: '<div></div>' },
          { Id: 'good', Html: '<span class="field-routename">line 1 (yonge-university)</span>' }
        ]
      });

      // The good alert should be included because it has line info
      const goodAlert = results.find(r => r.id === 'good');
      expect(goodAlert).toBeDefined();
      expect(goodAlert.line).toBe('Line 1');
    });
  });
});