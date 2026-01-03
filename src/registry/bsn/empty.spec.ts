import type {BsnComponentSchema} from '@open-formulieren/types';
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
  'Bsn isEmpty compares against defined, non-empty array state of value',
  (valueToTest: string | undefined, expected: boolean) => {
    const component: BsnComponentSchema = {
      type: 'bsn',
      key: 'bsn',
      id: 'bsn',
      label: 'BSN',
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
  // Non-empty state
  [['111222333'], false],
  [['123456782', '111222333'], false],
  [['', '111222333'], false],
])(
  'Multiple bsn isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string[] | undefined, expected: boolean) => {
    const component: BsnComponentSchema = {
      type: 'bsn',
      key: 'bsn',
      id: 'bsn',
      label: 'BSN',
      multiple: true,
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
