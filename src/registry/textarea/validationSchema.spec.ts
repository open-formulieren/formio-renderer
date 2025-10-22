import type {TextareaComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: TextareaComponentSchema = {
  type: 'textarea',
  id: 'textarea',
  key: 'textarea',
  label: 'Textarea',
  autoExpand: false,
};

const buildValidationSchema = (component: TextareaComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('textarea component validation', () => {
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
    const component: TextareaComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });

  test.each([
    [3, 'aaa', true],
    [3, 'all cats are beatiful', false],
    [10, 'short', true],
  ])('max length %d (value: %s)', (maxLength, value, valid) => {
    const component: TextareaComponentSchema = {
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
    const component: TextareaComponentSchema = {
      ...BASE_COMPONENT,
      validate: {pattern},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: TextareaComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync('irrelevant');

    expect(success).toBe(valid);
  });
});

describe('textarea component with multiple: true', () => {
  test.each([
    [true, [], false],
    [true, [''], false],
    [true, [undefined], false],
    [true, ['abcdef \n foo bar'], true],
    [false, [], true],
    [false, [''], true],
    [false, [undefined], true],
  ])('required %s (value: %s)', (required: boolean, value: string[], valid: boolean) => {
    const component: TextareaComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required},
      multiple: true,
      defaultValue: [],
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test('individual items are still validated', () => {
    const component: TextareaComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: false, pattern: '[0-9]+'},
      multiple: true,
      defaultValue: [],
    };
    const schema = buildValidationSchema(component);

    // Spaces instead of hyphens
    const {success} = schema.safeParse(['only dig1ts allowed']);

    expect(success).toBe(false);
  });
});
