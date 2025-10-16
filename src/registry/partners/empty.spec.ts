import type {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [[], true],
  // Non-empty state
  [[{bsn: '', affixes: '', initials: '', lastName: '', dateOfBirth: ''}], false],
])(
  'Partners isEmpty compares against defined list with 1 or more PartnerDetails',
  (valueToTest: PartnerDetails[] | undefined, expected: boolean) => {
    const component: PartnersComponentSchema = {
      type: 'partners',
      key: 'partners',
      id: 'partners',
      label: 'partners',
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
