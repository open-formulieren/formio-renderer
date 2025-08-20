import type {PhoneNumberComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  ['', true],
  // Non-empty state
  ['0612345678', false],
])(
  'PhoneNumber isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: any, expected: boolean) => {
    const component: PhoneNumberComponentSchema = {
      openForms: {
        translations: {},
      },
      type: 'phoneNumber',
      key: 'phoneNumber',
      id: 'phoneNumber',
      label: 'phoneNumber',
      inputMask: null,
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
  [['    0612345678'], false],
  [['0612345678    '], false],
  [['0612345678'], false],
])(
  'Multiple phoneNumber isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string | string[] | undefined, expected: boolean) => {
    const component: PhoneNumberComponentSchema = {
      openForms: {
        translations: {},
      },
      type: 'phoneNumber',
      key: 'phoneNumber',
      id: 'phoneNumber',
      label: 'phoneNumber',
      inputMask: null,
      multiple: true,
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
