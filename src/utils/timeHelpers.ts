import { differenceInMinutes, parseISO, format } from "date-fns";

/**
 * Calculates hours rendered for a single day.
 * Returns 0 if timeOut is missing (still clocked in).
 */
export const calculateDailyHours = (timeIn: string, timeOut?: string): number => {
  if (!timeOut) return 0;
  const start = parseISO(timeIn);
  const end = parseISO(timeOut);
  const minutes = differenceInMinutes(end, start);
  return Math.max(0, minutes / 60);
};

/**
 * Formats a decimal hour (e.g., 7.5) into a readable string (e.g., "7h 30m").
 */
export const formatDuration = (decimalHours: number): string => {
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  return `${h}h ${m}m`;
};

/**
 * Formats an ISO string to a readable local time (e.g., "09:00 AM").
 */
export const formatTime = (isoString?: string): string => {
  if (!isoString) return "--:--";
  return format(parseISO(isoString), "hh:mm a");
};