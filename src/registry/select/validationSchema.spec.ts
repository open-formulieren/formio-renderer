import type {SelectComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});
const BASE_COMPONENT: SelectComponentSchema = {
  type: 'select',
  id: 'select',
  key: 'select',
  label: 'Select field',
  openForms: {dataSrc: 'manual', translations: {}},
  dataSrc: 'values',
  dataType: 'string',
  data: {
    values: [
      {
        value: 'option1',
        label: 'Option 1',
      },
      {
        value: 'option2',
        label: 'Option 2',
      },
    ],
  },
};

const buildValidationSchema = (component: SelectComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async () => undefined,
  });
  return schemas[component.key];
};

describe('select component validation', () => {
  test.each(['option1', 'option2'])('accepts known values (value: %s)', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test('rejects unknown value', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse('option42');

    expect(success).toBe(false);
  });

  test.each(['', undefined])('allows empty value if not required (value: %s)', value => {
    const component: SelectComponentSchema = {...BASE_COMPONENT, validate: {required: false}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each(['', undefined])('rejects empty value if required (value: %s', value => {
    const component: SelectComponentSchema = {...BASE_COMPONENT, validate: {required: true}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test('allows empty array for non-required multi-select', () => {
    const component: SelectComponentSchema = {
      ...BASE_COMPONENT,
      defaultValue: [],
      multiple: true,
      validate: {required: false},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse([]);

    expect(success).toBe(true);
  });

  test('blocks empty array for required multi-select', () => {
    const component: SelectComponentSchema = {
      ...BASE_COMPONENT,
      defaultValue: [],
      multiple: true,
      validate: {required: true},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse([]);

    expect(success).toBe(false);
  });

  test('accepts size-1 array for required multi-select', () => {
    const component: SelectComponentSchema = {
      ...BASE_COMPONENT,
      defaultValue: [],
      multiple: true,
      validate: {required: true},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(['option2']);

    expect(success).toBe(true);
  });

  test.each(['', 'invalid', 0])(
    'validates each member for multi-select against the options (value: %s)',
    value => {
      const component: SelectComponentSchema = {
        ...BASE_COMPONENT,
        defaultValue: [],
        multiple: true,
      };
      const schema = buildValidationSchema(component);

      const {success} = schema.safeParse([value]);

      expect(success).toBe(false);
    }
  );
});
