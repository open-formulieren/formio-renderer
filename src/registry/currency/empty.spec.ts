import type {CurrencyComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  // Non-empty state
  [0, false],
  [1, false],
  [-1, false],
])(
  'Number isEmpty compares against defined number with 1 or more characters',
  (valueToTest: number | null | undefined, expected: boolean) => {
    const component: CurrencyComponentSchema = {
      type: 'currency',
      key: 'currency',
      id: 'number',
      label: 'Currency',
      currency: 'EUR',
      allowNegative: true,
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
