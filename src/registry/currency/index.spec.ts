import {expect, test} from 'vitest';

import {getCurrencySymbol} from './index';

test.each([
  ['nl', '€\u00A0'], // includes a non-breaking space
  ['en', '€'],
] satisfies [string, string][])('%s locale currency symbol: %s', (locale, expected) => {
  const result = getCurrencySymbol('EUR', locale);

  expect(result).toStrictEqual(expected);
});
