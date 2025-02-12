import type {DatePartValues} from './types';
import {partsToUnvalidatedISO8601} from './utils';

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
