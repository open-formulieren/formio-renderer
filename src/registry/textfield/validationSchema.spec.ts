import type {TextFieldComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: TextFieldComponentSchema = {
  type: 'textfield',
  id: 'textfield',
  key: 'textfield',
  label: 'Text field',
};

const buildValidationSchema = (component: TextFieldComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('textfield component validation', () => {
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
    const component: TextFieldComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });

  test('required with custom error message', () => {
    const component: TextFieldComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: true},
      errors: {required: 'Custom error message for required'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse(undefined);

    expect(result.error?.errors[0].message).toBe('Custom error message for required');
  });

  test.each([
    [3, 'aaa', true],
    [3, 'all cats are beatiful', false],
    [10, 'short', true],
  ])('max length %d (value: %s)', (maxLength, value, valid) => {
    const component: TextFieldComponentSchema = {
      ...BASE_COMPONENT,
      validate: {maxLength},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test('max length with custom error message', () => {
    const component: TextFieldComponentSchema = {
      ...BASE_COMPONENT,
      validate: {maxLength: 3},
      errors: {maxLength: 'Custom error message for max length'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse('Invalid');

    expect(result.error?.errors[0].message).toBe('Custom error message for max length');
  });

  test.each([
    ['[0-9]+', 'abc13', false],
    ['[0-9]+', '124abc', false],
    ['[0-9]+', '1234', true],
  ])('pattern %s (value: %s)', (pattern, value, valid) => {
    const component: TextFieldComponentSchema = {
      ...BASE_COMPONENT,
      validate: {pattern},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test('pattern with custom error message', () => {
    const component: TextFieldComponentSchema = {
      ...BASE_COMPONENT,
      validate: {pattern: '[0-9]+'},
      errors: {pattern: 'Custom error message for pattern'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse('invalid');

    expect(result.error?.errors[0].message).toBe('Custom error message for pattern');
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: TextFieldComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync('irrelevant');

    expect(success).toBe(valid);
  });
});

describe('textfield with multiple: true', () => {
  test.each([
    [true, [], false],
    [true, [''], false],
    [true, [undefined], false],
    [true, ['non-empty'], true],
    [false, [], true],
    [false, [''], true],
    [false, [undefined], true],
  ])('required %s (value: %s)', (required: boolean, value: string[], valid: boolean) => {
    const component: TextFieldComponentSchema = {
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
    const component: TextFieldComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: true},
      multiple: true,
      defaultValue: [],
      errors: {required: 'Custom error message for required and multiple: true'},
    };

    const schema = buildValidationSchema(component);

    const result = schema.safeParse([]);

    expect(result.error?.errors[0].message).toBe(
      'Custom error message for required and multiple: true'
    );
  });
});
