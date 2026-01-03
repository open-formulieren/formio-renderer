import type {DateComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: DateComponentSchema = {
  type: 'date',
  id: 'date',
  key: 'date',
  label: 'Date field',
};

const BASE_DATEPICKER: NonNullable<DateComponentSchema['datePicker']> = {
  minDate: null,
  maxDate: null,
};

const buildValidationSchema = (component: DateComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('date component validation', () => {
  test.each([
    undefined,
    '', // formio uses empty strings
  ])('validate.required=false (value: %s)', value => {
    const component: DateComponentSchema = {...BASE_COMPONENT, validate: {required: false}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each([
    undefined,
    '', // formio uses empty strings
  ])('validate.required=true (value: %s)', value => {
    const component: DateComponentSchema = {...BASE_COMPONENT, validate: {required: true}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test('required with custom error message', () => {
    const component: DateComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: true},
      errors: {required: 'Custom error message for required'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse(undefined);

    expect(result.error?.errors[0].message).toBe('Custom error message for required');
  });

  test.each([
    '2024-10-69',
    '2024-15-10',
    '30-10-2024',
    '10-30-2024',
    '2024/01/01',
    42,
    12.34,
    null,
  ])('Invalid date: %s', date => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(date);

    expect(success).toBe(false);
  });

  test('invalid date with custom error message', () => {
    const component: DateComponentSchema = {
      ...BASE_COMPONENT,
      errors: {invalid_date: 'Custom error message for invalid date'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse('2024-10-69');

    expect(result.error?.errors[0].message).toBe('Custom error message for invalid date');
  });

  test('Valid date', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse('1903-08-12');

    expect(success).toBe(true);
  });

  test.each([
    ['2024-01-01', true],
    ['2030-07-21', false],
  ])('Minimum date: %s (valid: %s)', (minDate, valid) => {
    const component: DateComponentSchema = {
      ...BASE_COMPONENT,
      datePicker: {...BASE_DATEPICKER, minDate},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse('2025-02-11');

    expect(success).toBe(valid);
  });

  test('min date with custom error message', () => {
    const component: DateComponentSchema = {
      ...BASE_COMPONENT,
      datePicker: {...BASE_DATEPICKER, minDate: '2024-10-09'},
      errors: {minDate: 'Custom error message for min date'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse('2024-09-09');

    expect(result.error?.errors[0].message).toBe('Custom error message for min date');
  });

  test.each([
    ['2024-01-01', false],
    ['2030-07-21', true],
  ])('Maximum date: %s (valid: %s)', (maxDate, valid) => {
    const component: DateComponentSchema = {
      ...BASE_COMPONENT,
      datePicker: {...BASE_DATEPICKER, maxDate},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse('2025-02-11');

    expect(success).toBe(valid);
  });

  test('max date with custom error message', () => {
    const component: DateComponentSchema = {
      ...BASE_COMPONENT,
      datePicker: {...BASE_DATEPICKER, maxDate: '2024-10-09'},
      errors: {maxDate: 'Custom error message for max date'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse('2024-11-09');

    expect(result.error?.errors[0].message).toBe('Custom error message for max date');
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: DateComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync('2012-09-21');

    expect(success).toBe(valid);
  });
});

describe('date component with multiple: true', () => {
  test.each([
    [true, [], false],
    [true, [''], false],
    [true, [undefined], false],
    [true, ['2025-07-19'], true],
    [false, [], true],
    [false, [''], true],
    [false, [undefined], true],
  ])('required %s (value: %s)', (required: boolean, value: string[], valid: boolean) => {
    const component: DateComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required},
      multiple: true,
      defaultValue: [],
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test('required for multiple with custom error message', () => {
    const component: DateComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: true},
      multiple: true,
      defaultValue: [],
      errors: {required: 'Custom error message for multiple required'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse([]);

    expect(result.error?.errors[0].message).toBe('Custom error message for multiple required');
  });

  test('validates individual items', () => {
    const component: DateComponentSchema = {
      ...BASE_COMPONENT,
      multiple: true,
      defaultValue: [],
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(['2025-44-33']);

    expect(success).toBe(false);
  });
});
