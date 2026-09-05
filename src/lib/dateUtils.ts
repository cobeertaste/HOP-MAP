/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Metrics start strictly in August 2026 (2026-08).
 * Historical data prior to this month is not tracked and should not be displayed or dispatched.
 */
export const METRICS_START_MONTH = '2026-08';

/**
 * Returns current month string in YYYY-MM format (e.g., '2026-09')
 */
export function getCurrentMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Returns previous month key in YYYY-MM format
 */
export function getPreviousMonthKey(date: Date = new Date()): string {
  const prevDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const y = prevDate.getFullYear();
  const m = String(prevDate.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Returns next month key in YYYY-MM format (e.g., '2026-09' -> '2026-10')
 */
export function getNextMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10); // 1-12
  const nextDate = new Date(y, m, 1); // 1st of next month
  const nextY = nextDate.getFullYear();
  const nextM = String(nextDate.getMonth() + 1).padStart(2, '0');
  return `${nextY}-${nextM}`;
}

/**
 * Format month key to human friendly string in Portuguese
 */
export function getMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mIndex = parseInt(monthStr, 10) - 1;
  return `${monthNames[mIndex] || monthStr} de ${yearStr}`;
}

/**
 * Returns the exact scheduled auto-dispatch date label for a given month's metrics.
 * E.g., for '2026-08' -> "1 de Setembro de 2026"
 * E.g., for '2026-09' -> "1 de Outubro de 2026"
 */
export function getDispatchDateLabel(monthKey: string): string {
  const nextMonthKey = getNextMonthKey(monthKey);
  const [yearStr, monthStr] = nextMonthKey.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mIndex = parseInt(monthStr, 10) - 1;
  return `1 de ${monthNames[mIndex] || monthStr} de ${yearStr}`;
}

/**
 * Checks if a month is already completed (i.e. strictly earlier than current month)
 */
export function isMonthCompleted(monthKey: string, referenceDate: Date = new Date()): boolean {
  return monthKey < getCurrentMonthKey(referenceDate);
}

/**
 * Returns all available report months from the current month back to METRICS_START_MONTH (2026-08).
 * Months prior to August 2026 are never returned.
 */
export function getAvailableReportMonths(referenceDate: Date = new Date()): Array<{
  key: string;
  label: string;
  isCurrent: boolean;
  isComplete: boolean;
  dispatchDateLabel: string;
}> {
  const options: Array<{
    key: string;
    label: string;
    isCurrent: boolean;
    isComplete: boolean;
    dispatchDateLabel: string;
  }> = [];

  const currentKey = getCurrentMonthKey(referenceDate);
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-indexed (8 is Sept)

  const [startYearStr, startMonthStr] = METRICS_START_MONTH.split('-');
  const startYear = parseInt(startYearStr, 10);
  const startMonth = parseInt(startMonthStr, 10) - 1; // 0-indexed (7 is Aug)

  let y = currentYear;
  let m = currentMonth;

  while (y > startYear || (y === startYear && m >= startMonth)) {
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    const isCurrent = key === currentKey;
    options.push({
      key,
      label: getMonthLabel(key),
      isCurrent,
      isComplete: !isCurrent,
      dispatchDateLabel: getDispatchDateLabel(key)
    });
    m--;
    if (m < 0) {
      m = 11;
      y--;
    }
  }

  // Fallback if current date is before start date
  if (options.length === 0) {
    options.push({
      key: METRICS_START_MONTH,
      label: getMonthLabel(METRICS_START_MONTH),
      isCurrent: true,
      isComplete: false,
      dispatchDateLabel: getDispatchDateLabel(METRICS_START_MONTH)
    });
  }

  return options;
}
