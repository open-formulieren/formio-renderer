import type {RadioComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});
const BASE_COMPONENT: RadioComponentSchema = {
  type: 'radio',
  id: 'radio',
  key: 'radio',
  label: 'Radio field',
  openForms: {dataSrc: 'manual', translations: {}},
  defaultValue: null,
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
};

const buildValidationSchema = (component: RadioComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('radio component validation', () => {
  test.each(['option1', 'option2'])('accepts known values (value: %s)', async value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = await schema.safeParseAsync(value);

    expect(success).toBe(true);
  });

  test('rejects unknown value', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse('option42');

    expect(success).toBe(false);
  });

  // formio reference has defaultValue: null but the submission value turns into an
  // empty string
  test.each(['', null, undefined])(
    'allows empty value if not required (value: %s)',
    async value => {
      const component: RadioComponentSchema = {...BASE_COMPONENT, validate: {required: false}};
      const schema = buildValidationSchema(component);

      const {success} = await schema.safeParseAsync(value);

      expect(success).toBe(true);
    }
  );

  test('required with custom error message', async () => {
    const component: RadioComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: true},
      errors: {required: 'Custom error message for required'},
    };
    const schema = buildValidationSchema(component);

    const result = await schema.safeParseAsync('');

    expect(result.error?.errors[0].message).toBe('Custom error message for required');
  });

  test.each(['', null, undefined])('rejects empty value if required (value: %s', async value => {
    const component: RadioComponentSchema = {...BASE_COMPONENT, validate: {required: true}};
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync(value);

    expect(success).toBe(false);
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: RadioComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync('option2');

    expect(success).toBe(valid);
  });
});
