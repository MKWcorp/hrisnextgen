/**
 * Format number dengan separator titik (Indonesian format)
 * @param value - number atau string yang akan diformat
 * @returns string dengan format 1.000.000
 */
export const formatNumber = (value: string | number): string => {
  const numStr = value.toString().replace(/\./g, '');
  if (!numStr || numStr === '') return '';
  const num = Number(numStr);
  if (isNaN(num)) return '';
  return num.toLocaleString('id-ID');
};

/**
 * Parse formatted number kembali ke number
 * @param value - string dengan format 1.000.000
 * @returns number tanpa separator
 */
export const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/\./g, '');
  return Number(cleaned) || 0;
};

/**
 * Format currency IDR
 * @param value - number atau string
 * @returns string dengan format Rp 1.000.000
 */
export const formatCurrency = (value: string | number): string => {
  const formatted = formatNumber(value);
  return formatted ? `Rp ${formatted}` : 'Rp 0';
};

/**
 * Format percentage
 * @param value - number percentage
 * @returns string dengan format 50%
 */
export const formatPercentage = (value: number): string => {
  return `${value}%`;
};

/**
 * Shorten large numbers (1M, 1K, etc)
 * @param value - number
 * @returns string dengan format singkat
 */
export const formatShortNumber = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};
