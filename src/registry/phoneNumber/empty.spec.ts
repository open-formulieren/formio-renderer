import type {PhoneNumberComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '../registry';
import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  ['', true],
  // Non-empty state
  ['0612345678', false],
])(
  'PhoneNumber isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string | undefined, expected: boolean) => {
    const component: PhoneNumberComponentSchema = {
      openForms: {
        translations: {},
      },
      type: 'phoneNumber',
      key: 'phoneNumber',
      id: 'phoneNumber',
      label: 'phoneNumber',
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
  [['    0612345678'], false],
  [['0612345678    '], false],
  [['0612345678'], false],
  [['0612345678', '0612354367'], false],
  [['', '0612354367'], false],
])(
  'Multiple phoneNumber isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string[] | undefined, expected: boolean) => {
    const component: PhoneNumberComponentSchema = {
      openForms: {
        translations: {},
      },
      type: 'phoneNumber',
      key: 'phoneNumber',
      id: 'phoneNumber',
      label: 'phoneNumber',
      multiple: true,
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
