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
    validatePlugins: async () => undefined,
  });
  return schemas[component.key];
};

describe('checkbox component validation', () => {
  test.each([124, 'false', 'true', ['array'], null, {object: 'value'}])(
    'does not accept non-boolean values (value: %s)',
    value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = schema.safeParse(value);

      expect(success).toBe(false);
    }
  );

  test.each([
    [false, false],
    [false, true],
    [true, false],
    [true, undefined],
  ])('required %s (value: %s)', (required, value) => {
    const component: CheckboxComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });

  test('accepts true for required checkboxes', () => {
    const component: CheckboxComponentSchema = {...BASE_COMPONENT, validate: {required: true}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(true);

    expect(success).toBe(true);
  });
});
