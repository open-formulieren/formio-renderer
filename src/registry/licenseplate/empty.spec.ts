import type {LicensePlateComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '../registry';
import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  ['', true],
  // Non-empty state
  ['aa-aa-aa', false],
])(
  'Licenseplate isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string | undefined, expected: boolean) => {
    const component: LicensePlateComponentSchema = {
      openForms: {
        translations: {},
      },
      type: 'licenseplate',
      key: 'licenseplate',
      id: 'licenseplate',
      label: 'Licenseplate',
      validate: {
        pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$',
      },
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
  [[undefined], true],
  [[null], true],
  // Non-empty state
  [['    aa-aa-aa'], false],
  [['aa-aa-aa    '], false],
  [['aa-aa-aa'], false],
  [['aa-aa-aa', 'bb-bb-bb'], false],
  [['', 'bb-bb-bb'], false],
])(
  'Multiple licenseplate isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string[] | undefined, expected: boolean) => {
    const component: LicensePlateComponentSchema = {
      openForms: {
        translations: {},
      },
      type: 'licenseplate',
      key: 'licenseplate',
      id: 'licenseplate',
      label: 'Licenseplate',
      validate: {
        pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$',
      },
      multiple: true,
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
