import type {PostcodeComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: PostcodeComponentSchema = {
  id: 'component1',
  type: 'postcode',
  key: 'postcode',
  label: 'Postcode',
  validate: {
    pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
  },
};

const buildValidationSchema = (component: PostcodeComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('postcode component validation', () => {
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
    const component: PostcodeComponentSchema = {
      ...BASE_COMPONENT,
      validate: {pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$', required},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });

  test('required with custom error message', () => {
    const component: PostcodeComponentSchema = {
      ...BASE_COMPONENT,
      validate: {pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$', required: true},
      errors: {required: 'Custom error message for required'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse(undefined);

    expect(result.error?.errors[0].message).toBe('Custom error message for required');
  });

  test.each(['1234AA', '1234 AA', '1234 aa', '1234aa'])('valid formats (value: %s)', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test('pattern with custom error message', () => {
    const component: PostcodeComponentSchema = {
      ...BASE_COMPONENT,
      validate: {pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$', required: false},
      errors: {pattern: 'Custom error message for pattern'},
    };
    const schema = buildValidationSchema(component);

    const result = schema.safeParse('2AA');

    expect(result.error?.errors[0].message).toBe('Custom error message for pattern');
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: PostcodeComponentSchema = {
      ...BASE_COMPONENT,
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
        required: false,
        plugins: [plugin],
      },
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync('1234AA');

    expect(success).toBe(valid);
  });

  describe('postcode component with multiple: true', () => {
    test.each([
      [true, [], false],
      [true, [''], false],
      [true, [undefined], false],
      [true, ['1234AA'], true],
      [false, [], true],
      [false, [''], true],
      [false, [undefined], true],
    ])('required %s (value: %s)', (required: boolean, value: string[], valid: boolean) => {
      const component: PostcodeComponentSchema = {
        ...BASE_COMPONENT,
        validate: {pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$', required},
        multiple: true,
        defaultValue: [],
      };
      const schema = buildValidationSchema(component);

      const {success} = schema.safeParse(value);

      expect(success).toBe(valid);
    });
  });

  test('required with custom error message and multiple: true', () => {
    const component: PostcodeComponentSchema = {
      ...BASE_COMPONENT,
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
        required: true,
      },
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
