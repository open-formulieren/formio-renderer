import type {AddressData, AddressNLComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  [{}, true],
  [{postcode: '', houseNumber: ''}, true],
  // Non-empty state
  [{postcode: '1234 AB', houseNumber: ''}, false],
  [{postcode: '', houseNumber: '123'}, false],
  [{postcode: '1234 AB', houseNumber: '123'}, false],
  [
    {
      postcode: '',
      houseNumber: '',
      houseNumberAddition: '27',
    },
    false,
  ],
  [
    {
      postcode: '',
      houseNumber: '',
      houseLetter: 'Q',
    },
    false,
  ],
  [
    {
      postcode: '',
      houseNumber: '',
      streetName: 'Qwop',
    },
    false,
  ],
  [
    {
      postcode: '',
      houseNumber: '',
      city: 'Humperthink',
    },
    false,
  ],
])(
  'Radio isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: Partial<AddressData> | null | undefined, expected: boolean) => {
    const component: AddressNLComponentSchema = {
      type: 'addressNL',
      key: 'addressNL',
      id: 'addressNL',
      label: 'addressNL',
      deriveAddress: false,
      layout: 'singleColumn',
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
