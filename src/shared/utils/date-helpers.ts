/**
 * Date helper utilities for consistent date formatting
 */

/**
 * Gets today's date in YYYY-MM-DD format
 * Used for default availability queries
 */
export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Parses weekdays string from query params
 * @param weekdaysStr Comma-separated weekday numbers (e.g., "1,3,5")
 * @returns Array of weekday numbers or undefined
 */
export function parseWeekdays(weekdaysStr?: string): number[] | undefined {
  if (!weekdaysStr?.trim()) return undefined;
  
  try {
    return weekdaysStr.split(',').map(Number).filter(n => !isNaN(n) && n >= 0 && n <= 6);
  } catch {
    return undefined;
  }
}