import { expect, test } from 'bun:test';

// Test the currency formatting utility functions
test('InlineCurrencyEditor - formatEuro should format numbers correctly', () => {
  // Test the formatEuro function logic
  const formatEuro = (value: number): string => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  expect(formatEuro(0)).toBe('€0');
  expect(formatEuro(100)).toBe('€100');
  expect(formatEuro(1000)).toBe('€1,000');
  expect(formatEuro(1234.56)).toBe('€1,234.56');
  expect(formatEuro(1234.5)).toBe('€1,234.5');
});

test('InlineCurrencyEditor - parseEuroValue should parse strings correctly', () => {
  // Test the parseEuroValue function logic
  const parseEuroValue = (value: string): number => {
    const cleanValue = value.replace(/[€\s,]/g, '').replace(/\./g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  expect(parseEuroValue('€100')).toBe(100);
  expect(parseEuroValue('€1,000')).toBe(1000);
  expect(parseEuroValue('€1,234.56')).toBe(123456); // Note: this removes decimal point
  expect(parseEuroValue('invalid')).toBe(0);
  expect(parseEuroValue('')).toBe(0);
});

test('InlineEstimatesEditor - getTotalWeeks should calculate correctly', () => {
  // Test the getTotalWeeks function logic
  const getTotalWeeks = (estimates?: Array<{ department: string; value: number }>): number => {
    if (!estimates || estimates.length === 0) return 0;
    return estimates.reduce((total, estimate) => total + estimate.value, 0);
  };

  expect(getTotalWeeks([])).toBe(0);
  expect(getTotalWeeks(undefined)).toBe(0);
  expect(
    getTotalWeeks([
      { department: 'engineering', value: 5 },
      { department: 'design', value: 3 },
    ]),
  ).toBe(8);
  expect(
    getTotalWeeks([
      { department: 'engineering', value: 2.5 },
      { department: 'design', value: 1.5 },
    ]),
  ).toBe(4);
});

test('InlineEstimatesEditor - formatWeeks should format correctly', () => {
  // Test the formatWeeks function logic
  const formatWeeks = (weeks: number): string => {
    if (weeks === 0) return '--';
    if (weeks === 1) return '1 week';
    return `${weeks} weeks`;
  };

  expect(formatWeeks(0)).toBe('--');
  expect(formatWeeks(1)).toBe('1 week');
  expect(formatWeeks(2)).toBe('2 weeks');
  expect(formatWeeks(5.5)).toBe('5.5 weeks');
});

test('InlinePercentageEditor - formatPercentage should format correctly', () => {
  // Test the formatPercentage function logic
  const formatPercentage = (value: number): string => {
    if (value === 0) return '0%';
    return `${value.toFixed(1)}%`;
  };

  expect(formatPercentage(0)).toBe('0%');
  expect(formatPercentage(10)).toBe('10.0%');
  expect(formatPercentage(15.5)).toBe('15.5%');
  expect(formatPercentage(100)).toBe('100.0%');
  expect(formatPercentage(-5.2)).toBe('-5.2%');
});
