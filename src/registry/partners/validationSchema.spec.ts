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

describe('Partners component validation', () => {
  test.each([
    [{bsn: '', initials: '', affixes: '', lastName: '', dateOfBirth: ''}],
    [{bsn: '111222333', initials: '', affixes: '', lastName: '', dateOfBirth: ''}],
    [{bsn: '', initials: '', affixes: '', lastName: 'Vis', dateOfBirth: ''}],
    [{bsn: '', initials: '', affixes: '', lastName: '', dateOfBirth: '12-12-2000'}],
    [{bsn: '111222333', initials: '', affixes: '', lastName: '', dateOfBirth: '12-12-2000'}],
    [{bsn: '', initials: '', affixes: '', lastName: 'Vis', dateOfBirth: '12-12-2000'}],
    [{bsn: '111222333', initials: '', affixes: '', lastName: 'Vis', dateOfBirth: ''}],
  ])('does not accept partners with missing bsn, lastName or dateOfBirth (value: %s)', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test.each([
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
  ])('does not accept dateOfBirth 120 years ago or in the future', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });
});
