import type {TimeComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: TimeComponentSchema = {
  type: 'time',
  id: 'timefield',
  key: 'timefield',
  label: 'Text field',
  inputType: 'text',
  format: 'HH:mm',
  validateOn: 'blur',
};

const MIN_TIME_COMPONENT = {...BASE_COMPONENT, validate: {minTime: '09:00'}};
const MAX_TIME_COMPONENT = {...BASE_COMPONENT, validate: {maxTime: '17:00'}};
const PERIOD_TIME_COMPONENT = {...BASE_COMPONENT, validate: {minTime: '09:00', maxTime: '17:00'}};
const NEXT_DAY_COMPONENT = {...BASE_COMPONENT, validate: {minTime: '15:00', maxTime: '09:00'}};

const buildValidationSchema = (component: TimeComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('time component validation', () => {
  test.each([
    undefined,
    '', // formio uses empty strings
  ])('validate.required=false (value: %s)', value => {
    const component: TimeComponentSchema = {...BASE_COMPONENT, validate: {required: false}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each([
    undefined,
    '', // formio uses empty strings
  ])('validate.required=true (value: %s)', value => {
    const component: TimeComponentSchema = {...BASE_COMPONENT, validate: {required: true}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test.each(['24:00', '23:60', '23:60', '1:1', '01:1', '1:01', 42, 12.34, null])(
    'Invalid time: %s',
    value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = schema.safeParse(value);

      expect(success).toBe(false);
    }
  );

  test.each(['08:00', '00:00'])('Invalid min time: %s', value => {
    const schema = buildValidationSchema(MIN_TIME_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test.each(['18:00', '23:59'])('Invalid max time: %s', value => {
    const schema = buildValidationSchema(MAX_TIME_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test.each(['08:00', '18:00', '00:00'])('Invalid period time: %s', value => {
    const schema = buildValidationSchema(PERIOD_TIME_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test.each(['10:00', '14:00'])('Invalid next day time: %s', value => {
    const schema = buildValidationSchema(NEXT_DAY_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test.each(['23:59', '00:00'])('Valid time: %s', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each(['09:00', '23:59'])('Valid min time: %s', value => {
    const schema = buildValidationSchema(MIN_TIME_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each(['17:00', '00:00'])('Valid max time: %s', value => {
    const schema = buildValidationSchema(MAX_TIME_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each(['09:00', '17:00'])('Valid period time: %s', value => {
    const schema = buildValidationSchema(PERIOD_TIME_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each(['15:00', '09:00', '00:00'])('Valid next day time: %s', value => {
    const schema = buildValidationSchema(NEXT_DAY_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: TimeComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const {success} = await schema.safeParseAsync('17:00');

    expect(success).toBe(valid);
  });
});

describe('time component with multiple: true', () => {
  test.each([
    [true, [], false],
    [true, [''], false],
    [true, [undefined], false],
    [true, ['13:52:00'], true],
    [false, [], true],
    [false, [''], true],
    [false, [undefined], true],
  ])('required %s (value: %s)', (required: boolean, value: string[], valid: boolean) => {
    const component: TimeComponentSchema = {
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
    const component: TimeComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: false},
      multiple: true,
      defaultValue: [],
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(['99:60:62']);

    expect(success).toBe(false);
  });
});
