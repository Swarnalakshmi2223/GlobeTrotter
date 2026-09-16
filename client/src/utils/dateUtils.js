import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a date string or Date object to a readable string
 * @param {string|Date} date
 * @param {string} fmt - date-fns format string
 */
export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? format(d, fmt) : '—';
  } catch {
    return '—';
  }
};

/**
 * Format a date to short form: Dec 25
 */
export const formatShortDate = (date) => formatDate(date, 'MMM dd');

/**
 * Format a date for input[type=date] value: yyyy-MM-dd
 */
export const toInputDate = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? format(d, 'yyyy-MM-dd') : '';
  } catch {
    return '';
  }
};

/**
 * Calculate number of days between two dates
 */
export const daysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Sort items chronologically by a date field
 */
export const sortByDate = (items, field = 'date') => {
  return [...items].sort((a, b) => new Date(a[field]) - new Date(b[field]));
};

/**
 * Check if a trip is upcoming (starts in the future)
 */
export const isTripUpcoming = (trip) => {
  return new Date(trip.startDate) > new Date();
};

/**
 * Check if a trip is ongoing
 */
export const isTripOngoing = (trip) => {
  const now = new Date();
  return new Date(trip.startDate) <= now && new Date(trip.endDate) >= now;
};

/**
 * Check if a trip is past
 */
export const isTripPast = (trip) => {
  return new Date(trip.endDate) < new Date();
};

/**
 * Get trip status label and class
 */
export const getTripStatus = (trip) => {
  if (isTripOngoing(trip)) return { label: 'Ongoing', cls: 'badge-teal' };
  if (isTripUpcoming(trip)) return { label: 'Upcoming', cls: 'badge-amber' };
  return { label: 'Completed', cls: 'badge-rose' };
};
