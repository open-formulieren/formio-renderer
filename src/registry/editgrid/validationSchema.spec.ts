import type {EditGridComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: EditGridComponentSchema = {
  type: 'editgrid',
  id: 'editgrid',
  key: 'editgrid',
  label: 'Edit grid',
  disableAddingRemovingRows: false,
  groupLabel: 'Item',
  components: [
    {
      id: 'textfield',
      type: 'textfield',
      key: 'textfield',
      label: 'Text',
    },
  ],
};

const buildValidationSchema = (component: EditGridComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async () => undefined,
  });
  return schemas[component.key];
};

describe('editgrid component validation', () => {
  test.each([
    [false, []],
    [true, []],
  ])('required %s (value: %o)', (required, value) => {
    const component: EditGridComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });

  test('validates maxLength', () => {
    const component: EditGridComponentSchema = {...BASE_COMPONENT, validate: {maxLength: 2}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse([
      {textfield: 'one'},
      {textfield: 'two'},
      {textfield: 'three'},
    ]);

    expect(success).toBe(false);
  });

  test('passes validation', () => {
    const component: EditGridComponentSchema = {
      ...BASE_COMPONENT,
      validate: {required: true, maxLength: 3},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse([{textfield: 'one'}, {textfield: 'two'}]);

    expect(success).toBe(true);
  });
});
