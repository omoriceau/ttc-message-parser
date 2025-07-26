// api-parser.js - Parser for TTC API alerts
/**
 * Parse TTC API alerts response
 * @param {Object|string} apiResponse - API response object or JSON string
 * @returns {Array} Array of parsed alert objects
 */
export function parseApiAlerts(apiResponse) {
  const alerts = [];
  
  // Handle both JSON string and parsed object
  const data = typeof apiResponse === 'string' ? JSON.parse(apiResponse) : apiResponse;
  const results = data.Results || [];
  
  results.forEach(result => {
    const alert = createEmptyAlert();
    
    // Extract basic info
    alert.id = result.Id;
    alert.url = result.Url;
    
    const html = result.Html;
    
    // Extract line information from route name
    extractLineInfo(html, alert);
    
    // Extract stations from the title
    extractStationInfo(html, alert);
    
    // Extract work type from title
    extractWorkType(html, alert);
    
    // Extract full title
    extractTitle(html, alert);
    
    // Extract dates
    extractDates(html, alert);
    
    // Extract times from title text
    extractTimes(alert);
    
    // Determine more specific work types based on title
    refineWorkType(alert);
    
    // Only add if we have meaningful data
    if (alert.line || alert.location_start || alert.start_date) {
      alerts.push(alert);
    }
  });
  
  return alerts;
}

/**
 * Create an empty alert object with default structure
 * @returns {Object} Empty alert object
 */
function createEmptyAlert() {
  return {
    id: null,
    start_date: null,
    end_date: null,
    start_time: null,
    end_time: null,
    service_type: null,
    line: null,
    location_start: null,
    location_end: null,
    work_type: null,
    disruption_type: 'service',
    title: null,
    url: null
  };
}

/**
 * Extract line information from HTML
 * @param {string} html - HTML content
 * @param {Object} alert - Alert object to populate
 */
function extractLineInfo(html, alert) {
  if (!html) return;
  const linePattern = /line\s+(\d+)\s*\([^)]+\)/i;
  const lineMatch = html.match(linePattern);
  if (lineMatch) {
    alert.line = `Line ${lineMatch[1]}`;
    alert.service_type = 'subway';
  }
}

/**
 * Extract station information from HTML
 * @param {string} html - HTML content
 * @param {Object} alert - Alert object to populate
 */
function extractStationInfo(html, alert) {
  if (!html) return;
  const stationPattern = /([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+?)\s+stations?\s*[–-]/i;
  const stationMatch = html.match(stationPattern);
  if (stationMatch) {
    alert.location_start = stationMatch[1].trim();
    alert.location_end = stationMatch[2].trim();
  }
}

/**
 * Extract work type from HTML
 * @param {string} html - HTML content
 * @param {Object} alert - Alert object to populate
 */
function extractWorkType(html, alert) {
  if (!html) return;
  const workTypePattern = /[–-]\s*([^<]+?)(?:on\s+|starting)/i;
  const workTypeMatch = html.match(workTypePattern);
  if (workTypeMatch) {
    alert.work_type = workTypeMatch[1].trim();
  }
}

/**
 * Extract title from HTML
 * @param {string} html - HTML content
 * @param {Object} alert - Alert object to populate
 */
function extractTitle(html, alert) {
  if (!html) return;
  const titlePattern = /<span class="field-satitle">([^<]+)<\/span>/;
  const titleMatch = html.match(titlePattern);
  if (titleMatch) {
    alert.title = titleMatch[1].trim();
  }
}

/**
 * Extract start and end dates from HTML
 * @param {string} html - HTML content
 * @param {Object} alert - Alert object to populate
 */
function extractDates(html, alert) {
  if (!html) return;
  // Extract start date
  let startDateMatch;
  
  // First try to match dates within ed-start-date field-starteffectivedate span
  const edStartDatePattern = /<span class="ed-start-date field-starteffectivedate">([^<]+)<\/span>/;
  startDateMatch = html.match(edStartDatePattern);
  
  if (startDateMatch) {
    alert.start_date = startDateMatch[1].trim();
  } else {
    // For sa-start-date-label-wrapper, the date appears after the empty span
    const saStartDatePattern = /<span class="sa-start-date-label-wrapper"><\/span>([^<]+)/;
    startDateMatch = html.match(saStartDatePattern);
    
    if (startDateMatch) {
      alert.start_date = startDateMatch[1].trim();
    } else {
      // Fallback: look for any date pattern in the HTML
      const fallbackDatePattern = /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4})/;
      const fallbackMatch = html.match(fallbackDatePattern);
      if (fallbackMatch) {
        alert.start_date = fallbackMatch[1];
      }
    }
  }
  
  // Extract end date
  const endDatePattern = /<span class="field-endeffectivedate">([^<]+)<\/span>/;
  const endDateMatch = html.match(endDatePattern);
  if (endDateMatch) {
    alert.end_date = endDateMatch[1].trim();
  }
}

/**
 * Extract times from alert title
 * @param {Object} alert - Alert object to populate
 */
function extractTimes(alert) {
  const timePattern = /(\d{1,2}(?::\d{2})?\s*(?:a\.m\.|p\.m\.|am|pm))/gi;
  const timeMatches = alert.title ? alert.title.match(timePattern) : null;
  if (timeMatches && timeMatches.length > 0) {
    alert.start_time = timeMatches[0].replace(/\./g, '').toUpperCase();
    if (timeMatches.length > 1) {
      alert.end_time = timeMatches[1].replace(/\./g, '').toUpperCase();
    }
  }
}

/**
 * Refine work type based on title content
 * @param {Object} alert - Alert object to update
 */
function refineWorkType(alert) {
  if (alert.title) {
    const title = alert.title.toLowerCase();
    if (title.includes('early closure') || title.includes('nightly early closure')) {
      alert.work_type = 'early closure';
    } else if (title.includes('late opening')) {
      alert.work_type = 'late opening';
    } else if (title.includes('full weekend closure')) {
      alert.work_type = 'weekend closure';
    } else if (title.includes('full-day closure')) {
      alert.work_type = 'full-day closure';
    } else if (title.includes('early nightly closure')) {
      alert.work_type = 'early nightly closure';
    }
  }
}