import type {TimeComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  ['', true],
  // Non-empty state
  ['00:10:00', false],
  ['0:1:0', false],
])(
  'Timefield isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: undefined | string | string[], expected: boolean) => {
    const component: TimeComponentSchema = {
      type: 'time',
      key: 'time',
      id: 'timefield',
      label: 'timefield',
      inputType: 'text',
      format: 'HH:mm',
      validateOn: 'blur',
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);

test.each([
  // Empty states
  [undefined, true],
  ['', true],
  [[], true],
  [[''], true],
  [['      '], true],
  // Non-empty state
  [['foo'], false],
])(
  'Multiple timefield isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: undefined | string | string[], expected: boolean) => {
    const component: TimeComponentSchema = {
      type: 'time',
      key: 'time',
      id: 'timefield',
      label: 'timefield',
      inputType: 'text',
      format: 'HH:mm',
      validateOn: 'blur',
      multiple: true,
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
