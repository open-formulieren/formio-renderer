import type {BsnComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: BsnComponentSchema = {
  type: 'bsn',
  id: 'bsn',
  key: 'bsn',
  label: 'BSN',
  validateOn: 'blur',
  inputMask: '999999999',
};

const buildValidationSchema = (component: BsnComponentSchema) => {
  const schemas = getValidationSchema(component, intl, getRegistryEntry);
  return schemas[component.key];
};

describe('bsn component validation', () => {
  test.each([
    '123', // too short
    123456782, // not a string
    'aaabbbccc', // not digits only
    '0000000000', // too long
    '123456789', // doesn't pass 11 check
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
    const component: BsnComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });
});
