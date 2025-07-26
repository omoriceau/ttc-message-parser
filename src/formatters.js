/**
 * Formatters for TTC alert and message data
 * Provides various output formats for parsed TTC data
 */

/**
 * Format API alerts in a table format
 * @param {Array} alerts - Array of parsed API alerts
 */
export function formatAlertsTable(alerts) {
  if (!alerts || alerts.length === 0) {
    console.log('\nNo alerts to display.');
    return;
  }

  console.log('\nFormatted TTC Alert Results:');
  console.log('─'.repeat(160));
  console.log('ID'.padEnd(8) + 'Line'.padEnd(8) + 'Severity'.padEnd(12) + 'Title'.padEnd(60) + 'Description');
  console.log('─'.repeat(160));
  
  alerts.forEach(alert => {
    const shortId = alert.id ? alert.id.substring(0, 8) : 'N/A';
    console.log(
      shortId.padEnd(8) +
      (alert.line || 'N/A').padEnd(8) +
      (alert.severity || 'N/A').padEnd(12) +
      (alert.title || 'N/A').substring(0, 58).padEnd(60) +
      (alert.description || 'N/A').substring(0, 80)
    );
  });
  
  console.log('─'.repeat(160));
  console.log(`Total alerts: ${alerts.length}`);
}

/**
 * Format parsed results in table format
 * @param {Array} data - Array of parsed text alerts
 */
export function formatResultsTables(data) {
  if (!data || data.length === 0) {
    console.log('\nNo data to display.');
    return;
  }

  const serviceDisruptions = data.filter(item => item.type === 'service_disruption');
  const accessibilityIssues = data.filter(item => item.type === 'accessibility_issue');
  
  if (serviceDisruptions.length > 0) {
    formatServiceDisruptionsTable(serviceDisruptions);
  }
  
  if (accessibilityIssues.length > 0) {
    formatAccessibilityIssuesTable(accessibilityIssues);
  }
}

/**
 * Format service disruptions in a table
 * @param {Array} serviceDisruptions - Array of service disruption objects
 */
function formatServiceDisruptionsTable(serviceDisruptions) {
  console.log('\n=== SERVICE DISRUPTIONS ===');
  console.log('─'.repeat(140));
  console.log('Date'.padEnd(15) + 'Time'.padEnd(12) + 'Locations'.padEnd(35) + 'Service'.padEnd(10) + 'Work Type'.padEnd(25) + 'Status');
  console.log('─'.repeat(140));
  
  serviceDisruptions.forEach(disruption => {
    const locations = disruption.location_start && disruption.location_end 
      ? `${disruption.location_start} to ${disruption.location_end}`
      : (disruption.location_start || disruption.location_end || 'N/A');
    
    const timeInfo = disruption.start_time && disruption.end_time
      ? `${disruption.start_time}-${disruption.end_time}`
      : (disruption.start_time || disruption.end_time || 'N/A');
    
    console.log(
      (disruption.start_date || 'N/A').substring(0, 13).padEnd(15) +
      timeInfo.substring(0, 10).padEnd(12) +
      locations.substring(0, 33).padEnd(35) +
      (disruption.service_type || 'N/A').substring(0, 8).padEnd(10) +
      (disruption.work_type || 'N/A').substring(0, 23).padEnd(25) +
      'Active'
    );
  });
  
  console.log('─'.repeat(140));
}

/**
 * Format accessibility issues in a table
 * @param {Array} accessibilityIssues - Array of accessibility issue objects
 */
function formatAccessibilityIssuesTable(accessibilityIssues) {
  console.log('\n=== ACCESSIBILITY ISSUES ===');
  console.log('─'.repeat(130));
  console.log('Station'.padEnd(20) + 'Equipment'.padEnd(15) + 'ID'.padEnd(8) + 'Location'.padEnd(40) + 'Status');
  console.log('─'.repeat(130));
  
  accessibilityIssues.forEach(issue => {
    const location = issue.location_start && issue.location_end 
      ? `${issue.location_start} to ${issue.location_end}`
      : (issue.location_start || issue.location_end || 'N/A');
    
    console.log(
      (issue.station || 'N/A').padEnd(20) +
      (issue.equipment_type || 'N/A').padEnd(15) +
      (issue.equipment_id || 'N/A').padEnd(8) +
      location.substring(0, 38).padEnd(40) +
      'Out of Service'
    );
  });
  
  console.log('─'.repeat(130));
}

/**
 * Format data as JSON with a title
 * @param {Array|Object} data - Data to format
 * @param {string} title - Title for the output
 */
export function formatAsJSON(data, title) {
  console.log(`\n${title}:`);
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Format a summary of parsed data
 * @param {Array} data - Parsed data array
 */
export function formatSummary(data) {
  if (!data || data.length === 0) {
    console.log('\n=== PARSING SUMMARY ===');
    console.log('No data to summarize.');
    return;
  }

  const serviceDisruptions = data.filter(item => item.type === 'service_disruption');
  const accessibilityIssues = data.filter(item => item.type === 'accessibility_issue');
  const apiAlerts = data.filter(item => !item.type); // API alerts don't have type field
  
  console.log('\n=== PARSING SUMMARY ===');
  console.log(`Total items parsed: ${data.length}`);
  console.log(`Service disruptions: ${serviceDisruptions.length}`);
  console.log(`Accessibility issues: ${accessibilityIssues.length}`);
  console.log(`API alerts: ${apiAlerts.length}`);
  
  // Show line breakdown for service disruptions
  if (serviceDisruptions.length > 0) {
    const lineBreakdown = {};
    serviceDisruptions.forEach(disruption => {
      const line = disruption.line || 'Unknown';
      lineBreakdown[line] = (lineBreakdown[line] || 0) + 1;
    });
    
    console.log('\nService disruptions by line:');
    Object.entries(lineBreakdown).forEach(([line, count]) => {
      console.log(`  ${line}: ${count}`);
    });
  }
  
  // Show station breakdown for accessibility issues
  if (accessibilityIssues.length > 0) {
    const stationBreakdown = {};
    accessibilityIssues.forEach(issue => {
      const station = issue.station || 'Unknown';
      stationBreakdown[station] = (stationBreakdown[station] || 0) + 1;
    });
    
    console.log('\nAccessibility issues by station:');
    Object.entries(stationBreakdown).forEach(([station, count]) => {
      console.log(`  ${station}: ${count}`);
    });
  }
}

/**
 * Format data for CSV export
 * @param {Array} data - Data to format
 * @param {string} type - Type of data ('alerts', 'disruptions', 'accessibility')
 * @returns {string} CSV formatted string
 */
export function formatAsCSV(data, type = 'alerts') {
  if (!data || data.length === 0) {
    return '';
  }

  let headers = [];
  let rows = [];

  switch (type) {
    case 'alerts':
      headers = ['ID', 'Line', 'Severity', 'Title', 'Description', 'Date'];
      rows = data.map(alert => [
        alert.id || '',
        alert.line || '',
        alert.severity || '',
        alert.title || '',
        alert.description || '',
        alert.date || ''
      ]);
      break;
      
    case 'disruptions':
      headers = ['Line', 'Stations', 'Description', 'Duration', 'Type'];
      rows = data.map(disruption => [
        disruption.line || '',
        Array.isArray(disruption.stations) ? disruption.stations.join('; ') : (disruption.stations || ''),
        disruption.description || '',
        disruption.duration || '',
        disruption.type || ''
      ]);
      break;
      
    case 'accessibility':
      headers = ['Station', 'Issue Type', 'Description', 'Status', 'Date'];
      rows = data.map(issue => [
        issue.station || '',
        issue.issueType || '',
        issue.description || '',
        issue.status || '',
        issue.date || ''
      ]);
      break;
      
    default:
      headers = Object.keys(data[0] || {});
      rows = data.map(item => headers.map(header => item[header] || ''));
  }

  // Escape CSV values that contain commas or quotes
  const escapeCSV = (value) => {
    if (typeof value !== 'string') value = String(value);
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvHeaders = headers.map(escapeCSV).join(',');
  const csvRows = rows.map(row => row.map(escapeCSV).join(','));
  
  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Format data for HTML table
 * @param {Array} data - Data to format
 * @param {string} title - Table title
 * @returns {string} HTML table string
 */
export function formatAsHTML(data, title = 'TTC Data') {
  if (!data || data.length === 0) {
    return `<h2>${title}</h2><p>No data available.</p>`;
  }

  const headers = Object.keys(data[0]);
  
  let html = `<h2>${title}</h2>\n<table border="1" cellpadding="5" cellspacing="0">\n`;
  html += '  <thead>\n    <tr>\n';
  
  headers.forEach(header => {
    html += `      <th>${header}</th>\n`;
  });
  
  html += '    </tr>\n  </thead>\n  <tbody>\n';
  
  data.forEach(item => {
    html += '    <tr>\n';
    headers.forEach(header => {
      const value = item[header] || '';
      html += `      <td>${String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>\n`;
    });
    html += '    </tr>\n';
  });
  
  html += '  </tbody>\n</table>';
  
  return html;
}