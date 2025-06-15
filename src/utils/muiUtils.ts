import { SxProps, Theme } from '@mui/material/styles';

// Helper type for props with sx
export interface SxPropObject {
  sx?: SxProps<Theme>;
}

/**
 * Formats a date for license file format
 * @param date The date to format, can be null
 * @returns Formatted date string for license file (dd-mmm-yyyy) or empty string if null
 */
export const formatDateForLicense = (date: Date | null): string => {
  if (!date) return '';
  
  // Format to dd-mmm-yyyy (e.g., 12-jan-2023)
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en', { month: 'short' }).toLowerCase();
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

// Date format for display
export const formatDateForDisplay = (date: Date | null): string => {
  if (!date) return 'Permanent';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Gets the current year and month in YYYY.MM format
 * @returns Current year and month as string (e.g., "2024.12")
 */
export const getCurrentYearMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}.${month}`;
};