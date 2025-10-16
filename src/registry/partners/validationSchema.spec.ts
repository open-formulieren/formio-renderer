import type {PartnersComponentSchema} from '@open-formulieren/types';
import {addYears, subYears} from 'date-fns';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: PartnersComponentSchema = {
  type: 'partners',
  id: 'partners',
  key: 'partners',
  label: 'Partners',
};

const buildValidationSchema = (component: PartnersComponentSchema) => {
  const schemas = getValidationSchema(component, intl, getRegistryEntry);
  return schemas[component.key];
};

const today = new Date();

describe('Plain partners validation', () => {
  test('accepts zero partner details', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse([]);

    expect(success).toBe(true);
  });

  test('accepts multiple partner details', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse([
      {
        bsn: '111222333',
        initials: '',
        affixes: '',
        lastName: 'Vis',
        dateOfBirth: '2000-12-12',
      },
      {
        bsn: '923456788',
        initials: '',
        affixes: '',
        lastName: 'Bungle',
        dateOfBirth: '2000-12-12',
      },
    ]);

    expect(success).toBe(true);
  });
});

describe('Partners subfields validation', () => {
  test.each([
    [{bsn: '', initials: '', affixes: '', lastName: '', dateOfBirth: ''}],

    [{bsn: '111222333', initials: '', affixes: '', lastName: '', dateOfBirth: ''}],
    [{bsn: '111222333', initials: '', affixes: '', lastName: '', dateOfBirth: '12-12-2000'}],
    [{bsn: '111222333', initials: '', affixes: '', lastName: 'Vis', dateOfBirth: ''}],

    [{bsn: '', initials: '', affixes: '', lastName: 'Vis', dateOfBirth: ''}],
    [{bsn: '', initials: '', affixes: '', lastName: 'Vis', dateOfBirth: '12-12-2000'}],

    [{bsn: '', initials: '', affixes: '', lastName: '', dateOfBirth: '12-12-2000'}],
  ])('does not accept partners with missing BSN, last name or date of birth (value: %s)', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  // For the bsn part the bsn component registry validationSchema is used, which are
  // already extensively covered with tests. As sanity check that the bsn validation
  // still works, we only test the obvious cases.
  test.each([
    // Not a string
    [{bsn: 111222333, initials: '', affixes: '', lastName: 'Vis', dateOfBirth: '12-12-2000'}],
    // Too few digits
    [{bsn: '123', initials: '', affixes: '', lastName: 'Vis', dateOfBirth: '12-12-2000'}],
    // Doesn't pass 11 check
    [{bsn: '123456789', initials: '', affixes: '', lastName: 'Vis', dateOfBirth: '12-12-2000'}],
  ])('does not accept invalid BSN (value: %s)', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test.each([
    [
      {
        bsn: '111222333',
        initials: '',
        affixes: '',
        lastName: 'Vis',
        dateOfBirth: subYears(today, 120).toISOString(),
      },
    ],
    [
      {
        bsn: '111222333',
        initials: '',
        affixes: '',
        lastName: 'Vis',
        dateOfBirth: today.toISOString(),
      },
    ],
    [
      {
        bsn: '111222333',
        initials: '',
        affixes: '',
        lastName: 'Vis',
        dateOfBirth: addYears(today, 1).toISOString(),
      },
    ],
  ])('does not accept a date of birth more then 120 years ago or in the future', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test.each([
    [
      {
        bsn: '111222333',
        initials: '',
        affixes: '',
        lastName: 'Vis',
        dateOfBirth: '2000-12-12',
      },
    ],
    [
      {
        bsn: '111222333',
        initials: 'JD',
        affixes: '',
        lastName: 'Vis',
        dateOfBirth: '2000-12-12',
      },
    ],
    [
      {
        bsn: '111222333',
        initials: '',
        affixes: 'de',
        lastName: 'Vis',
        dateOfBirth: '2000-12-12',
      },
    ],
    [
      {
        bsn: '111222333',
        initials: 'JD',
        affixes: 'de',
        lastName: 'Vis',
        dateOfBirth: '2000-12-12',
      },
    ],
  ])('accepts partner details with valid bsn, lastname and date of birth', (...value) => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });
});

describe('Manually added partners validation', () => {
  test('accepts manually added partners', () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse([
      {
        bsn: '111222333',
        initials: '',
        affixes: '',
        lastName: 'Vis',
        dateOfBirth: '2000-12-12',
        __addedManually: true,
      },
    ]);

    expect(success).toBe(true);
  });
});
