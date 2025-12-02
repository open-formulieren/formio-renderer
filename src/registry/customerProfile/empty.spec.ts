import type {CustomerProfileComponentSchema, CustomerProfileData} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  [[], true],
  [[{address: '', type: 'email'}], true],
  // Non-empty state
  [[{address: 'test@mail.com', type: 'email'}], false],
  [
    [
      {address: '', type: 'email'},
      {address: '+0612345678', type: 'phoneNumber'},
    ],
    false,
  ],
  [[{address: '', type: 'email', preferenceUpdate: 'useOnlyOnce'}], false],
  [[{address: '', type: 'email', preferenceUpdate: 'isNewPreferred'}], false],
])(
  'Profile isEmpty compares against a list with 1 or more DigitalAddress objects ' +
    'with properties with 1 or more characters (excluding the `type` property)',
  (valueToTest: CustomerProfileData | null | undefined, expected: boolean) => {
    const component: CustomerProfileComponentSchema = {
      type: 'customerProfile',
      key: 'customerProfile',
      id: 'customerProfile',
      label: 'Profile',
      shouldUpdateCustomerData: false,
      digitalAddressTypes: ['email', 'phoneNumber'],
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
