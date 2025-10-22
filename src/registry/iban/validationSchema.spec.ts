import type {IbanComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: IbanComponentSchema = {
  type: 'iban',
  id: 'iban',
  key: 'iban',
  label: 'IBAN',
  validateOn: 'blur',
};

const buildValidationSchema = (component: IbanComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async () => undefined,
  });
  return schemas[component.key];
};

describe('IBAN component validation', () => {
  test.each([
    'Just a string',
    2363724524, // Just digits
    'NL90ABNA0417164300', // Check digits (90) should be 91 for this IBAN
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
    const component: IbanComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });
});

describe('IBAN component with multiple: true', () => {
  test.each([
    [true, [], false],
    [true, [''], false],
    [true, [undefined], false],
    [true, ['NL91 ABNA 0417 1643 00'], true],
    [false, [], true],
    [false, [''], true],
    [false, [undefined], true],
  ])('required %s (value: %s)', (required: boolean, value: string[], valid: boolean) => {
    const component: IbanComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required},
      multiple: true,
      defaultValue: [],
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test('individual items are still validated', () => {
    const component: IbanComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: false},
      multiple: true,
      defaultValue: [],
    };
    const schema = buildValidationSchema(component);

    // Check digits (90) should be 91 for this IBAN
    const {success} = schema.safeParse(['NL90ABNA0417164300']);

    expect(success).toBe(false);
  });
});
