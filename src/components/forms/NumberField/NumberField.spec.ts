import {expect, test} from 'vitest';

import {Separators, convertToNumber, getSeparators} from './NumberField';

test.each([
  ['nl', {decimalSeparator: ',', thousandSeparator: '.'}],
  ['en', {decimalSeparator: '.', thousandSeparator: ','}],
] satisfies [string, Separators][])('%s locale separators: %s', (locale, expected) => {
  const result = getSeparators(locale);

  expect(result).toStrictEqual(expected);
});

// Dutch
test.each([
  ['1', 1],
  ['1,5', 1.5],
  ['1000', 1000],
  ['1000,5', 1000.5],
  ['1.000,5', 1000.5],
  ['1,000.5', 1.0005],
  ['', null],
] satisfies [string, number | null][])('Dutch locale conversion: %s -> %s', (value, expected) => {
  const result = convertToNumber(value, 'nl');

  expect(result).toStrictEqual(expected);
});

// English
test.each([
  ['1', 1],
  ['1.5', 1.5],
  ['1000', 1000],
  ['1000.5', 1000.5],
  ['1,000.5', 1000.5],
  ['1.000,5', 1.0005],
  ['', null],
] satisfies [string, number | null][])('English locale conversion: %s -> %s', (value, expected) => {
  const result = convertToNumber(value, 'en');

  expect(result).toStrictEqual(expected);
});
