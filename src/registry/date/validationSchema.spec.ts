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

const BASE_DATEPICKER: DateComponentSchema['datePicker'] = {
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

const buildValidationSchema = (component: DateComponentSchema) => {
  const schemas = getValidationSchema(component, intl, getRegistryEntry);
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
});
