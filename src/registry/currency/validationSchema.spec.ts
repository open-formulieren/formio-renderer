import type {CurrencyComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: CurrencyComponentSchema = {
  type: 'currency',
  id: 'currency',
  key: 'currency',
  currency: 'EUR',
  label: 'Currency',
  validateOn: 'blur',
  validate: {
    min: 5,
    max: 10,
  },
};

const buildValidationSchema = (component: CurrencyComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('currency component validation', () => {
  test.each([5, 5.0, 7.5, 10, 10.0])('accepts values inside min-max range (value: %s)', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each([0, 4.9, 15, 20.1])(
    'does not accept values outside min-max range (value: %s)',
    value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = schema.safeParse(value);

      expect(success).toBe(false);
    }
  );

  test.each([
    [false, null],
    [true, null],
  ])('required %s (value: %s)', (required, value) => {
    const component: CurrencyComponentSchema = {
      ...BASE_COMPONENT,
      validate: {...BASE_COMPONENT.validate, required},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: CurrencyComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync(5.42);

    expect(success).toBe(valid);
  });
});
