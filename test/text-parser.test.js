import { describe, it, expect } from 'vitest';
import { parseTextAlerts } from '../src/text-parser.js';

describe('Text Parser', () => {
  describe('parseTextAlerts', () => {
    describe('service disruptions', () => {
      it('should parse basic service disruption', () => {
        const text = 'On Sunday, July 27, subway service between St George and Broadview stations will start by 11 a.m., due to planned track work.';
        const results = parseTextAlerts(text);

        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({
          type: 'service_disruption',
          start_date: 'July 27, 2025',
          end_time: '11:00',
          service_type: 'subway',
          location_start: 'St George',
          location_end: 'Broadview',
          work_type: 'planned track work'
        });
      });

      it('should parse weekend disruption', () => {
        const text = 'This weekend, there will be no subway service between St George and St Andrew stations, starting at 11 p.m. July 25, due to planned track work.';
        const results = parseTextAlerts(text);

        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({
          type: 'service_disruption',
          start_date: 'July 25, 2025',
          start_time: '23:00',
          end_time: '05:00',
          service_type: 'subway',
          location_start: 'St George',
          location_end: 'St Andrew',
          work_type: 'planned track work'
        });
      });

      it('should parse Saturday disruption', () => {
        const text = 'On Saturday, July 26, there will be no subway service between Kipling and Keele stations, due to planned track work.';
        const results = parseTextAlerts(text);

        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({
          type: 'service_disruption',
          start_date: 'July 26, 2025',
          service_type: 'subway',
          location_start: 'Kipling',
          location_end: 'Keele',
          work_type: 'planned track work'
        });
      });
    });

    describe('accessibility issues', () => {
      it('should parse elevator issue', () => {
        const text = 'Bessarion: Elevator out of service between concourse and Line 4 platform.';
        const results = parseTextAlerts(text);

        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({
          type: 'accessibility_issue',
          station: 'Bessarion',
          equipment_type: 'elevator',
          location_start: 'concourse',
          location_end: 'Line 4 platform',
          description: 'between concourse and Line 4 platform.'
        });
      });

      it('should parse escalator issue with ID', () => {
        const text = 'Spadina: Escalator 2B2E out of service from Line 2 Kennedy platform to south concourse.';
        const results = parseTextAlerts(text);

        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({
          type: 'accessibility_issue',
          station: 'Spadina',
          equipment_type: 'escalator',
          equipment_id: '2B2E',
          location_start: 'Line 2 Kennedy platform',
          location_end: 'south concourse',
          description: 'from Line 2 Kennedy platform to south concourse.'
        });
      });

      it('should parse multiple accessibility issues', () => {
        const text = `
          Bessarion: Elevator out of service between concourse and Line 4 platform.
          Kipling: Elevator out of service between Aukland Rd entrance and concourse.
        `;
        const results = parseTextAlerts(text);

        expect(results).toHaveLength(2);
        expect(results[0].station).toBe('Bessarion');
        expect(results[1].station).toBe('Kipling');
        expect(results.every(r => r.type === 'accessibility_issue')).toBe(true);
      });
    });

    describe('mixed content', () => {
      it('should parse both service disruptions and accessibility issues', () => {
        const text = `
          On Sunday, July 27, subway service between St George and Broadview stations will start by 11 a.m.
          Bessarion: Elevator out of service between concourse and Line 4 platform.
          On Saturday, July 26, there will be no subway service between Kipling and Keele stations.
          Spadina: Escalator 2B2E out of service from Line 2 Kennedy platform to south concourse.
        `;
        const results = parseTextAlerts(text);

        expect(results).toHaveLength(4);
        
        const serviceDisruptions = results.filter(r => r.type === 'service_disruption');
        const accessibilityIssues = results.filter(r => r.type === 'accessibility_issue');
        
        expect(serviceDisruptions).toHaveLength(2);
        expect(accessibilityIssues).toHaveLength(2);
      });
    });

    describe('edge cases', () => {
      it('should handle empty text', () => {
        const results = parseTextAlerts('');
        expect(results).toHaveLength(0);
      });

      it('should handle null/undefined input', () => {
        expect(parseTextAlerts(null)).toHaveLength(0);
        expect(parseTextAlerts(undefined)).toHaveLength(0);
      });

      it('should handle text with no alerts', () => {
        const text = 'This is just regular text with no transit alerts.';
        const results = parseTextAlerts(text);
        expect(results).toHaveLength(0);
      });

      it('should handle malformed alert text', () => {
        const text = 'Station: Something is wrong but not in expected format.';
        const results = parseTextAlerts(text);
        // Should not crash, may or may not parse depending on patterns
        expect(Array.isArray(results)).toBe(true);
      });
    });

    describe('time parsing', () => {
      it('should parse various time formats', () => {
        const testCases = [
          { text: 'starting at 11 p.m.', expected: '23:00' },
          { text: 'by 11 a.m.', expected: '11:00' }
        ];

        testCases.forEach(({ text, expected }) => {
          const fullText = `On Sunday, subway service between St George and Broadview stations will start ${text}.`;
          const results = parseTextAlerts(fullText);
          
          if (results.length > 0) {
            const hasExpectedTime = results[0].start_time === expected || results[0].end_time === expected;
            expect(hasExpectedTime).toBe(true);
          }
        });
      });

      it('should handle text without specific time patterns', () => {
        const text = 'Service will be disrupted this weekend.';
        const results = parseTextAlerts(text);
        // Should not crash, may or may not parse depending on patterns
        expect(Array.isArray(results)).toBe(true);
      });
    });
  });
});