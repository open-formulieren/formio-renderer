import type {AddressData, AddressNLComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: AddressNLComponentSchema = {
  type: 'addressNL',
  id: 'addressNL',
  key: 'addressNL',
  label: 'Address',
  layout: 'singleColumn',
  deriveAddress: false,
};

const buildValidationSchema = (component: AddressNLComponentSchema) => {
  const schemas = getValidationSchema(component, intl, getRegistryEntry);
  return schemas[component.key];
};

describe('plain addressNL component validation', () => {
  test.each([
    'abc123', // string instead of AddressData
    null, // null instead of AddressData
    999, // number
    true,
    false,
  ])('does not accept invalid values (value: %s)', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test('not-required component accepts empty-ish object', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    // optional/empty fields are turned into `undefined` by Formik
    const {success} = schema.safeParse({
      postcode: undefined,
      houseNumber: undefined,
      houseLetter: undefined,
      houseNumberAddition: undefined,
      city: undefined,
      streetName: undefined,
      secretStreetCity: undefined,
      autoPopulated: false,
    });

    expect(success).toBe(true);
  });

  test.each([
    [{postcode: '1111 AA', houseNumber: '5'}, true],
    [{postcode: '1111AA', houseNumber: '5'}, true],
    [{postcode: '1111 AA', houseNumber: ''}, false],
    [{postcode: '1111 AA', houseNumber: undefined}, false],
    [{postcode: '', houseNumber: '5'}, false],
    [{postcode: undefined, houseNumber: '5'}, false],
    [{postcode: undefined, houseNumber: undefined}, false],
  ])(
    'required component requires postcode and house number (value: %s)',
    (value: Partial<AddressData>, expected: boolean) => {
      const schema = buildValidationSchema({...BASE_COMPONENT, validate: {required: true}});

      const {success} = schema.safeParse(value);

      expect(success).toBe(expected);
    }
  );
});

describe('addressNL subfields validation', () => {
  test.each([
    {postcode: 'AAAA 12', houseNumber: '12'},
    {postcode: '123', houseNumber: '12'},
    {postcode: '123123 AB', houseNumber: '12'},
  ])('postcode format (value %s)', value => {
    const schema = buildValidationSchema({...BASE_COMPONENT, validate: {required: false}});

    const {success, error} = schema.safeParse(value);

    expect(success).toBe(false);
    const message = error?.issues?.[0].message;
    expect(message).toBe('Postcode must be four digits followed by two letters (e.g. 1234 AB).');
  });

  test.each([
    {postcode: '9999 AA', houseNumber: ''},
    {postcode: '9999 AA', houseNumber: '9A'},
    {postcode: '9999 AA', houseNumber: 'A'},
    {postcode: '9999 AA', houseNumber: 'c'},
    {postcode: '9999 AA', houseNumber: '999999'},
  ])('house number format (value %s)', value => {
    const schema = buildValidationSchema({...BASE_COMPONENT, validate: {required: false}});

    const {success, error} = schema.safeParse(value);

    expect(success).toBe(false);
    const message = error?.issues?.[0].message;
    expect(message).toBe('House number must be a number with up to five digits (e.g. 456).');
  });

  test.each([
    {postcode: '9999 AA', houseNumber: '9', houseLetter: '9'},
    {postcode: '9999 AA', houseNumber: '9', houseLetter: 'ZZ'},
  ])('house letter format (value %s)', value => {
    const schema = buildValidationSchema({...BASE_COMPONENT, validate: {required: false}});

    const {success, error} = schema.safeParse(value);

    expect(success).toBe(false);
    const message = error?.issues?.[0].message;
    expect(message).toBe('House letter must be a single letter.');
  });

  test.each([
    {postcode: '9999 AA', houseNumber: '9', houseNumberAddition: 'AAAAA'},
    {postcode: '9999 AA', houseNumber: '9', houseNumberAddition: 'A-9'},
  ])('house number addition format (value %s)', value => {
    const schema = buildValidationSchema({...BASE_COMPONENT, validate: {required: false}});

    const {success, error} = schema.safeParse(value);

    expect(success).toBe(false);
    const message = error?.issues?.[0].message;
    expect(message).toBe('House number addition must be up to four letters and digits.');
  });
});

describe('addressNL with address auto-fill', () => {
  const _BASE_COMPONENT: AddressNLComponentSchema = {...BASE_COMPONENT, deriveAddress: true};

  test.each([
    [{postcode: '9999 AA', houseNumber: '9', city: 'Amsterdam', streetName: 'Kingsfordweg'}, true],
    [{postcode: '9999 AA', houseNumber: '9', city: '', streetName: 'Kingsfordweg'}, false],
    [{postcode: '9999 AA', houseNumber: '9', city: undefined, streetName: 'Kingsfordweg'}, false],
    [{postcode: '9999 AA', houseNumber: '9', city: 'Amsterdam', streetName: ''}, false],
    [{postcode: '9999 AA', houseNumber: '9', city: 'Amsterdam', streetName: undefined}, false],
    [{postcode: '9999 AA', houseNumber: '9', city: undefined, streetName: undefined}, false],
  ])(
    'city and street name are required fields in a required addressNL component (value %s)',
    (value: Partial<AddressData>, expected: boolean) => {
      const schema = buildValidationSchema({..._BASE_COMPONENT, validate: {required: true}});

      const {success} = schema.safeParse(value);

      expect(success).toBe(expected);
    }
  );

  test.each([
    [{postcode: undefined, houseNumber: undefined, city: undefined, streetName: undefined}, true],
    [{postcode: '9999 AA', houseNumber: '9', city: '', streetName: 'Kingsfordweg'}, false],
    [{postcode: '9999 AA', houseNumber: '9', city: undefined, streetName: 'Kingsfordweg'}, false],
    [{postcode: '9999 AA', houseNumber: '9', city: 'Amsterdam', streetName: ''}, false],
    [{postcode: '9999 AA', houseNumber: '9', city: 'Amsterdam', streetName: undefined}, false],
    [{postcode: '9999 AA', houseNumber: '9', city: undefined, streetName: undefined}, false],
  ])(
    'city and street name are required fields in a not-required addressNL component (value %s)',
    (value: Partial<AddressData>, expected: boolean) => {
      // if postcode/house number are provided, then city and street name must also be provided
      const schema = buildValidationSchema({..._BASE_COMPONENT, validate: {required: false}});

      const {success} = schema.safeParse(value);

      expect(success).toBe(expected);
    }
  );
});
