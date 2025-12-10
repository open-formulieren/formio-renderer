import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import getInitialValues from './initialValues';

test('initialValues should return digital addresses for each supported digital address type', () => {
  const component: CustomerProfileComponentSchema = {
    type: 'customerProfile',
    id: 'customerProfile',
    key: 'customerProfile',
    label: 'customerProfile',
    defaultValue: undefined,
    shouldUpdateCustomerData: false,
    digitalAddressTypes: ['email', 'phoneNumber'],
  };

  const initialValues = getInitialValues(component, getRegistryEntry);
  expect(initialValues).toEqual({
    customerProfile: [
      {
        type: 'email',
        address: '',
        preferenceUpdate: 'useOnlyOnce',
      },
      {
        type: 'phoneNumber',
        address: '',
        preferenceUpdate: 'useOnlyOnce',
      },
    ],
  });
});

/**
 * The initialValues function should accept the defaultValue `null`.
 * `null` isn't allowed by the type definition, but its the empty value returned by formio.
 */
test('initialValues should accept defaultValue of `null`', () => {
  const component: CustomerProfileComponentSchema = {
    type: 'customerProfile',
    id: 'customerProfile',
    key: 'customerProfile',
    label: 'customerProfile',
    // @ts-expect-error null isn't allowed by the TypeScript definition,
    // but is the defaultValue that's set by formio.
    defaultValue: null,
    shouldUpdateCustomerData: false,
    digitalAddressTypes: ['email', 'phoneNumber'],
  };

  const initialValues = getInitialValues(component, getRegistryEntry);
  expect(initialValues).toEqual({
    customerProfile: [
      {
        type: 'email',
        address: '',
        preferenceUpdate: 'useOnlyOnce',
      },
      {
        type: 'phoneNumber',
        address: '',
        preferenceUpdate: 'useOnlyOnce',
      },
    ],
  });
});
