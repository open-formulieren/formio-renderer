import type {NumberComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  // Non-empty state
  [0, false],
  [1, false],
  [-1, false],
])(
  'Number isEmpty compares against defined number with 1 or more characters',
  (valueToTest: number | undefined, expected: boolean) => {
    const component: NumberComponentSchema = {
      type: 'number',
      key: 'number',
      id: 'number',
      label: 'number',
      allowNegative: true,
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
