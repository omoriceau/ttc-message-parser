// utils.js - Utility functions for TTC data parsing

/**
 * Check if a string contains time information
 * @param {string} text - Text to check
 * @returns {boolean} True if text contains time information
 */
export function containsTimeInfo(text) {
    if (!text) return false;
    
    const timePattern = /\d{1,2}(?::\d{2})?\s*(?:a\.m\.|p\.m\.|am|pm)/i;
    return timePattern.test(text);
  }
  
  /**
   * Extract all time strings from text
   * @param {string} text - Text to search
   * @returns {Array} Array of time strings found
   */
  export function extractTimes(text) {
    if (!text) return [];
    
    const timePattern = /(\d{1,2}(?::\d{2})?\s*(?:a\.m\.|p\.m\.|am|pm))/gi;
    return text.match(timePattern) || [];
  }
  
  /**
   * Determine service type from context
   * @param {string} text - Text to analyze
   * @returns {string|null} Service type or null
   */
  export function determineServiceType(text) {
    if (!text) return null;
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('subway')) return 'subway';
    if (lowerText.includes('bus')) return 'bus';
    if (lowerText.includes('streetcar')) return 'streetcar';
    if (lowerText.includes('train')) return 'train';
    
    return null;
  }
  
  /**
   * Check if text indicates a weekend disruption
   * @param {string} text - Text to check
   * @returns {boolean} True if weekend disruption
   */
  export function isWeekendDisruption(text) {
    if (!text) return false;
    
    const weekendPattern = /(?:this\s+weekend|saturday|sunday|weekend)/i;
    return weekendPattern.test(text);
  }

  /**
   * Clean HTML entities from text
   * @param {string} text - Text containing HTML entities
   * @returns {string} Cleaned text
   */
  export function cleanHtmlEntities(text) {
    const entities = {
      '&nbsp;': ' ',
      '&#8211;': '–',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    };
    
    return text.replace(/&[^;]+;/g, match => entities[match] || match);
  }
  
  /**
   * Convert 12-hour time format to 24-hour format
   * @param {string} timeStr - Time string in 12-hour format (e.g., "11 p.m.")
   * @returns {string} Time in 24-hour format (e.g., "23:00")
   */
  export function convertTo24Hour(timeStr) {
    const cleanTime = timeStr.replace(/\./g, '').toLowerCase();
    let [time, period] = cleanTime.split(/\s*(am|pm)/);
    let [hours, minutes = '00'] = time.split(':');
    hours = parseInt(hours);
    
    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  /**
   * Parse date string and return standardized format
   * @param {string} dateStr - Date string to parse
   * @returns {string|null} Standardized date string or null if invalid
   */
  export function standardizeDate(dateStr) {
    if (!dateStr) return null;
    
    // Handle common date formats
    const datePattern = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})/i;
    const match = dateStr.match(datePattern);
    
    if (match) {
      return `${match[1]} ${match[2]}, ${match[3]}`;
    }
    
    return dateStr.trim();
  }
  
  /**
   * Extract line number from various line name formats
   * @param {string} lineName - Line name string
   * @returns {string|null} Formatted line name or null
   */
  export function extractLineNumber(lineName) {
    if (!lineName) return null;
    
    const linePattern = /line\s+(\d+)/i;
    const match = lineName.match(linePattern);
    
    if (match) {
      return `Line ${match[1]}`;
    }
    
    return lineName;
  }
  
  /**
   * Validate and clean station names
   * @param {string} stationName - Station name to clean
   * @returns {string|null} Cleaned station name or null
   */
  export function cleanStationName(stationName) {
    if (!stationName) return null;
    
    return stationName
      .trim()
      .replace(/\s+stations?$/i, '') // Remove trailing "station" or "stations"
      .replace(/\s+/g, ' '); // Normalize whitespace
  }
  