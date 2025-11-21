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
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('select component validation', () => {
  test.each(['option1', 'option2'])('accepts known values (value: %s)', async value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = await schema.safeParseAsync(value);

    expect(success).toBe(true);
  });

  test('rejects unknown value', async () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = await schema.safeParseAsync('option42');

    expect(success).toBe(false);
  });

  test.each(['', undefined])('allows empty value if not required (value: %s)', async value => {
    const component: SelectComponentSchema = {...BASE_COMPONENT, validate: {required: false}};
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync(value);

    expect(success).toBe(true);
  });

  test.each(['', undefined])('rejects empty value if required (value: %s', async value => {
    const component: SelectComponentSchema = {...BASE_COMPONENT, validate: {required: true}};
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync(value);

    expect(success).toBe(false);
  });

  test('required with custom error message', async () => {
    const component: SelectComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: true},
      errors: {required: 'Custom error message for required'},
    };
    const schema = buildValidationSchema(component);

    const result = await schema.safeParseAsync(undefined);
    expect(result.error?.errors[0].message).toBe('Custom error message for required');
  });

  test('allows empty array for non-required multi-select', async () => {
    const component: SelectComponentSchema = {
      ...BASE_COMPONENT,
      defaultValue: [],
      multiple: true,
      validate: {required: false},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync([]);

    expect(success).toBe(true);
  });

  test('blocks empty array for required multi-select', async () => {
    const component: SelectComponentSchema = {
      ...BASE_COMPONENT,
      defaultValue: [],
      multiple: true,
      validate: {required: true},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync([]);

    expect(success).toBe(false);
  });

  test('accepts size-1 array for required multi-select', async () => {
    const component: SelectComponentSchema = {
      ...BASE_COMPONENT,
      defaultValue: [],
      multiple: true,
      validate: {required: true},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync(['option2']);

    expect(success).toBe(true);
  });

  test.each(['invalid', 0])(
    'validates each member for multi-select against the options (value: %s)',
    async value => {
      const component: SelectComponentSchema = {
        ...BASE_COMPONENT,
        defaultValue: [],
        multiple: true,
      };
      const schema = buildValidationSchema(component);

      const {success} = await schema.safeParseAsync([value]);

      expect(success).toBe(false);
    }
  );

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: SelectComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync('option1');

    expect(success).toBe(valid);
  });

  test('required with custom error message and multiple: true', () => {
    const component: SelectComponentSchema = {
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
});
