import {describe, expect, test} from 'vitest';

import type {DatePartValues} from './types';
import {getDateLocaleMeta, parseDate, partsToUnvalidatedISO8601} from './utils';

test.each([
  [{year: '2024', month: '1', day: '1'}, '2024-01-01'],
  [{year: '1989', month: '10', day: '07'}, '1989-10-07'],
  [{year: '0', month: '1', day: '1'}, '0000-01-01'],
  [{year: '2024', month: '12', day: '31'}, '2024-12-31'],
] satisfies [DatePartValues, string][])(
  'Valid date parts: %s',
  (parts: DatePartValues, expected) => {
    const result = partsToUnvalidatedISO8601(parts);

    expect(result).toBe(expected);
  }
);

test.each([
  [{year: '', month: '', day: ''}, '0000-00-00'],
  [{year: '2025', month: '13', day: '12'}, '2025-13-12'],
  [{year: '0', month: '0', day: '0'}, '0000-00-00'],
  [{year: '0', month: '0', day: '3'}, '0000-00-03'],
  [{year: '2000', month: '11', day: '0'}, '2000-11-00'],
  [{year: '2000', month: '100', day: '300'}, '2000-100-300'],
  [{year: '10000', month: '12', day: '30'}, '10000-12-30'],
] satisfies [DatePartValues, string][])(
  'Invalid date parts: %s',
  (parts: DatePartValues, expected) => {
    const result = partsToUnvalidatedISO8601(parts);

    expect(result).toBe(expected);
  }
);

describe('Parse date validation', () => {
  test.each(['2025-09-01', '2025-9-01', '2025-09-1', '2025-9-1'] satisfies string[])(
    'Valid value',
    () => {
      const result = parseDate('2025-09-01');
      expect(result).not.toBeNull();
    }
  );

  test.each([
    '20',
    '2000-01',
    '2000-13-20',
    '2000-12-32',
    '20-12-2000',
    '12/20/2000',
  ] satisfies string[])('Invalid value: %s', (value: string) => {
    const result = parseDate(value);
    expect(result).toBeNull();
  });

  test('Valid value with meta', () => {
    const meta = getDateLocaleMeta('en');
    const result = parseDate('12/20/2000', meta);
    expect(result).not.toBeNull();
  });

  test.each([
    '20',
    '2000/01',
    '2000-13-20',
    '2000-12-1',
    '2000-12-32',
    '12',
    '12/20',
    '13/20/2000',
    '12/32/2000',
  ] satisfies string[])('Invalid value with meta: %s', (value: string) => {
    const meta = getDateLocaleMeta('en');
    const result = parseDate(value, meta);
    expect(result).toBeNull();
  });
});
