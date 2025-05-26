import { expect, test, describe } from 'bun:test';
import { generateQuarterOptions } from '../constants';

describe('generateQuarterOptions', () => {
  test('should generate correct number of quarter options', () => {
    const options = generateQuarterOptions();

    // Should generate 12 quarters (4 from past year + 8 from current and next 2 years)
    expect(options.length).toBe(12);
  });

  test('should generate quarters in correct format', () => {
    const options = generateQuarterOptions();

    // All options should have the correct structure
    options.forEach((option) => {
      expect(option).toHaveProperty('id');
      expect(option).toHaveProperty('name');
      expect(option).toHaveProperty('value');
      expect(option).toHaveProperty('year');
      expect(option).toHaveProperty('quarter');

      // Quarter should be between 1 and 4
      expect(option.quarter).toBeGreaterThanOrEqual(1);
      expect(option.quarter).toBeLessThanOrEqual(4);

      // ID and name should match the pattern
      expect(option.id).toMatch(/^\d{2}Q[1-4]$/);
      expect(option.name).toMatch(/^\d{2}Q[1-4]$/);
      expect(option.value).toMatch(/^\d{4}Q[1-4]$/);
    });
  });

  test('should include quarters from past, present, and future', () => {
    const options = generateQuarterOptions();
    const currentYear = new Date().getFullYear();

    const years = options.map((option) => option.year);
    const uniqueYears = [...new Set(years)];

    // Should include current year - 1, current year, current year + 1, current year + 2
    expect(uniqueYears).toContain(currentYear - 1);
    expect(uniqueYears).toContain(currentYear);
    expect(uniqueYears).toContain(currentYear + 1);
    expect(uniqueYears).toContain(currentYear + 2);
  });

  test('should sort quarters chronologically', () => {
    const options = generateQuarterOptions();

    for (let i = 1; i < options.length; i++) {
      const prev = options[i - 1];
      const curr = options[i];

      // Add null checks for array access
      if (!prev || !curr) {
        throw new Error('Unexpected undefined option in array');
      }

      // Previous option should be chronologically before current
      if (prev.year === curr.year) {
        expect(prev.quarter).toBeLessThan(curr.quarter);
      } else {
        expect(prev.year).toBeLessThan(curr.year);
      }
    }
  });

  test('should generate valid quarter values for API validation', () => {
    const options = generateQuarterOptions();

    // Test that the generated values would pass our API validation
    options.forEach((option) => {
      // Value should be a string less than 7 characters (our API validation rule for 6 chars)
      expect(typeof option.value).toBe('string');
      expect(option.value.length).toBeLessThan(7);
      expect(option.value.length).toBe(6); // Should be exactly 6 characters

      // Value should match the expected format for database storage
      expect(option.value).toMatch(/^\d{4}Q[1-4]$/);
    });
  });
});
