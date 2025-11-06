/**
 * Utility functions for exporting data to CSV format
 */

interface CSVRow {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Convert an array of objects to CSV format
 */
export function convertToCSV(data: CSVRow[], headers?: string[]): string {
  if (data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.map(escapeCSVValue).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      return escapeCSVValue(value);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape CSV values (handle commas, quotes, newlines)
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCSV(data: CSVRow[], filename: string, headers?: string[]): void {
  const csvContent = convertToCSV(data, headers);
  downloadCSV(csvContent, filename);
}
