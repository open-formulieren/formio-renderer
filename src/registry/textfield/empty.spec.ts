import type {TextFieldComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  ['', true],
  // Non-empty state
  ['foo', false],
])(
  'Textfield isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string | undefined, expected: boolean) => {
    const component: TextFieldComponentSchema = {
      type: 'textfield',
      key: 'textfield',
      id: 'textfield',
      label: 'Textfield',
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
  'Multiple textfield isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string[] | undefined, expected: boolean) => {
    const component: TextFieldComponentSchema = {
      type: 'textfield',
      key: 'textfield',
      id: 'textfield',
      label: 'Textfield',
      multiple: true,
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
