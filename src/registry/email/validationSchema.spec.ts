import type {EmailComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: EmailComponentSchema = {
  type: 'email',
  id: 'email',
  key: 'email',
  label: 'Email',
  validateOn: 'blur',
};

const buildValidationSchema = (component: EmailComponentSchema) => {
  const schemas = getValidationSchema(component, intl, getRegistryEntry);
  return schemas[component.key];
};

describe('email component validation', () => {
  test.each([124, false, true, ['array'], null, {object: 'value'}])(
    'does not accept non-string values (value: %s)',
    value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = schema.safeParse(value);

      expect(success).toBe(false);
    }
  );

  test.each([
    ['foo@example.com', true],
    ['email+with.suffix@some-domain.tld', true],
    ['jimmy', false],
    ['laika@', false],
  ])('validates email pattern (value: %s)', (value, valid) => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test.each([
    [false, ''],
    [false, undefined],
    [true, ''],
    [true, undefined],
  ])('required %s (value: %s)', (required, value) => {
    const component: EmailComponentSchema = {...BASE_COMPONENT, validate: {required}};
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(!required);
  });
});
