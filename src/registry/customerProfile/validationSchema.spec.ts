import type {CustomerProfileComponentSchema, DigitalAddress} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: CustomerProfileComponentSchema = {
  type: 'customerProfile',
  id: 'customerProfile',
  key: 'customerProfile',
  label: 'customerProfile',
  shouldUpdateCustomerData: false,
  digitalAddressTypes: {
    email: true,
    phoneNumber: true,
  },
};

const buildValidationSchema = (component: CustomerProfileComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('plain customer profile component validation', () => {
  // anything other than CustomerProfileData
  test.each(['abc123', null, 999, true, false])(
    'does not accept invalid values (value: %s)',
    async value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = schema.safeParse(value);

      expect(success).toBe(false);
    }
  );

  test.each([
    undefined,
    {},
    {email: undefined},
    {email: {address: 'test@mail.com'}},
    {phoneNumber: undefined},
    {phoneNumber: {address: '0612345678'}},
    {email: undefined, phoneNumber: undefined},
    {email: {address: 'test@mail.com'}, phoneNumber: {address: '0612345678'}},
  ])('non-required component accepts empty-ish object (value: %o)', async value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });
});

describe('customer profile email only validation', () => {
  test.each([124, false, true, ['array'], null, {object: 'value'}])(
    'does not accept non-string values (value: %s)',
    value => {
      const schema = buildValidationSchema({
        ...BASE_COMPONENT,
        digitalAddressTypes: {email: true, phoneNumber: false},
      });

      const {success} = schema.safeParse({
        email: {
          address: value,
        },
      });

      expect(success).toBe(false);
    }
  );

  test.each([
    ['foo@example.com', true],
    ['email+with.suffix@some-domain.tld', true],
    ['jimmy', false],
    ['laika@', false],
  ])('validates email pattern (value: %s)', (value, valid) => {
    const schema = buildValidationSchema({
      ...BASE_COMPONENT,
      digitalAddressTypes: {email: true, phoneNumber: false},
    });

    const {success} = schema.safeParse({
      email: {
        address: value,
      },
    });

    expect(success).toBe(valid);
  });

  test('non-required accepts missing email field', () => {
    const schema = buildValidationSchema({
      ...BASE_COMPONENT,
      digitalAddressTypes: {email: true, phoneNumber: false},
      validate: {required: false},
    });

    const {success} = schema.safeParse({email: undefined});

    expect(success).toBe(true);
  });

  test.each([
    [undefined, false],
    ['', false],
    ['test@mail.com', true],
  ])('required must have valid email address (value: %s)', (value, valid) => {
    const schema = buildValidationSchema({
      ...BASE_COMPONENT,
      digitalAddressTypes: {email: true, phoneNumber: false},
      validate: {required: true},
    });

    const {success} = schema.safeParse({
      email: {
        address: value,
      },
    });

    expect(success).toBe(valid);
  });
});

describe('customer profile phone number only validation', () => {
  test.each([124, false, true, ['array'], null, {object: 'value'}])(
    'does not accept non-string values (value: %s)',
    value => {
      const schema = buildValidationSchema({
        ...BASE_COMPONENT,
        digitalAddressTypes: {email: false, phoneNumber: true},
      });

      const {success} = schema.safeParse({
        phoneNumber: {
          address: value,
        },
      });

      expect(success).toBe(false);
    }
  );

  test.each(['123456789', '+31 6 11223344', '0031 6 11223344', '06 112 233 44', '06-112-23-44'])(
    'valid phone number pattern (value: %s)',
    value => {
      const schema = buildValidationSchema({
        ...BASE_COMPONENT,
        digitalAddressTypes: {email: false, phoneNumber: true},
      });

      const {success} = schema.safeParse({phoneNumber: {address: value}});

      expect(success).toBe(true);
    }
  );

  test('non-required accepts missing phone number field', () => {
    const schema = buildValidationSchema({
      ...BASE_COMPONENT,
      digitalAddressTypes: {email: false, phoneNumber: true},
      validate: {required: false},
    });

    const {success} = schema.safeParse({phoneNumber: undefined});

    expect(success).toBe(true);
  });

  test.each([
    [undefined, false],
    ['', false],
    ['0612345678', true],
  ])('required must have a phone number (value: %s)', (value, valid) => {
    const schema = buildValidationSchema({
      ...BASE_COMPONENT,
      digitalAddressTypes: {email: false, phoneNumber: true},
      validate: {required: true},
    });

    const {success} = schema.safeParse({
      phoneNumber: {
        address: value,
      },
    });

    expect(success).toBe(valid);
  });
});

describe('customer profile digitalAddressTypes validation', () => {
  test.each([
    [{email: {address: 'test@mail.com'}}, true],
    [{phoneNumber: {address: '0612345678'}}, false],
    [{email: {address: 'test@mail.com'}, phoneNumber: {address: '0612345678'}}, false],
  ])('with only email digitalAddressTypes, only email values are accepted', (value, valid) => {
    const schema = buildValidationSchema({
      ...BASE_COMPONENT,
      digitalAddressTypes: {email: true, phoneNumber: false},
    });

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });

  test.each([
    [{email: {address: 'test@mail.com'}}, false],
    [{phoneNumber: {address: '0612345678'}}, true],
    [{email: {address: 'test@mail.com'}, phoneNumber: {address: '0612345678'}}, false],
  ])(
    'with only phone number digitalAddressTypes, only phone number values are accepted',
    (value, valid) => {
      const schema = buildValidationSchema({
        ...BASE_COMPONENT,
        digitalAddressTypes: {email: false, phoneNumber: true},
      });

      const {success} = schema.safeParse(value);

      expect(success).toBe(valid);
    }
  );

  test.each([
    [{email: {address: 'test@mail.com'}}, true],
    [{phoneNumber: {address: '0612345678'}}, true],
    [{email: {address: 'test@mail.com'}, phoneNumber: {address: '0612345678'}}, true],
  ])(
    'with email and phone number digitalAddressTypes, email and/or phone number values are accepted',
    (value, valid) => {
      const schema = buildValidationSchema({
        ...BASE_COMPONENT,
        digitalAddressTypes: {email: true, phoneNumber: true},
      });

      const {success} = schema.safeParse(value);

      expect(success).toBe(valid);
    }
  );

  test.each([
    [{email: {address: 'test@mail.com'}}, false],
    [{phoneNumber: {address: '0612345678'}}, false],
    [{email: {address: 'test@mail.com'}, phoneNumber: {address: '0612345678'}}, true],
  ])(
    'required with email and phone number digitalAddressTypes, only email and phone number values are accepted',
    (value, valid) => {
      const schema = buildValidationSchema({
        ...BASE_COMPONENT,
        digitalAddressTypes: {email: true, phoneNumber: true},
        validate: {required: true},
      });

      const {success} = schema.safeParse(value);

      expect(success).toBe(valid);
    }
  );
});

describe('customer profile useOnlyOnce and isNewPreferred validation', () => {
  test.each([
    [{address: 'test@mail.com', useOnlyOnce: true, isNewPreferred: false}, true],
    [{address: 'test@mail.com', useOnlyOnce: false, isNewPreferred: true}, true],
    [{address: 'test@mail.com', useOnlyOnce: true, isNewPreferred: true}, false],
  ])('customer profile for email with %o', (value: DigitalAddress, valid) => {
    const schema = buildValidationSchema({
      ...BASE_COMPONENT,
      digitalAddressTypes: {email: true, phoneNumber: false},
    });

    const {success} = schema.safeParse({email: value});

    expect(success).toBe(valid);
  });

  test.each([
    [{address: '0612345678', useOnlyOnce: true, isNewPreferred: false}, true],
    [{address: '0612345678', useOnlyOnce: false, isNewPreferred: true}, true],
    [{address: '0612345678', useOnlyOnce: true, isNewPreferred: true}, false],
  ])('customer profile for phone number with %o', (value: DigitalAddress, valid) => {
    const schema = buildValidationSchema({
      ...BASE_COMPONENT,
      digitalAddressTypes: {email: false, phoneNumber: true},
    });

    const {success} = schema.safeParse({phoneNumber: value});

    expect(success).toBe(valid);
  });
});
