import type {EmailComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: EmailComponentSchema = {
  type: 'email',
  id: 'email',
  key: 'email',
  label: 'Email',
  validateOn: 'blur',
};

const buildValidationSchema = (component: EmailComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('email component validation', () => {
  test.each([124, false, true, ['array'], null, {object: 'value'}])(
    'does not accept non-string values (value: %s)',
    value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = schema.safeParse(value);

      expect(success).toBe(false);
    }
  );

  test.each([
    ['foo@example.com', true],
    ['email+with.suffix@some-domain.tld', true],
    ['jimmy', false],
    ['laika@', false],
  ])('validates email pattern (value: %s)', (value, valid) => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test.each([
    [false, ''],
    [false, undefined],
    [true, ''],
    [true, undefined],
  ])('required %s (value: %s)', (required, value) => {
    const component: EmailComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });

  test('required with custom error message', () => {
    const component: EmailComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: true},
      errors: {required: 'Custom error message for required'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse(undefined);

    expect(result.error?.errors[0].message).toBe('Custom error message for required');
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: EmailComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync('foo@example.com');

    expect(success).toBe(valid);
  });
});

describe('email component with multiple: true', () => {
  test.each([
    [true, [], false],
    [true, [''], false],
    [true, [undefined], false],
    [true, ['info@example.com'], true],
    [false, [], true],
    [false, [''], true],
    [false, [undefined], true],
  ])('required %s (value: %s)', (required: boolean, value: string[], valid: boolean) => {
    const component: EmailComponentSchema = {
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
    const component: EmailComponentSchema = {
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
    const component: EmailComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: false},
      multiple: true,
      defaultValue: [],
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(['example.com']); // not a complete email

    expect(success).toBe(false);
  });
});
