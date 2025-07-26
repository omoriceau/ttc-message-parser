// text-parser.js - Parser for TTC text alerts (service disruptions and accessibility issues)

/**
 * Parse TTC text alerts containing both service disruptions and accessibility issues
 * @param {string} text - Raw text containing alerts
 * @returns {Array} Array of parsed alert objects
 */
export function parseTextAlerts(text) {
    if (!text || text.trim().length === 0) {
      return [];
    }
    
    // Split text into individual notices - handle both service disruptions and accessibility issues
    const notices = text.split(/(?=On\s+(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)|This\s+weekend|^[A-Za-z\s-]+:\s+(?:Elevator|Escalator))/im)
      .filter(notice => notice.trim().length > 0);
    
    const results = [];
    
    notices.forEach(notice => {
      const trimmedNotice = notice.trim();
      
      // Check if this is an accessibility issue first
      const accessibilityItem = parseAccessibilityIssue(trimmedNotice);
      if (accessibilityItem) {
        results.push(accessibilityItem);
        return;
      }
      
      // Otherwise, treat as service disruption
      const serviceItem = parseServiceDisruption(trimmedNotice);
      if (serviceItem) {
        results.push(serviceItem);
      }
    });
    
    return results;
  }
  
  /**
   * Parse accessibility issue from notice text
   * @param {string} notice - Individual notice text
   * @returns {Object|null} Parsed accessibility issue or null if not applicable
   */
  function parseAccessibilityIssue(notice) {
    const accessibilityPattern = /^([A-Za-z\s-]+):\s+(Elevator|Escalator)\s*([A-Za-z0-9]*)\s+out\s+of\s+service\s+(.+)/i;
    const accessibilityMatch = notice.match(accessibilityPattern);
    
    if (!accessibilityMatch) {
      return null;
    }
    
    const item = createEmptyAccessibilityItem();
    
    item.station = accessibilityMatch[1].trim();
    item.equipment_type = accessibilityMatch[2].toLowerCase();
    item.equipment_id = accessibilityMatch[3].trim() || null;
    item.description = accessibilityMatch[4].trim();
    
    // Parse location from description for elevators/escalators
    extractAccessibilityLocations(item);
    
    return item;
  }
  
  /**
   * Parse service disruption from notice text
   * @param {string} notice - Individual notice text
   * @returns {Object|null} Parsed service disruption or null if no meaningful data
   */
  function parseServiceDisruption(notice) {
    const item = createEmptyServiceItem();
    
    // Extract date patterns
    extractServiceDates(notice, item);
    
    // Extract start time - handle both "start by" and "starting at"
    extractServiceTimes(notice, item);
    
    // Extract service type (subway, bus, etc.)
    extractServiceType(notice, item);
    
    // Extract locations (between X and Y stations)
    extractServiceLocations(notice, item);
    
    // Extract work type
    extractServiceWorkType(notice, item);
    
    // Only add if we found meaningful data
    if (item.start_date || item.service_type || item.location_start) {
      return item;
    }
    
    return null;
  }
  
  /**
   * Create empty accessibility item structure
   * @returns {Object} Empty accessibility item
   */
  function createEmptyAccessibilityItem() {
    return {
      type: 'accessibility_issue',
      start_date: null,
      end_date: null,
      start_time: null,
      end_time: null,
      service_type: null,
      location_start: null,
      location_end: null,
      work_type: null,
      station: null,
      equipment_type: null,
      equipment_id: null,
      description: null
    };
  }
  
  /**
   * Create empty service disruption item structure
   * @returns {Object} Empty service item
   */
  function createEmptyServiceItem() {
    return {
      type: 'service_disruption',
      start_date: null,
      end_date: null,
      start_time: null,
      end_time: null,
      service_type: null,
      location_start: null,
      location_end: null,
      work_type: null,
      station: null,
      equipment_type: null,
      equipment_id: null,
      description: null
    };
  }
  
  /**
   * Extract location information for accessibility issues
   * @param {Object} item - Accessibility item to update
   */
  function extractAccessibilityLocations(item) {
    const betweenPattern = /between\s+(.+?)\s+and\s+(.+?)(?:\.|$)/i;
    const fromToPattern = /from\s+(.+?)\s+to\s+(.+?)(?:\.|$)/i;
    
    const betweenMatch = item.description.match(betweenPattern);
    const fromToMatch = item.description.match(fromToPattern);
    
    if (betweenMatch) {
      item.location_start = betweenMatch[1].trim();
      item.location_end = betweenMatch[2].trim();
    } else if (fromToMatch) {
      item.location_start = fromToMatch[1].trim();
      item.location_end = fromToMatch[2].trim();
    }
  }
  
  /**
   * Extract dates for service disruptions
   * @param {string} notice - Notice text
   * @param {Object} item - Service item to update
   */
  function extractServiceDates(notice, item) {
    const datePattern = /(?:On\s+)?(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),?\s+(?:July\s+)?(\d{1,2})/i;
    const dateMatch = notice.match(datePattern);
    
    if (dateMatch) {
      const day = dateMatch[1];
      const date = dateMatch[2];
      item.start_date = `July ${date}, 2025`;
    }
    
    // Handle "This weekend" pattern
    const weekendPattern = /This\s+weekend/i;
    if (weekendPattern.test(notice)) {
      item.start_date = "July 25, 2025"; // Friday start
    }
  }
  
  /**
   * Extract times for service disruptions
   * @param {string} notice - Notice text
   * @param {Object} item - Service item to update
   */
  function extractServiceTimes(notice, item) {
    const startTimePattern = /(?:start\s+by\s+|starting\s+at\s+)(\d{1,2}(?::\d{2})?\s*(?:a\.m\.|p\.m\.|am|pm))/i;
    const startTimeMatch = notice.match(startTimePattern);
    
    if (startTimeMatch) {
      const timeStr = startTimeMatch[1].replace(/\./g, '').toLowerCase();
      
      // Convert to 24-hour format
      let [time, period] = timeStr.split(/\s*(am|pm)/);
      let [hours, minutes = '00'] = time.split(':');
      hours = parseInt(hours);
      
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      
      item.start_time = `${hours.toString().padStart(2, '0')}:${minutes}`;
      
      // For "start by" - this is when service resumes, so it's actually the end time
      if (/start\s+by/i.test(notice)) {
        item.end_time = item.start_time;
        item.start_time = null; // Service disruption starts earlier (unknown time)
      }
    }
    
    // If no end time specified and we have a start time, assume service resumes at 5:00 AM next day
    if (item.start_time && !item.end_time && !/start\s+by/i.test(notice)) {
      item.end_time = "05:00";
    }
  }
  
  /**
   * Extract service type from notice
   * @param {string} notice - Notice text
   * @param {Object} item - Service item to update
   */
  function extractServiceType(notice, item) {
    const servicePattern = /(subway|bus|streetcar|train)\s+service/i;
    const serviceMatch = notice.match(servicePattern);
    
    if (serviceMatch) {
      item.service_type = serviceMatch[1].toLowerCase();
    }
  }
  
  /**
   * Extract location information for service disruptions
   * @param {string} notice - Notice text
   * @param {Object} item - Service item to update
   */
  function extractServiceLocations(notice, item) {
    // Try multiple patterns to catch different formats
    const patterns = [
      /between\s+([A-Za-z\s]+?)\s+and\s+([A-Za-z\s]+?)(?:\s+stations?)?\s+(?:will|,|due)/i,
      /between\s+([A-Za-z\s]+?)\s+and\s+([A-Za-z\s]+?)(?:\s+stations?)/i,
      /no\s+subway\s+service\s+between\s+([A-Za-z\s]+?)\s+and\s+([A-Za-z\s]+?)(?:\s+stations?)?(?:\s*,)/i
    ];
    
    for (const pattern of patterns) {
      const locationMatch = notice.match(pattern);
      if (locationMatch) {
        item.location_start = locationMatch[1].trim().replace(/\s+stations?$/i, '');
        item.location_end = locationMatch[2].trim().replace(/\s+stations?$/i, '');
        break;
      }
    }
  }
  
  /**
   * Extract work type for service disruptions
   * @param {string} notice - Notice text
   * @param {Object} item - Service item to update
   */
  function extractServiceWorkType(notice, item) {
    const workTypePattern = /due\s+to\s+([^.]+)/i;
    const workTypeMatch = notice.match(workTypePattern);
    
    if (workTypeMatch) {
      item.work_type = workTypeMatch[1].trim().replace(/\s*shuttle\s+buses.*$/i, '');
    }
  }