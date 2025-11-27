import type {
  CustomerProfileComponentSchema,
  CustomerProfileData,
  DigitalAddressType,
} from '@open-formulieren/types';
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
  digitalAddressTypes: ['email', 'phoneNumber'],
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
    [],
    [{type: 'email', address: ''}],
    [{type: 'email', address: 'test@mail.com'}],
    [{type: 'phoneNumber', address: ''}],
    [{type: 'phoneNumber', address: '+0612345678'}],
  ])('non-required component accepts empty-ish object (value: %o)', async value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test('accepts valid digital addresses', async () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse([
      {
        type: 'email',
        address: 'test@mail.com',
      },
      {
        type: 'phoneNumber',
        address: '+0612345678',
      },
    ]);

    expect(success).toBe(true);
  });

  test('multiple digital addresses of the same type are not allowed', async () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse([
      {
        type: 'email',
        address: 'test@mail.com',
      },
      {
        type: 'email',
        address: 'second@mail.com',
      },
      {
        type: 'email',
        address: 'third@mail.com',
      },
    ]);

    expect(success).toBe(false);
  });
});

describe('customer profile email digital address type validation', () => {
  test.each([124, false, true, ['array'], null, {object: 'value'}])(
    'does not accept non-string values (value: %s)',
    value => {
      const schema = buildValidationSchema({
        ...BASE_COMPONENT,
        digitalAddressTypes: ['email'],
      });

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
    const schema = buildValidationSchema({
      ...BASE_COMPONENT,
      digitalAddressTypes: ['email'],
    });

    const {success} = schema.safeParse([
      {
        type: 'email',
        address: value,
      },
    ]);

    expect(success).toBe(valid);
  });

  test.each([
    [undefined, false],
    ['', false],
    ['test@mail.com', true],
  ])('required must have valid email address (value: %s)', (value, valid) => {
    const schema = buildValidationSchema({
      ...BASE_COMPONENT,
      digitalAddressTypes: ['email'],
      validate: {required: true},
    });

    const {success} = schema.safeParse([
      {
        type: 'email',
        address: value,
      },
    ]);

    expect(success).toBe(valid);
  });
});

describe('customer profile phone number digital address type validation', () => {
  test.each([124, false, true, ['array'], null, {object: 'value'}])(
    'does not accept non-string values (value: %s)',
    value => {
      const schema = buildValidationSchema({
        ...BASE_COMPONENT,
        digitalAddressTypes: ['phoneNumber'],
      });

      const {success} = schema.safeParse([
        {
          type: 'phoneNumber',
          address: value,
        },
      ]);

      expect(success).toBe(false);
    }
  );

  test.each(['123456789', '+31 6 11223344', '0031 6 11223344', '06 112 233 44', '06-112-23-44'])(
    'valid phone number pattern (value: %s)',
    value => {
      const schema = buildValidationSchema({
        ...BASE_COMPONENT,
        digitalAddressTypes: ['phoneNumber'],
      });

      const {success} = schema.safeParse([
        {
          type: 'phoneNumber',
          address: value,
        },
      ]);

      expect(success).toBe(true);
    }
  );

  test.each([
    [undefined, false],
    ['', false],
    ['0612345678', true],
  ])('required must have a phone number (value: %s)', (value, valid) => {
    const schema = buildValidationSchema({
      ...BASE_COMPONENT,
      digitalAddressTypes: ['phoneNumber'],
      validate: {required: true},
    });

    const {success} = schema.safeParse([
      {
        type: 'phoneNumber',
        address: value,
      },
    ]);

    expect(success).toBe(valid);
  });
});

describe('customer profile digitalAddressTypes validation', () => {
  test.each([
    // Only email digital addresses are allowed
    [['email'], [{type: 'email', address: 'test@mail.com'}], true],
    [['email'], [{type: 'phoneNumber', address: '0612345678'}], false],
    [
      ['email'],
      [
        {type: 'email', address: 'test@mail.com'},
        {type: 'phoneNumber', address: '0612345678'},
      ],
      false,
    ],
    // Only phone number digital addresses are allowed
    [['phoneNumber'], [{type: 'phoneNumber', address: '0612345678'}], true],
    [['phoneNumber'], [{type: 'email', address: 'test@mail.com'}], false],
    [
      ['phoneNumber'],
      [
        {type: 'email', address: 'test@mail.com'},
        {type: 'phoneNumber', address: '0612345678'},
      ],
      false,
    ],
    // Both email and phone number digital addresses are allowed
    [['email', 'phoneNumber'], [{type: 'phoneNumber', address: '0612345678'}], true],
    [['email', 'phoneNumber'], [{type: 'email', address: 'test@mail.com'}], true],
    [
      ['email', 'phoneNumber'],
      [
        {type: 'email', address: 'test@mail.com'},
        {type: 'phoneNumber', address: '0612345678'},
      ],
      true,
    ],
  ])(
    'only accepts digital addresses of the types set in digitalAddressTypes (digitalAddressTypes: %o, value: %o, valid: %o)',
    (digitalAddressTypes: DigitalAddressType[], value: CustomerProfileData, valid) => {
      const schema = buildValidationSchema({
        ...BASE_COMPONENT,
        digitalAddressTypes,
      });

      const {success} = schema.safeParse(value);

      expect(success).toBe(valid);
    }
  );

  test.each([
    [[{type: 'phoneNumber', address: '0612345678'}], false],
    [[{type: 'email', address: 'test@mail.com'}], false],
    [
      [
        {type: 'email', address: 'test@mail.com'},
        {type: 'phoneNumber', address: '0612345678'},
      ],
      true,
    ],
  ])(
    'required with multiple digitalAddressTypes requires a digital address for each type (value: %o, valid: %o)',
    (value, valid) => {
      const schema = buildValidationSchema({
        ...BASE_COMPONENT,
        digitalAddressTypes: ['email', 'phoneNumber'],
        validate: {required: true},
      });

      const {success} = schema.safeParse(value);

      expect(success).toBe(valid);
    }
  );
});

describe('customer profile useOnlyOnce and isNewPreferred validation', () => {
  test.each([
    [
      [{type: 'phoneNumber', address: '0612345678', useOnlyOnce: false, isNewPreferred: true}],
      true,
    ],
    [
      [{type: 'phoneNumber', address: '0612345678', useOnlyOnce: true, isNewPreferred: false}],
      true,
    ],
    // Only one of the two flags can be true at the same time
    [
      [{type: 'phoneNumber', address: '0612345678', useOnlyOnce: true, isNewPreferred: true}],
      false,
    ],
  ])('customer profile for email with %o', (value, valid) => {
    const schema = buildValidationSchema({
      ...BASE_COMPONENT,
      digitalAddressTypes: ['phoneNumber'],
    });

    const {success} = schema.safeParse(value);

    expect(success).toBe(valid);
  });
});
