import {expect, test} from 'vitest';

import {Separators, getSeparators} from './NumberField';

test.each([
  ['nl', {decimalSeparator: ',', thousandSeparator: '.'}],
  ['en', {decimalSeparator: '.', thousandSeparator: ','}],
] satisfies [string, Separators][])('%s locale separators: %s', (locale, expected) => {
  const result = getSeparators(locale);

  expect(result).toStrictEqual(expected);
});
