import type {SelectComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  ['', true],
  [[], true],
  [[''], true],
  [['', ''], true],
  // Non-empty state
  ['foo', false],
  [['bar'], false],
  [['foo', 'bar'], false],
])(
  'Select isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: string | string[] | undefined, expected: boolean) => {
    const component: SelectComponentSchema = {
      openForms: {
        translations: {},
        dataSrc: 'manual',
      },
      type: 'select',
      key: 'select',
      id: 'select',
      label: 'select',
      data: {
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
      },
      defaultValue: '',
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
