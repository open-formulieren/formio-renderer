import type {DateComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  ['', true],
  // Non-empty state
  ['1970-01-01', false],
])(
  'Date isEmpty compares against defined, non-empty array state of value',
  (valueToTest: string | undefined, expected: boolean) => {
    const component: DateComponentSchema = {
      type: 'date',
      key: 'date',
      id: 'date',
      label: 'date',
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);

test.each([
  // Empty states
  [undefined, true],
  [[], true],
  [[''], true],
  [['      '], true],
  // Non-empty state
  [['1970-01-01'], false],
])(
  'Multiple date isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string[] | undefined, expected: boolean) => {
    const component: DateComponentSchema = {
      type: 'date',
      key: 'date',
      id: 'date',
      label: 'date',
      multiple: true,
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
