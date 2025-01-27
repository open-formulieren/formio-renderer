import type {TextFieldComponentSchema} from '@open-formulieren/types';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const BASE_COMPONENT: TextFieldComponentSchema = {
  type: 'textfield',
  id: 'textfield',
  key: 'textfield',
  label: 'Text field',
};

const buildValidationSchema = (component: TextFieldComponentSchema) => {
  const schemas = getValidationSchema(component, getRegistryEntry);
  return schemas[component.key];
};

describe('textfield component validation', () => {
  test.each([124, false, true, ['array'], null, {object: 'value'}])(
    'does not accept non-string values (value: %s)',
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
    const component: TextFieldComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });

  test.each([
    [3, 'aaa', true],
    [3, 'all cats are beatiful', false],
    [10, 'short', true],
  ])('max length %d (value: %s)', (maxLength, value, valid) => {
    const component: TextFieldComponentSchema = {
      ...BASE_COMPONENT,
      validate: {maxLength},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test.each([
    ['[0-9]+', 'abc13', false],
    ['[0-9]+', '124abc', false],
    ['[0-9]+', '1234', true],
  ])('pattern %s (value: %s)', (pattern, value, valid) => {
    const component: TextFieldComponentSchema = {
      ...BASE_COMPONENT,
      validate: {pattern},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });
});
