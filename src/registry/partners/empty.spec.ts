import type {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '../registry';
import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  [[], true],
  [[{}], true],
  [[{bsn: '', lastName: '', dateOfBirth: ''}], true],
  // Non-empty state
  // One required field filled in
  [[{bsn: '111222333', lastName: '', dateOfBirth: ''}], false],
  [[{bsn: '', lastName: 'Smith', dateOfBirth: ''}], false],
  [[{bsn: '', lastName: '', dateOfBirth: '1980-12-12'}], false],
  // Some required fields filled in
  [[{bsn: '111222333', lastName: 'Smith', dateOfBirth: ''}], false],
  [[{bsn: '111222333', lastName: '', dateOfBirth: '1980-12-12'}], false],
  [[{bsn: '', lastName: 'Smith', dateOfBirth: '1980-12-12'}], false],
  // All required fields filled in
  [[{bsn: '111222333', lastName: 'Smith', dateOfBirth: '1980-12-12'}], false],
  // Only optional fields filled in
  [[{bsn: '', lastName: '', dateOfBirth: '', initials: 'D'}], false],
  [[{bsn: '', lastName: '', dateOfBirth: '', affixes: 'van'}], false],
  [[{bsn: '', lastName: '', dateOfBirth: '', initials: 'D', affixes: 'van'}], false],
])(
  'Partners isEmpty compares against defined list with 1 or more PartnerDetails ' +
    'with properties with 1 or more characters',
  (valueToTest: PartnerDetails[] | undefined, expected: boolean) => {
    const component: PartnersComponentSchema = {
      type: 'partners',
      key: 'partners',
      id: 'partners',
      label: 'partners',
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
