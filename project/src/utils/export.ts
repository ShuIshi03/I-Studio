/**
 * Utility functions for exporting data
 */

// Convert data to CSV format
export const convertToCSV = <T extends Record<string, any>>(data: T[]): string => {
  if (data.length === 0) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return headers.map(header => {
      // Ensure proper escaping of fields with commas or quotes
      const value = item[header]?.toString() || '';
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  // Combine header and rows
  return [headerRow, ...rows].join('\n');
};

// Download data as CSV file
export const downloadCSV = (csv: string, filename: string): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Format reservation data for Google Sheets
export const formatForGoogleSheets = (reservations: any[]): Record<string, any>[] => {
  return reservations.map(reservation => ({
    '予約ID': reservation.id,
    '学生ID': reservation.studentId,
    '日付': reservation.date,
    '開始時間': reservation.startTime,
    '終了時間': reservation.endTime,
    '科目': reservation.subject,
    'ステータス': reservation.status,
    '備考': reservation.notes,
    '予約日時': reservation.createdAt
  }));
};