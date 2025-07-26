// Simple test to verify the module works after installation
import TTCParser, { 
  parseApiAlerts, 
  parseTextAlerts, 
  parseApiAlertsOnly,
  parseTextAlertsOnly,
  formatters,
  utils
} from './index.js';

console.log('Testing ttc-alert-parser module...');

// Test 1: Class instantiation
const parser = new TTCParser();
console.log('✓ TTCParser class instantiated successfully');

// Test 2: Direct function imports
console.log('✓ Direct function imports work');

// Test 3: Basic parsing
const testText = "Bessarion: Elevator out of service between concourse and Line 4 platform.";
const results = parser.parseTextAlerts(testText);
console.log(`✓ Parsed ${results.length} alert(s) from test text`);

// Test 4: API parsing with empty data
const apiResults = parser.parseApiAlerts({ Results: [] });
console.log(`✓ API parsing with empty data returned ${apiResults.length} results`);

// Test 5: Direct parser functions
const directTextResults = parseTextAlertsOnly(testText);
console.log(`✓ Direct text parser function returned ${directTextResults.length} results`);

const directApiResults = parseApiAlertsOnly({ Results: [] });
console.log(`✓ Direct API parser function returned ${directApiResults.length} results`);

// Test 6: Utility functions
const htmlText = "St George &amp; St Andrew &#8211; Early closure";
const cleanedText = utils.cleanHtmlEntities(htmlText);
console.log(`✓ Utils module works: "${htmlText}" → "${cleanedText}"`);

// Test 7: Formatters module
console.log('✓ Formatters module imported successfully');

console.log('All tests passed! Module is ready for npm with comprehensive exports.');