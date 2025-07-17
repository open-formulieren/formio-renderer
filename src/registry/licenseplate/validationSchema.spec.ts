import type {LicensePlateComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: LicensePlateComponentSchema = {
  type: 'licenseplate',
  id: 'licenseplate',
  key: 'licenseplate',
  label: 'License plate',
  validateOn: 'blur',
  validate: {
    pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$',
  },
};

const buildValidationSchema = (component: LicensePlateComponentSchema) => {
  const schemas = getValidationSchema(component, intl, getRegistryEntry);
  return schemas[component.key];
};

describe('license plate component validation', () => {
  test.each([
    'just a string',
    52345352, // Just digits
    'ABCD12', // No hyphens
    'AB CD 12', // Spaces instead of hyphens
    'AAAA-AA-12', // First group too long
  ])('does not accept invalid values (value: %s)', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test.each([
    [false, ''],
    [false, undefined],
    [true, ''],
    [true, undefined],
  ])('required %s (value: %s)', (required, value) => {
    const component: LicensePlateComponentSchema = {
      ...BASE_COMPONENT,
      validate: {...BASE_COMPONENT.validate, required},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });
});
