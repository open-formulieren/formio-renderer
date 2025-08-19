import type {IbanComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  ['', true],
  // Non-empty state
  ['test', false],
])(
  'Iban isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: any, expected: boolean) => {
    const component: IbanComponentSchema = {
      type: 'iban',
      key: 'iban',
      id: 'iban',
      label: 'Iban',
      validateOn: 'blur',
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
  [['    foo'], false],
  [['foo    '], false],
  [['foo'], false],
])(
  'Multiple iban isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: any, expected: boolean) => {
    const component: IbanComponentSchema = {
      type: 'iban',
      key: 'iban',
      id: 'iban',
      label: 'Iban',
      validateOn: 'blur',
      multiple: true,
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
