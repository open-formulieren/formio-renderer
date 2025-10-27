import type {CheckboxComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: CheckboxComponentSchema = {
  type: 'checkbox',
  id: 'checkbox',
  key: 'checkbox',
  label: 'Checkbox',
  defaultValue: false,
};

const buildValidationSchema = (component: CheckboxComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('checkbox component validation', () => {
  test.each([124, 'false', 'true', ['array'], null, {object: 'value'}])(
    'does not accept non-boolean values (value: %s)',
    async value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = await schema.safeParseAsync(value);

      expect(success).toBe(false);
    }
  );

  test.each([
    [false, false],
    [false, true],
    [true, false],
    [true, undefined],
  ])('required %s (value: %s)', async (required, value) => {
    const component: CheckboxComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync(value);

    expect(success).toBe(!required);
  });

  test('accepts true for required checkboxes', async () => {
    const component: CheckboxComponentSchema = {...BASE_COMPONENT, validate: {required: true}};
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync(true);

    expect(success).toBe(true);
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: CheckboxComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync(false);

    expect(success).toBe(valid);
  });
});
