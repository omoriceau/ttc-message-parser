// Type definitions for ttc-alert-parser
// Project: ttc-alert-parser
// Definitions by: ttc-alert-parser

export interface Alert {
  id?: string;
  url?: string;
  line?: string;
  location_start?: string;
  location_end?: string;
  work_type?: string;
  title?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  severity?: string;
  description?: string;
  type?: 'service_disruption' | 'accessibility_issue';
  station?: string;
  equipment_type?: 'Elevator' | 'Escalator';
  equipment_id?: string;
  status?: string;
}

export interface ServiceDisruption extends Alert {
  type: 'service_disruption';
}

export interface AccessibilityIssue extends Alert {
  type: 'accessibility_issue';
  equipment_type: 'Elevator' | 'Escalator';
}

export declare class TTCParser {
  parseApiAlerts(apiResponse: object | string): Alert[];
  parseTextAlerts(text: string): Alert[];
  parseServiceDisruptions(text: string): ServiceDisruption[];
  parseAccessibilityIssues(text: string): AccessibilityIssue[];
  displayApiAlertsTable(alerts: Alert[]): void;
  displayTextAlertsTable(alerts: Alert[]): void;
  cleanHtml(text: string): string;
}

export declare function parseApiAlerts(apiResponse: object | string): Alert[];
export declare function parseTextAlerts(text: string): Alert[];
export declare function parseApiAlertsOnly(apiResponse: object | string): Alert[];
export declare function parseTextAlertsOnly(text: string): Alert[];

export declare namespace formatters {
  function formatAlertsTable(alerts: Alert[]): void;
  function formatResultsTables(alerts: Alert[]): void;
}

export declare namespace utils {
  function containsTimeInfo(text: string): boolean;
  function extractTimes(text: string): string[];
  function cleanHtmlEntities(text: string): string;
}

declare const _default: TTCParser;
export default _default;