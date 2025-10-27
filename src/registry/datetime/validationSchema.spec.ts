import type {DateTimeComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: DateTimeComponentSchema = {
  type: 'datetime',
  id: 'datetime',
  key: 'datetime',
  label: 'Datetime field',
};

const BASE_DATEPICKER: DateTimeComponentSchema['datePicker'] = {
  showWeeks: false,
  startingDay: 0,
  initDate: '',
  minMode: 'day',
  maxMode: 'day',
  yearRows: 0,
  yearColumns: 0,
  minDate: null,
  maxDate: null,
};

const buildValidationSchema = (component: DateTimeComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('datetime component validation', () => {
  test.each([
    undefined,
    '', // formio uses empty strings
  ])('validate.required=false (value: %s)', value => {
    const component: DateTimeComponentSchema = {...BASE_COMPONENT, validate: {required: false}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each([
    undefined,
    '', // formio uses empty strings
  ])('validate.required=true (value: %s)', value => {
    const component: DateTimeComponentSchema = {...BASE_COMPONENT, validate: {required: true}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test.each([
    // Invalid dates
    '2024-10-69T12:34:56',
    '2024-15-10T12:34:56',
    '30-10-2024T12:34:56',
    '10-30-2024T12:34:56',
    '2024/01/01T12:34:56',
    // Invalid times
    '2025-10-08T25:12:34',
    '2025-10-08T22:62:34',
    '2025-10-08T22:33:66',
    42,
    12.34,
    null,
  ])('Invalid datetime: %s', date => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(date);

    expect(success).toBe(false);
  });

  test('Valid datetime', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse('1903-08-12T12:34:56');

    expect(success).toBe(true);
  });

  // Note: datetimes are set like this in the form builder
  test.each([
    ['2024-01-01T00:00', true],
    ['2025-10-08T12:50', true],
    ['2025-10-08T12:52', false],
    ['2030-07-21T00:00', false],
  ])('Minimum date: %s (valid: %s)', (minDate, valid) => {
    const component: DateTimeComponentSchema = {
      ...BASE_COMPONENT,
      datePicker: {...BASE_DATEPICKER, minDate},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse('2025-10-08T12:51:00');

    expect(success).toBe(valid);
  });

  test.each([
    ['2024-01-01T00:00:00', false],
    ['2025-10-08T12:50:00', false],
    ['2025-10-08T12:52:00', true],
    ['2030-07-21T00:00:00', true],
  ])('Maximum date: %s (valid: %s)', (maxDate, valid) => {
    const component: DateTimeComponentSchema = {
      ...BASE_COMPONENT,
      datePicker: {...BASE_DATEPICKER, maxDate},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse('2025-10-08T12:51:00');

    expect(success).toBe(valid);
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: DateTimeComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync('2012-09-21T12:51:00+02:00');

    expect(success).toBe(valid);
  });
});

describe('datetime component with multiple: true', () => {
  test.each([
    [true, [], false],
    [true, [''], false],
    [true, [undefined], false],
    [true, ['2024-01-01T00:00:00'], true],
    [false, [], true],
    [false, [''], true],
    [false, [undefined], true],
  ])('required %s (value: %s)', (required: boolean, value: string[], valid: boolean) => {
    const component: DateTimeComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required},
      multiple: true,
      defaultValue: [],
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test('validates individual items', () => {
    const component: DateTimeComponentSchema = {
      ...BASE_COMPONENT,
      multiple: true,
      defaultValue: [],
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(['2024-01-01T99:33:66']);

    expect(success).toBe(false);
  });
});
