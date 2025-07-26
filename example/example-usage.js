// example-usage.js - Complete example showing how to use the TTC parser modules

import TTCParser from '../src/ttc-parser.js';
import { formatAsJSON, formatSummary } from '../src/formatters.js';

// Create an instance of the parser
const parser = new TTCParser();

// Example 1: Parse API data
console.log('='.repeat(80));
console.log('EXAMPLE 1: PARSING TTC API DATA');
console.log('='.repeat(80));

const apiTestData = {
  "Results": [
    {
      "Id": "a38f1477-8709-411c-9963-0b99503532c6",
      "Language": "en",
      "Path": "/sitecore/content/TTC/DevProto/Home/service-advisories/subway-service/Line 1 St George to St Andrew Early nightly closure July 25 2025",
      "Url": "/service-advisories/subway-service/Line-1-St-George-to-St-Andrew-Early-nightly-closure-July-25-2025",
      "Name": null,
      "Html": "\u003Ca title=\"Line 1 St George to St Andrew Early nightly closure July 25 2025\" href=\"/service-advisories/subway-service/Line-1-St-George-to-St-Andrew-Early-nightly-closure-July-25-2025\" role=\"heading\" aria-level=\"2\"\u003E\u003Cdiv class=\"sa-title c-news-results__link u-mb-sm\"\u003E\u003Cspan class=\"field-routename\"\u003Eline 1 (yonge-university)\u003C/span\u003E\u003Cspan class=\"sa-dash\"\u003E&#8211;\u003C/span\u003E\u003Cspan class=\"field-satitle\"\u003ESt George to St Andrew stations – Early nightly closure on Friday, July 25 2025 \u003C/span\u003E\u003C/div\u003E\u003C/a\u003E\u003Cdiv class=\"sa-effective-date c-news-results__date\"\u003E\u003Cspan class=\"sa-start-date-label-wrapper\"\u003E\u003C/span\u003EJuly 25, 2025\u003Cspan\u003E&nbsp;\u003C/span\u003E\u003C/div\u003E"
    },
    {
      "Id": "ee5421dd-4345-4c29-b6b9-871f7d04ba3d",
      "Language": "en",
      "Path": "/sitecore/content/TTC/DevProto/Home/service-advisories/subway-service/Line 1 St George to St Andrew Full weekend closure July 26 to 27 2025",
      "Url": "/service-advisories/subway-service/Line-1-St-George-to-St-Andrew-Full-weekend-closure-July-26-to-27-2025",
      "Name": null,
      "Html": "\u003Ca title=\"Line 1 St George to St Andrew Full weekend closure July 26 to 27 2025\" href=\"/service-advisories/subway-service/Line-1-St-George-to-St-Andrew-Full-weekend-closure-July-26-to-27-2025\" role=\"heading\" aria-level=\"2\"\u003E\u003Cdiv class=\"sa-title c-news-results__link u-mb-sm\"\u003E\u003Cspan class=\"field-routename\"\u003Eline 1 (yonge-university)\u003C/span\u003E\u003Cspan class=\"sa-dash\"\u003E&#8211;\u003C/span\u003E\u003Cspan class=\"field-satitle\"\u003ESt George to St Andrew stations – Full weekend closure on Saturday, July 26 to Sunday, July 27, 2025 \u003C/span\u003E\u003C/div\u003E\u003C/a\u003E\u003Cdiv class=\"sa-effective-date c-news-results__date\"\u003E\u003Cspan class=\"ed-start-date field-starteffectivedate\"\u003EJuly 26, 2025\u003Cspan\u003E&nbsp;\u003C/span\u003E\u003C/span\u003E\u003Cspan class=\"effective-date-tolabel\"\u003Eto \u003C/span\u003E\u003Cspan class=\"field-endeffectivedate\"\u003EJuly 27, 2025\u003C/span\u003E\u003C/div\u003E"
    }
  ]
};

// Parse API data
const apiResults = parser.parseApiAlerts(apiTestData);
formatAsJSON(apiResults, 'API Parsing Results');
parser.displayApiAlertsTable(apiResults);

// Example 2: Parse text data with service disruptions and accessibility issues
console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 2: PARSING TTC TEXT DATA');
console.log('='.repeat(80));

const textTestData = `On Sunday, July 27, subway service between St George and Broadview stations will start by 11 a.m., due to planned track work. Shuttle buses will operate.

On Saturday, July 26, there will be no subway service between Kipling and Keele stations, due to planned track work. Shuttle buses will operate.

This weekend, there will be no subway service between St George and St Andrew stations, starting at 11 p.m. July 25, due to planned track work. Shuttle buses will only operate on Friday.

Bessarion: Elevator out of service between concourse and Line 4 platform.

Kipling: Elevator out of service between Aukland Rd entrance and concourse.

Spadina: Escalator 2B2E out of service from Line 2 Kennedy platform to south concourse.

Dupont: Escalator 2S7E out of service from Dupont St north side entrance to concourse.`;

// Parse text data
const textResults = parser.parseTextAlerts(textTestData);
formatAsJSON(textResults, 'Text Parsing Results');
parser.displayTextAlertsTable(textResults);

// Example 3: Parse only service disruptions
console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 3: PARSING ONLY SERVICE DISRUPTIONS');
console.log('='.repeat(80));

const serviceDisruptions = parser.parseServiceDisruptions(textTestData);
formatAsJSON(serviceDisruptions, 'Service Disruptions Only');

// Example 4: Parse only accessibility issues
console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 4: PARSING ONLY ACCESSIBILITY ISSUES');
console.log('='.repeat(80));

const accessibilityIssues = parser.parseAccessibilityIssues(textTestData);
formatAsJSON(accessibilityIssues, 'Accessibility Issues Only');

// Example 5: Working with mixed data
console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 5: MIXED DATA ANALYSIS');
console.log('='.repeat(80));

const allResults = [...apiResults, ...textResults];
formatSummary(allResults);

// Example 6: Filter and analyze data
console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 6: DATA FILTERING AND ANALYSIS');
console.log('='.repeat(80));

// Filter by line
const line1Alerts = allResults.filter(alert =>
  alert.line === 'Line 1' ||
  (alert.location_start && alert.location_start.includes('St George'))
);

console.log('\nLine 1 Related Alerts:');
console.log(JSON.stringify(line1Alerts, null, 2));

// Filter by date
const todayAlerts = allResults.filter(alert =>
  alert.start_date && alert.start_date.includes('July 25')
);

console.log('\nAlerts for July 25, 2025:');
console.log(JSON.stringify(todayAlerts, null, 2));

// Filter by work type
const closureAlerts = allResults.filter(alert =>
  alert.work_type && alert.work_type.toLowerCase().includes('closure')
);

console.log('\nClosure Alerts:');
console.log(JSON.stringify(closureAlerts, null, 2));

// Example 7: Error handling
console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 7: ERROR HANDLING');
console.log('='.repeat(80));

try {
  // Test with invalid JSON
  const invalidApiData = "invalid json";
  const invalidResults = parser.parseApiAlerts(invalidApiData);
  console.log('Invalid API data handled gracefully:', invalidResults.length);
} catch (error) {
  console.log('Error caught:', error.message);
}

try {
  // Test with empty data
  const emptyResults = parser.parseTextAlerts("");
  console.log('Empty text data handled gracefully:', emptyResults.length);
} catch (error) {
  console.log('Error caught:', error.message);
}

// Example 8: Using utility functions directly
console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 8: UTILITY FUNCTIONS');
console.log('='.repeat(80));

const htmlText = "St George &amp; St Andrew &#8211; Early closure";
const cleanedText = parser.cleanHtml(htmlText);
console.log('Original:', htmlText);
console.log('Cleaned:', cleanedText);

console.log('\n' + '='.repeat(80));
console.log('PARSING COMPLETE - ALL EXAMPLES FINISHED');
console.log('='.repeat(80));