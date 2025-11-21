import type {SignatureComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: SignatureComponentSchema = {
  type: 'signature',
  id: 'signature',
  key: 'signature',
  label: 'Signature',
};

const buildValidationSchema = (component: SignatureComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('signature component validation', () => {
  test.each([124, false, true, ['array'], null, {object: 'value'}, 'random string'])(
    'does not accept non-string or arbitrary string values (value: %s)',
    value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = schema.safeParse(value);

      expect(success).toBe(false);
    }
  );

  test.each([
    [false, ''],
    [false, undefined],
    [true, ''],
    [true, undefined],
  ])('required %s (value: %s)', (required, value) => {
    const component: SignatureComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: SignatureComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync('data:image/png;base64,');

    expect(success).toBe(valid);
  });

  test('required with custom error message', () => {
    const component: SignatureComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: true},
      errors: {required: 'Custom error message for required'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse(undefined);

    expect(result.error?.errors[0].message).toBe('Custom error message for required');
  });
});
