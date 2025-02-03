import type {DatePartValues} from './types';
import {partsToISO8601} from './utils';

test.each([
  {year: '2024', month: '1', day: '1'},
  {year: '1989', month: '10', day: '07'},
  {year: '0', month: '1', day: '1'},
  {year: '2024', month: '12', day: '31'},
] satisfies DatePartValues[])('Valid date parts: %s', (parts: DatePartValues) => {
  const result = partsToISO8601(parts);

  expect(result).not.toBeNull();
});

test.each([
  {year: '', month: '', day: ''},
  {year: '2025', month: '13', day: '12'},
  {year: '0', month: '0', day: '0'},
  {year: '0', month: '0', day: '3'},
  {year: '2000', month: '11', day: '0'},
  {year: '2000', month: '100', day: '300'},
  // XXX: we currently don't support the extended year format.
  {year: '10000', month: '12', day: '30'},
] satisfies DatePartValues[])('Invalid date parts: %s', (parts: DatePartValues) => {
  const result = partsToISO8601(parts);

  expect(result).toBeNull();
});
