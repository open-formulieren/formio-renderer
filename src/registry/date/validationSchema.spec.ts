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

  test('Invalid date', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse('2024-15-69');

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
    const component: DateComponentSchema = {...BASE_COMPONENT, validate: {minDate}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse('2025-02-11');

    expect(success).toBe(valid);
  });

  test.each([
    ['2024-01-01', false],
    ['2030-07-21', true],
  ])('Maximum date: %s (valid: %s)', (maxDate, valid) => {
    const component: DateComponentSchema = {...BASE_COMPONENT, validate: {maxDate}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse('2025-02-11');

    expect(success).toBe(valid);
  });
});
