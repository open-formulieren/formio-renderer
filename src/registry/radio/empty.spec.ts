import type {RadioComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  ['', true],
  // Non-empty state
  ['foo', false],
])(
  'Radio isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string | undefined, expected: boolean) => {
    const component: RadioComponentSchema = {
      openForms: {
        translations: {},
        dataSrc: 'manual',
      },
      type: 'radio',
      key: 'radio',
      id: 'radio',
      label: 'radio',
      values: [
        {
          value: 'foo',
          label: 'Foo',
        },
        {
          value: 'bar',
          label: 'Bar',
        },
      ],
      defaultValue: '',
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
