import {expect, test} from 'vitest';

import type {Separators} from './NumberField';
import {getSeparators} from './NumberField';

test.each([
  ['nl', {decimalSeparator: ',', thousandSeparator: '.'}],
  ['en', {decimalSeparator: '.', thousandSeparator: ','}],
] satisfies [string, Separators][])('%s locale separators: %s', (locale, expected) => {
  const result = getSeparators(locale);

  expect(result).toStrictEqual(expected);
});
