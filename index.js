// index.js
import TTCParser, { parseApiAlerts, parseTextAlerts } from './src/ttc-parser.js';
import { parseApiAlerts as parseApiAlertsOnly } from './src/api-parser.js';
import { parseTextAlerts as parseTextAlertsOnly } from './src/text-parser.js';
import * as formatters from './src/formatters.js';
import * as utils from './src/utils.js';

// Default export
export default TTCParser;

// Named exports
export {
  // Main class and its methods
  TTCParser,
  parseApiAlerts,
  parseTextAlerts,

  // Direct parser functions (for advanced users)
  parseApiAlertsOnly,
  parseTextAlertsOnly,

  // Utility modules
  formatters,
  utils
};

