import type {RadioComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';

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
  const schemas = getValidationSchema(component, intl, getRegistryEntry);
  return schemas[component.key];
};

describe('radio component validation', () => {
  test.each(['option1', 'option2'])('accepts known values (value: %s)', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test('rejects unknown value', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse('option42');

    expect(success).toBe(false);
  });

  // formio reference has defaultValue: null but the submission value turns into an
  // empty string
  test.each(['', null, undefined])('allows empty value if not required (value: %s)', value => {
    const component: RadioComponentSchema = {...BASE_COMPONENT, validate: {required: false}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each(['', null, undefined])('rejects empty value if required (value: %s', value => {
    const component: RadioComponentSchema = {...BASE_COMPONENT, validate: {required: true}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });
});
