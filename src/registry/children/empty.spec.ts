import type {ChildDetails, ChildrenComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  [[], true],
  [[{}], true],
  [[{bsn: '', firstNames: '', dateOfBirth: ''}], true],
  // Non-empty state
  // One required field filled in
  [[{bsn: '111222333', firstNames: '', dateOfBirth: ''}], false],
  [[{bsn: '', firstNames: 'Joe', dateOfBirth: ''}], false],
  [[{bsn: '', firstNames: '', dateOfBirth: '1980-12-12'}], false],
  // Some required fields filled in
  [[{bsn: '111222333', firstNames: 'Joe', dateOfBirth: ''}], false],
  [[{bsn: '111222333', firstNames: '', dateOfBirth: '1980-12-12'}], false],
  [[{bsn: '', firstNames: 'Joe', dateOfBirth: '1980-12-12'}], false],
  // All required fields filled in
  [[{bsn: '111222333', firstNames: 'Joe', dateOfBirth: '1980-12-12'}], false],
])(
  'Children isEmpty compares against defined list with 1 or more ChildDetails ' +
    'with properties with 1 or more characters',
  (valueToTest: ChildDetails[] | undefined, expected: boolean) => {
    const component: ChildrenComponentSchema = {
      type: 'children',
      key: 'children',
      id: 'children',
      label: 'children',
      enableSelection: false,
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
