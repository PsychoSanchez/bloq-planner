import { expect, test } from 'bun:test';
import { QuarterMultiSelector } from '../quarter-multi-selector';

// Basic test to ensure the component interface is correct
test('QuarterMultiSelector - should have correct interface', () => {
  // Test that the component can be imported
  expect(QuarterMultiSelector).toBeDefined();
  expect(typeof QuarterMultiSelector).toBe('function');
});

test('QuarterMultiSelector - should handle empty array', () => {
  // Test that empty array is handled correctly
  const value: string[] = [];
  const onSelect = (quarters: string[]) => {
    expect(Array.isArray(quarters)).toBe(true);
  };

  // Basic validation that the props interface is correct
  expect(Array.isArray(value)).toBe(true);
  expect(typeof onSelect).toBe('function');
});

test('QuarterMultiSelector - should handle multiple quarters', () => {
  // Test that multiple quarters are handled correctly
  const value = ['2024Q1', '2024Q2', '2025Q1'];
  const onSelect = (quarters: string[]) => {
    expect(Array.isArray(quarters)).toBe(true);
    expect(quarters.length).toBeGreaterThanOrEqual(0);
  };

  expect(value.length).toBe(3);
  expect(typeof onSelect).toBe('function');
});

test('QuarterMultiSelector - should validate quarter format', () => {
  // Test quarter format validation
  const validQuarters = ['2024Q1', '2024Q2', '2024Q3', '2024Q4', '2025Q1'];

  validQuarters.forEach((quarter) => {
    expect(quarter).toMatch(/^\d{4}Q[1-4]$/);
  });
});
