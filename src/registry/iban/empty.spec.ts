import type {IbanComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  ['', true],
  // Non-empty state
  ['test', false],
])(
  'Iban isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string | undefined, expected: boolean) => {
    const component: IbanComponentSchema = {
      type: 'iban',
      key: 'iban',
      id: 'iban',
      label: 'Iban',
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  [[], true],
  [[''], true],
  [['', ''], true],
  [['      '], true],
  [[null], true],
  [[undefined], true],
  // Non-empty state
  [['    foo'], false],
  [['foo    '], false],
  [['foo'], false],
  [['foo', 'bar'], false],
  [['', 'bar'], false],
])(
  'Multiple iban isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string[] | undefined, expected: boolean) => {
    const component: IbanComponentSchema = {
      type: 'iban',
      key: 'iban',
      id: 'iban',
      label: 'Iban',
      multiple: true,
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
