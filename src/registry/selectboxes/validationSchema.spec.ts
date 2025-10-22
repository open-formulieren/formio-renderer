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
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async () => undefined,
  });
  return schemas[component.key];
};

describe('selectboxes component validation', () => {
  test('accepts known values ', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse({option1: true, option2: false});

    expect(success).toBe(true);
  });

  test('rejects unknown key', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse({option1: true, option2: false, option3: true});

    expect(success).toBe(false);
  });

  // see the backend validation reference in
  // `openforms.formio.components.vanilla.SelectBoxes.build_serializer_field`
  test('rejects missing keys', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse({option1: true});

    expect(success).toBe(false);
  });

  // formio reference has defaultValue: null but the submission value turns into an
  // empty string
  test.each([null, undefined])('allows empty value if not required (value: %s)', value => {
    const component: SelectboxesComponentSchema = {...BASE_COMPONENT, validate: {required: false}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each(['', null, undefined])('rejects empty value if required (value: %s)', value => {
    const component: SelectboxesComponentSchema = {...BASE_COMPONENT, validate: {required: true}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });
});

describe('selectboxes minimum selected count', () => {
  test('field not required, none selected', () => {
    const component: SelectboxesComponentSchema = {
      ...BASE_COMPONENT,
      validate: {
        required: false,
        minSelectedCount: 2,
      },
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse({option1: false, option2: false});

    expect(success).toBe(true);
  });

  test('field not required, one selected', () => {
    const component: SelectboxesComponentSchema = {
      ...BASE_COMPONENT,
      validate: {
        required: false,
        minSelectedCount: 2,
      },
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse({option1: true, option2: false});

    expect(success).toBe(false);
  });

  test('field required, none selected', () => {
    const component: SelectboxesComponentSchema = {
      ...BASE_COMPONENT,
      validate: {
        required: true,
        minSelectedCount: undefined,
      },
    };
    const schema = buildValidationSchema(component);

    const {success, error} = schema.safeParse({option1: false, option2: false});

    expect(success).toBe(false);
    // TODO: use proper message with error map
    expect(error?.issues?.[0].message).toBe('Required');
  });

  test('field required, one selected', () => {
    const component: SelectboxesComponentSchema = {
      ...BASE_COMPONENT,
      validate: {
        required: true,
        minSelectedCount: 2,
      },
    };
    const schema = buildValidationSchema(component);

    const {success, error} = schema.safeParse({option1: false, option2: true});

    expect(success).toBe(false);
    expect(error?.issues?.[0].message).toBe('You must select at least 2 items.');
  });
});

describe('selectboxes maximum selected count', () => {
  test('one selected', () => {
    const component: SelectboxesComponentSchema = {
      ...BASE_COMPONENT,
      validate: {maxSelectedCount: 1},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse({option1: true, option2: false});

    expect(success).toBe(true);
  });

  test('two selected', () => {
    const component: SelectboxesComponentSchema = {
      ...BASE_COMPONENT,
      validate: {maxSelectedCount: 1},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse({option1: true, option2: true});

    expect(success).toBe(false);
  });
});
