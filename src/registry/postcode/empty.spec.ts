import type {PostcodeComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  ['', true],
  // Non-empty state
  ['1234 AA', false],
])(
  'Postcode isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string | undefined, expected: boolean) => {
    const component: PostcodeComponentSchema = {
      openForms: {
        translations: {},
      },
      type: 'postcode',
      key: 'postcode',
      id: 'postcode',
      label: 'Postcode',
      inputMask: '9999 AA',
      validate: {pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$'},
      validateOn: 'blur',
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
  [['1234AA'], false],
  [['1234 AA'], false],
  [['1234 AA    '], false],
  [['1234 AA', '1234 BB'], false],
  [['', '1234 BB'], false],
])(
  'Multiple Postcode isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string[] | undefined, expected: boolean) => {
    const component: PostcodeComponentSchema = {
      openForms: {
        translations: {},
      },
      type: 'postcode',
      key: 'postcode',
      id: 'postcode',
      label: 'Postcode',
      inputMask: '9999 AA',
      validate: {pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$'},
      validateOn: 'blur',
      multiple: true,
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
