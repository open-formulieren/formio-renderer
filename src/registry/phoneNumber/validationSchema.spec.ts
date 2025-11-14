import type {PhoneNumberComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: PhoneNumberComponentSchema = {
  type: 'phoneNumber',
  id: 'phoneNumber',
  key: 'phoneNumber',
  label: 'Phone number',
  inputMask: null,
};

const buildValidationSchema = (component: PhoneNumberComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('phoneNumber component validation', () => {
  test.each([124, false, true, ['array'], null, {object: 'value'}])(
    'does not accept non-string values (value: %s)',
    value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = schema.safeParse(value);

      expect(success).toBe(false);
    }
  );

  test.each([
    [false, ''],
    [false, undefined],
    [true, ''],
    [true, undefined],
  ])('required %s (value: %s)', (required, value) => {
    const component: PhoneNumberComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });

  test('required with custom error message', () => {
    const component: PhoneNumberComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: true},
      errors: {required: 'Custom error message for required'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse(undefined);

    expect(result.error?.errors[0].message).toBe('Custom error message for required');
  });

  test.each(['123456789', '+31 6 11223344', '0031 6 11223344', '06 112 233 44', '06-112-23-44'])(
    'valid formats (value: %s)',
    value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = schema.safeParse(value);

      expect(success).toBe(true);
    }
  );

  test.each([
    ['06-[0-9]+', '06-12345678', true],
    ['06-[0-9]+', '06 12345678', false],
    ['^\\+31.*$', '+31202020', true],
    ['^\\+31.*$', '0202020', false],
  ])('accepts additional pattern %s (value: %s)', (pattern, value, valid) => {
    const component: PhoneNumberComponentSchema = {...BASE_COMPONENT, validate: {pattern}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test('pattern with custom error message', () => {
    const component: PhoneNumberComponentSchema = {
      ...BASE_COMPONENT,
      validate: {pattern: '06-[0-9]+'},
      errors: {pattern: 'Custom error message for pattern'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse('061234567');

    expect(result.error?.errors[0].message).toBe('Custom error message for pattern');
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: PhoneNumberComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync('06-123 456 78');

    expect(success).toBe(valid);
  });
});

describe('phoneNumber component with multiple: true', () => {
  test.each([
    [true, [], false],
    [true, [''], false],
    [true, [undefined], false],
    [true, ['020-12345678'], true],
    [false, [], true],
    [false, [''], true],
    [false, [undefined], true],
  ])('required %s (value: %s)', (required: boolean, value: string[], valid: boolean) => {
    const component: PhoneNumberComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required},
      multiple: true,
      defaultValue: [],
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test('required with custom error message and multiple: true', () => {
    const component: PhoneNumberComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: true},
      multiple: true,
      defaultValue: [],
      errors: {required: 'Custom error message for required with multiple: true'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse([]);

    expect(result.error?.errors[0].message).toBe(
      'Custom error message for required with multiple: true'
    );
  });

  test('individual items are still validated', () => {
    const component: PhoneNumberComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: false},
      multiple: true,
      defaultValue: [],
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(['letters not allowed']);

    expect(success).toBe(false);
  });
});
