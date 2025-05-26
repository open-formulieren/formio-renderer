import type {SelectboxesComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});
const BASE_COMPONENT: SelectboxesComponentSchema = {
  type: 'selectboxes',
  id: 'selectboxes',
  key: 'selectboxes',
  label: 'Selectboxes field',
  openForms: {dataSrc: 'manual', translations: {}},
  defaultValue: {
    option1: false,
    option2: false,
  },
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

const buildValidationSchema = (component: SelectboxesComponentSchema) => {
  const schemas = getValidationSchema(component, intl, getRegistryEntry);
  return schemas[component.key];
};

describe('radio component validation', () => {
  test('accepts known values ', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse({option1: true, option2: false});

    expect(success).toBe(true);
  });

  test('rejects unknown value', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse({option1: true, option2: false, option3: true});

    expect(success).toBe(false);
  });

  // formio reference has defaultValue: null but the submission value turns into an
  // empty string
  test.each(['', null, undefined])('allows empty value if not required (value: %s)', value => {
    const component: SelectboxesComponentSchema = {...BASE_COMPONENT, validate: {required: false}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each(['', null, undefined])('rejects empty value if required (value: %s', value => {
    const component: SelectboxesComponentSchema = {...BASE_COMPONENT, validate: {required: true}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });
});
