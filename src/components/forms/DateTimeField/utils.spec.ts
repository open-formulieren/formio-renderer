import {describe, expect, test} from 'vitest';

import type {DateTimePartValues} from './types';
import {getDateLocaleMeta, parseDateTime, partsToUnvalidatedISO8601} from './utils';

test.each([
  [
    {year: '2024', month: '1', day: '1', hour: '12', minute: '34', second: '00'},
    '2024-01-01T12:34:00',
  ],
  [
    {year: '1989', month: '10', day: '07', hour: '09', minute: '52', second: '54'},
    '1989-10-07T09:52:54',
  ],
  [
    {year: '0', month: '1', day: '1', hour: '01', minute: '02', second: '03'},
    '0000-01-01T01:02:03',
  ],
] satisfies [DateTimePartValues, string][])(
  'Valid datetime parts: %s',
  (parts: DateTimePartValues, expected) => {
    const result = partsToUnvalidatedISO8601(parts);

    expect(result).toBe(expected);
  }
);

test.each([
  [{year: '', month: '', day: '', hour: '', minute: '', second: ''}, '0000-00-00T::'],
  [
    {year: '2025', month: '13', day: '12', hour: '25', minute: '61', second: '61'},
    '2025-13-12T25:61:61',
  ],
  [{year: '0', month: '0', day: '0', hour: '0', minute: '0', second: '0'}, '0000-00-00T0:0:0'],
  [
    {year: '20000', month: '100', day: '300', hour: '200', minute: '400', second: '500'},
    '20000-100-300T200:400:500',
  ],
] satisfies [DateTimePartValues, string][])(
  'Invalid date parts: %s',
  (parts: DateTimePartValues, expected) => {
    const result = partsToUnvalidatedISO8601(parts);

    expect(result).toBe(expected);
  }
);

describe('Parse datetime validation', () => {
  // ISO-8601 strings
  test.each([
    '2025-09-01T12:34:56',
    '2025-9-01T12:34:56',
    '2025-09-1T12:34:56',
    '2025-9-1T12:34:56',
  ] satisfies string[])('Valid value: %s', (value: string) => {
    const result = parseDateTime(value);
    expect(result).not.toBeNull();
  });

  test.each([
    '20',
    '2000-01',
    '2000-13-20',
    '2000-12-32T12:34:56',
    '2000-12-31T12:34:61',
    '2000-12-31T12:34',
    '2000-12-31T::',
    '20-12-2000 12:34:56',
    '12/20/2000 12:34:56',
    '20-12-2000',
    '12/20/2000',
  ] satisfies string[])('Invalid value: %s', (value: string) => {
    const result = parseDateTime(value);
    expect(result).toBeNull();
  });

  test('Valid value with meta', () => {
    const meta = getDateLocaleMeta('en');
    const result = parseDateTime('12/20/2000 12:45', meta);
    // Note: Date takes a month index (0-11)
    expect(result).toEqual(new Date(2000, 11, 20, 12, 45, 0));
  });

  test.each([
    '20',
    '2000/01',
    '2000-13-20',
    '2000-12-1',
    '2000-12-32',
    '2000-12-31T12:34:56',
    '12',
    '12/20',
    '13/20/2000',
    '12/32/2000',
    '12/31/2000',
    '12/31/2000 12',
    '12/31/2000 12:3',
    '12/31/2000 12:61',
    '12/31/2000 25:34',
  ] satisfies string[])('Invalid value with meta: %s', (value: string) => {
    const meta = getDateLocaleMeta('en');
    const result = parseDateTime(value, meta);
    expect(result).toBeNull();
  });
});
