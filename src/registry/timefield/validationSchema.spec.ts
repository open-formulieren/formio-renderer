import type {TimeComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: TimeComponentSchema = {
  type: 'time',
  id: 'timefield',
  key: 'timefield',
  label: 'Text field',
  inputType: 'text',
  format: 'HH:mm',
  validateOn: 'blur',
};

const buildValidationSchema = (component: TimeComponentSchema) => {
  const schemas = getValidationSchema(component, intl, getRegistryEntry);
  return schemas[component.key];
};

describe('time component validation', () => {
  test.each([
    undefined,
    '', // formio uses empty strings
  ])('validate.required=false (value: %s)', value => {
    const component: TimeComponentSchema = {...BASE_COMPONENT, validate: {required: false}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each([
    undefined,
    '', // formio uses empty strings
  ])('validate.required=true (value: %s)', value => {
    const component: TimeComponentSchema = {...BASE_COMPONENT, validate: {required: true}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test.each(['24:00', '23:60', '23:59', '1:1', '01:1', '01:01', '1:01', '01:1', 42, 12.34, null])(
    'Invalid date: %s',
    date => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = schema.safeParse(date);

      expect(success).toBe(false);
    }
  );

  test.each(['23:59', '00:00'])('Valid time: %s', time => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(time);

    expect(success).toBe(true);
  });
});
