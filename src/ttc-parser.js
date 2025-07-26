// ttc-parser.js - Main module for parsing TTC data
import { parseApiAlerts } from './api-parser.js';
import { parseTextAlerts } from './text-parser.js';
import { formatAlertsTable, formatResultsTables } from './formatters.js';
import { cleanHtmlEntities } from './utils.js';

/**
 * Main class for parsing TTC transit data from multiple sources
 */
class TTCParser {
  /**
   * Parse TTC API alerts response
   * @param {Object|string} apiResponse - API response object or JSON string
   * @returns {Array} Array of parsed alert objects
   */
  parseApiAlerts(apiResponse) {
    return parseApiAlerts(apiResponse);
  }

  /**
   * Parse TTC text alerts (service disruptions and accessibility issues)
   * @param {string} text - Raw text containing alerts
   * @returns {Array} Array of parsed alert objects
   */
  parseTextAlerts(text) {
    return parseTextAlerts(text);
  }

  /**
   * Parse TTC text alerts and return only service disruptions
   * @param {string} text - Raw text containing alerts
   * @returns {Array} Array of service disruption objects
   */
  parseServiceDisruptions(text) {
    return parseTextAlerts(text).filter(item => item.type === 'service_disruption');
  }

  /**
   * Parse TTC text alerts and return only accessibility issues
   * @param {string} text - Raw text containing alerts
   * @returns {Array} Array of accessibility issue objects
   */
  parseAccessibilityIssues(text) {
    return parseTextAlerts(text).filter(item => item.type === 'accessibility_issue');
  }

  /**
   * Format API alerts as a table
   * @param {Array} alerts - Array of parsed alerts
   */
  displayApiAlertsTable(alerts) {
    formatAlertsTable(alerts);
  }

  /**
   * Format text alerts as tables (separated by type)
   * @param {Array} alerts - Array of parsed alerts
   */
  displayTextAlertsTable(alerts) {
    formatResultsTables(alerts);
  }

  /**
   * Clean HTML entities from text
   * @param {string} text - Text containing HTML entities
   * @returns {string} Cleaned text
   */
  cleanHtml(text) {
    return cleanHtmlEntities(text);
  }
}

// Export the main class and individual functions
export default TTCParser;
export { 
  parseApiAlerts, 
  parseTextAlerts, 
  cleanHtmlEntities,
  formatAlertsTable,
  formatResultsTables
};