/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns current month string in YYYY-MM format (e.g., '2026-08')
 */
export function getCurrentMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
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
