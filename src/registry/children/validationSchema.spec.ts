import type {ChildDetails, ChildrenComponentSchema} from '@open-formulieren/types';
import {addYears, subDays, subYears} from 'date-fns';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: ChildrenComponentSchema = {
  type: 'children',
  id: 'children',
  key: 'children',
  label: 'Children',
  enableSelection: false,
};

const buildValidationSchema = (component: ChildrenComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async () => undefined,
  });
  return schemas[component.key];
};

const today = new Date();

describe('Plain children validation', () => {
  test.for([undefined, []])('accepts zero child details', async value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = await schema.safeParseAsync(value);

    expect(success).toBe(true);
  });

  test('accepts multiple child details', async () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = await schema.safeParseAsync([
      {
        bsn: '111222333',
        firstNames: 'Johan',
        dateOfBirth: '1980-12-12',
      },
      {
        bsn: '923456788',
        firstNames: 'Joe',
        dateOfBirth: '1980-12-12',
      },
    ]);

    expect(success).toBe(true);
  });
});

describe('Children subfields validation', () => {
  test.for([
    [{bsn: '', firstNames: '', dateOfBirth: ''}],

    [{bsn: '111222333', firstNames: '', dateOfBirth: ''}],
    [{bsn: '111222333', firstNames: '', dateOfBirth: '1980-12-12'}],
    [{bsn: '111222333', firstNames: 'Joe', dateOfBirth: ''}],

    [{bsn: '', firstNames: 'Joe', dateOfBirth: ''}],
    [{bsn: '', firstNames: 'Joe', dateOfBirth: '1980-12-12'}],

    [{bsn: '', firstNames: '', dateOfBirth: '1980-12-12'}],
  ] satisfies ChildDetails[][])(
    'does not accept children with missing BSN, first name or date of birth (value: %s)',
    async value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = await schema.safeParseAsync(value);

      expect(success).toBe(false);
    }
  );

  test.for([
    // Not a string
    [{bsn: 111222333, firstNames: 'Joe', dateOfBirth: '1980-12-12'}],
    // Too short
    [{bsn: '123', firstNames: 'Joe', dateOfBirth: '1980-12-12'}],
    // Too long
    [{bsn: '0000000000', firstNames: 'Joe', dateOfBirth: '1980-12-12'}],
    // Not digits only
    [{bsn: 'aaabbbccc', firstNames: 'Joe', dateOfBirth: '1980-12-12'}],
    // Doesn't pass 11 check
    [{bsn: '123456789', firstNames: 'Joe', dateOfBirth: '1980-12-12'}],
  ])('does not accept invalid BSN (value: %s)', async value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = await schema.safeParseAsync(value);

    expect(success).toBe(false);
  });

  test.for([
    [
      {
        bsn: '111222333',
        firstNames: 'Joe',
        // Go back 120 years and 1 day
        dateOfBirth: subDays(subYears(today, 120), 1).toISOString(),
      },
    ],
    [
      {
        bsn: '111222333',
        firstNames: 'Joe',
        // Today
        dateOfBirth: today.toISOString(),
      },
    ],
    [
      {
        bsn: '111222333',
        firstNames: 'Joe',
        // 1 year in the future
        dateOfBirth: addYears(today, 1).toISOString(),
      },
    ],
  ] satisfies ChildDetails[][])(
    'does not accept a date of birth more than 120 years ago or in the future',
    async value => {
      const schema = buildValidationSchema(BASE_COMPONENT);

      const {success} = await schema.safeParseAsync(value);

      expect(success).toBe(false);
    }
  );

  test('accepts children details with valid bsn, first name and date of birth', async () => {
    const value = [
      {
        bsn: '111222333',
        firstNames: 'Joe',
        dateOfBirth: '1980-12-12',
      },
    ];
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = await schema.safeParseAsync(value);

    expect(success).toBe(true);
  });
});

describe('Manually added children validation', () => {
  test('accepts manually added children', async () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = await schema.safeParseAsync([
      {
        bsn: '111222333',
        firstNames: 'Joe',
        dateOfBirth: '1980-12-12',
        __addedManually: true,
        __id: '9905f081-57c2-4228-8010-77b34ef0e7ab',
      },
    ]);

    expect(success).toBe(true);
  });
});

describe('Selectable children validation', () => {
  test('accepts selected children', async () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = await schema.safeParseAsync([
      {
        bsn: '111222333',
        firstNames: 'Johan',
        dateOfBirth: '1980-12-12',
        selected: true,
      },
      {
        bsn: '923456788',
        firstNames: 'Joe',
        dateOfBirth: '2000-05-06',
        selected: false,
      },
    ]);

    expect(success).toBe(true);
  });
});

describe('Multiple children validation', () => {
  test('does not accept children with the same bsn', async () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = await schema.safeParseAsync([
      {
        bsn: '111222333',
        firstNames: 'Johan',
        dateOfBirth: '1980-12-12',
      },
      {
        bsn: '111222333',
        firstNames: 'Joe',
        dateOfBirth: '2000-05-06',
      },
    ]);

    expect(success).toBe(false);
  });
  test("accepts children with different bsn's", async () => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = await schema.safeParseAsync([
      {
        bsn: '111222333',
        firstNames: 'Johan',
        dateOfBirth: '1980-12-12',
      },
      {
        bsn: '923456788',
        firstNames: 'Joe',
        dateOfBirth: '2000-05-06',
      },
    ]);

    expect(success).toBe(true);
  });
});
