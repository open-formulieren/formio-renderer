import type {CustomerProfileComponentSchema, CustomerProfileData} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  [{}, true],
  [{email: {}, phoneNumber: {}}, true],
  [{email: {address: ''}, phoneNumber: {}}, true],
  [{email: {}, phoneNumber: {address: ''}}, true],
  [{email: {address: ''}, phoneNumber: {address: ''}}, true],
  // Non-empty state
  [{email: {address: 'test@mail.com'}, phoneNumber: {address: ''}}, false],
  [{email: {address: ''}, phoneNumber: {address: '0612345678'}}, false],
  [{email: {address: 'test@mail.com'}, phoneNumber: {address: '0612345678'}}, false],
  [{email: {address: '', useOnlyOnce: true}, phoneNumber: {address: ''}}, false],
  [{email: {address: '', isNewPreferred: true}, phoneNumber: {address: ''}}, false],
  [{email: {address: ''}, phoneNumber: {address: '', useOnlyOnce: true}}, false],
  [{email: {address: ''}, phoneNumber: {address: '', isNewPreferred: true}}, false],
])(
  'Profile isEmpty compares against defined object with 1 or more DigitalAddress ' +
    'with properties with 1 or more characters',
  (valueToTest: Partial<CustomerProfileData> | null | undefined, expected: boolean) => {
    const component: CustomerProfileComponentSchema = {
      type: 'customerProfile',
      key: 'customerProfile',
      id: 'customerProfile',
      label: 'Profile',
      shouldUpdateCustomerData: false,
      digitalAddressTypes: {
        email: true,
        phoneNumber: true,
      },
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
