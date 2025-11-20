/**
 * Admin Reports Export Utility
 * Export platform data to CSV for analysis and billing
 */

interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return '';

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Build CSV rows
  const rows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      // Handle special cases
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  // Combine headers and rows
  return [csvHeaders.join(','), ...rows].join('\n');
}

/**
 * Trigger browser download of CSV file
 */
function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export user data to CSV
 */
export function exportUsersToCSV(users: any[], options: ExportOptions = {}) {
  const filename = options.filename || `users-export-${new Date().toISOString().split('T')[0]}.csv`;
  
  // Format user data for export
  const exportData = users.map(user => ({
    'User ID': user.id,
    'Email': user.email,
    'Full Name': user.full_name || '',
    'Is Admin': user.is_admin ? 'Yes' : 'No',
    'Essays Created': user.essay_count || 0,
    'Rubrics Created': user.rubric_count || 0,
    'Students Managed': user.student_count || 0,
    'Created At': new Date(user.created_at).toLocaleString(),
  }));

  const csv = arrayToCSV(exportData);
  downloadCSV(csv, filename);
}

/**
 * Export activity logs to CSV
 */
export function exportActivityLogsToCSV(logs: any[], options: ExportOptions = {}) {
  const filename = options.filename || `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
  
  const exportData = logs.map(log => ({
    'Log ID': log.id,
    'Timestamp': new Date(log.created_at).toLocaleString(),
    'User Email': log.user_email || '',
    'User Name': log.user_name || '',
    'Action Type': log.action_type,
    'Action Details': log.action_details ? JSON.stringify(log.action_details) : '',
    'IP Address': log.ip_address || '',
  }));

  const csv = arrayToCSV(exportData);
  downloadCSV(csv, filename);
}

/**
 * Export platform statistics to CSV
 */
export function exportPlatformStatsToCSV(stats: any, options: ExportOptions = {}) {
  const filename = options.filename || `platform-stats-${new Date().toISOString().split('T')[0]}.csv`;
  
  const exportData = [{
    'Metric': 'Total Users',
    'Value': stats.total_users || 0,
  }, {
    'Metric': 'New Users (30 days)',
    'Value': stats.new_users_30d || 0,
  }, {
    'Metric': 'Total Essays',
    'Value': stats.total_essays || 0,
  }, {
    'Metric': 'Essays (30 days)',
    'Value': stats.essays_30d || 0,
  }, {
    'Metric': 'Essays (7 days)',
    'Value': stats.essays_7d || 0,
  }, {
    'Metric': 'Total Rubrics',
    'Value': stats.total_rubrics || 0,
  }, {
    'Metric': 'Average Score',
    'Value': stats.avg_score ? stats.avg_score.toFixed(2) : 'N/A',
  }];

  const csv = arrayToCSV(exportData);
  downloadCSV(csv, filename);
}

/**
 * Export API usage/cost report
 */
export function exportAPIUsageToCSV(essays: any[], options: ExportOptions = {}) {
  const filename = options.filename || `api-usage-${new Date().toISOString().split('T')[0]}.csv`;
  
  // Estimate costs: ~$0.002 per essay (rough estimate for gpt-3.5-turbo)
  const COST_PER_ESSAY = 0.002;
  
  const exportData = essays.map(essay => ({
    'Essay ID': essay.id,
    'Title': essay.title,
    'Word Count': essay.word_count || 0,
    'Teacher Email': essay.teacher_email || '',
    'Created At': new Date(essay.created_at).toLocaleString(),
    'Estimated Cost': `$${COST_PER_ESSAY.toFixed(4)}`,
  }));

  // Add summary row
  exportData.push({
    'Essay ID': 'TOTAL',
    'Title': `${essays.length} essays`,
    'Word Count': essays.reduce((sum, e) => sum + (e.word_count || 0), 0),
    'Teacher Email': '',
    'Created At': '',
    'Estimated Cost': `$${(essays.length * COST_PER_ESSAY).toFixed(2)}`,
  });

  const csv = arrayToCSV(exportData);
  downloadCSV(csv, filename);
}

/**
 * Export custom data to CSV
 */
export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  const csv = arrayToCSV(data, headers);
  downloadCSV(csv, filename);
}
