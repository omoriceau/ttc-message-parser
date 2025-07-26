# TTC Data Parser

A comprehensive JavaScript library for parsing Toronto Transit Commission (TTC) service alerts from multiple data sources including API responses and text notifications.

## Features

- **API Alert Parsing**: Parse structured TTC API responses containing service advisories
- **Text Alert Parsing**: Parse unstructured text containing service disruptions and accessibility issues
- **Dual Data Types**: Handle both service disruptions and accessibility issues (elevators/escalators)
- **Flexible Output**: Multiple formatting options including tables and JSON
- **Modular Design**: Separated concerns with dedicated modules for parsing, formatting, and utilities
- **Error Handling**: Graceful handling of malformed or missing data

## File Structure

```
ttc-parser/
├── ttc-parser.js      # Main module with TTCParser class
├── api-parser.js      # API response parsing logic
├── text-parser.js     # Text alert parsing logic
├── formatters.js      # Display and formatting utilities
├── utils.js           # Utility functions
├── example-usage.js   # Complete usage examples
└── README.md          # This documentation
```

## Installation

```javascript
// Import the main parser
import TTCParser from './ttc-parser.js';

// Or import specific functions
import { parseApiAlerts, parseTextAlerts } from './ttc-parser.js';
```

## Quick Start

```javascript
import TTCParser from './ttc-parser.js';

const parser = new TTCParser();

// Parse API data
const apiResults = parser.parseApiAlerts(apiResponse);
parser.displayApiAlertsTable(apiResults);

// Parse text data
const textResults = parser.parseTextAlerts(textData);
parser.displayTextAlertsTable(textResults);

// Get only service disruptions
const disruptions = parser.parseServiceDisruptions(textData);

// Get only accessibility issues
const accessibility = parser.parseAccessibilityIssues(textData);
```

## Data Structures

### API Alert Object
```javascript
{
  id: "a38f1477-8709-411c-9963-0b99503532c6",
  start_date: "July 25, 2025",
  end_date: "July 27, 2025",
  start_time: "11 PM",
  end_time: null,
  service_type: "subway",
  line: "Line 1",
  location_start: "St George",
  location_end: "St Andrew",
  work_type: "early closure",
  disruption_type: "service",
  title: "St George to St Andrew stations – Early nightly closure...",
  url: "/service-advisories/subway-service/..."
}
```

### Service Disruption Object
```javascript
{
  type: "service_disruption",
  start_date: "July 27, 2025",
  end_date: null,
  start_time: null,
  end_time: "11:00",
  service_type: "subway",
  location_start: "St George",
  location_end: "Broadview",
  work_type: "planned track work",
  station: null,
  equipment_type: null,
  equipment_id: null,
  description: null
}
```

### Accessibility Issue Object
```javascript
{
  type: "accessibility_issue",
  start_date: null,
  end_date: null,
  start_time: null,
  end_time: null,
  service_type: null,
  location_start: "concourse",
  location_end: "Line 4 platform",
  work_type: null,
  station: "Bessarion",
  equipment_type: "elevator",
  equipment_id: null,
  description: "between concourse and Line 4 platform"
}
```

## API Reference

### TTCParser Class

#### Methods

- `parseApiAlerts(apiResponse)` - Parse TTC API alerts
- `parseTextAlerts(text)` - Parse text alerts (both types)
- `parseServiceDisruptions(text)` - Parse only service disruptions
- `parseAccessibilityIssues(text)` - Parse only accessibility issues
- `displayApiAlertsTable(alerts)` - Display API alerts as table
- `displayTextAlertsTable(alerts)` - Display text alerts as tables
- `cleanHtml(text)` - Clean HTML entities from text

### Standalone Functions

#### API Parser (`api-parser.js`)
- `parseApiAlerts(apiResponse)` - Main API parsing function

#### Text Parser (`text-parser.js`)
- `parseTextAlerts(text)` - Main text parsing function

#### Formatters (`formatters.js`)
- `formatAlertsTable(alerts)` - Format API alerts as table
- `formatResultsTables(data)` - Format text alerts as tables
- `formatAsJSON(data, title)` - Format as JSON with title
- `formatSummary(data)` - Display parsing summary

#### Utils (`utils.js`)
- `cleanHtmlEntities(text)` - Clean HTML entities
- `convertTo24Hour(timeStr)` - Convert 12h to 24h format
- `standardizeDate(dateStr)` - Standardize date format
- `extractLineNumber(lineName)` - Extract line number
- `cleanStationName(stationName)` - Clean station names
- `containsTimeInfo(text)` - Check for time info
- `extractTimes(text)` - Extract all times from text
- `determineServiceType(text)` - Determine service type
- `isWeekendDisruption(text)` - Check if weekend disruption

## Usage Examples

### Basic API Parsing
```javascript
const parser = new TTCParser();
const apiData = { Results: [/* API response data */] };
const results = parser.parseApiAlerts(apiData);
console.log(results);
```

### Text Parsing with Mixed Content
```javascript
const textData = `
On Sunday, July 27, subway service between St George and Broadview stations will start by 11 a.m.
Bessarion: Elevator out of service between concourse and Line 4 platform.
`;

const results = parser.parseTextAlerts(textData);
parser.displayTextAlertsTable(results);
```

### Filtering Results
```javascript
const allResults = parser.parseTextAlerts(textData);

// Get only service disruptions
const disruptions = allResults.filter(item => item.type === 'service_disruption');

// Get only Line 1 alerts
const line1Alerts = allResults.filter(item => item.line === 'Line 1');

// Get alerts for specific date
const todayAlerts = allResults.filter(item => 
  item.start_date && item.start_date.includes('July 25')
);
```

### Error Handling
```javascript
try {
  const results = parser.parseApiAlerts(apiData);
  console.log(`Parsed ${results.length} alerts successfully`);
} catch (error) {
  console.error('Parsing failed:', error.message);
}
```

## Data Sources

### API Data Format
The parser expects TTC API responses with the following structure:
```javascript
{
  "Results": [
    {
      "Id": "uuid",
      "Url": "/service-advisories/...",
      "Html": "HTML content with embedded alert information"
    }
  ]
}
```

### Text Data Format
The parser can handle various text formats including:
- Service disruption notices with dates, times, and locations
- Accessibility issue notifications for elevators and escalators
- Mixed content with both types of alerts

## Contributing

The modular design makes it easy to extend functionality:
- Add new parsing patterns in the respective parser modules
- Add new output formats in the formatters module
- Add utility functions in the utils module

## Error Handling

The parser includes comprehensive error handling:
- Invalid JSON in API responses
- Malformed HTML in API data
- Missing or incomplete text data
- Graceful degradation when partial data is available

## Performance

The parser is designed for efficiency:
- Single-pass parsing where possible
- Regex patterns optimized for common cases
- Minimal memory allocation for large datasets
- Lazy evaluation of optional fields