import type {DateComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  ['', true],
  // Non-empty state
  ['test', false],
])(
  'Date isEmpty compares against defined, non-empty array state of value',
  (valueToTest: any, expected: boolean) => {
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
  [null, true],
  [[], true],
  [[''], true],
  [['      '], true],
  // Non-empty state
  [['    foo'], false],
  [['foo    '], false],
  [['foo'], false],
])(
  'Multiple date isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: any, expected: boolean) => {
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
