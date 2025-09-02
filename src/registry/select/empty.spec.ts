import type {SelectComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  ['', true],
  [[], true],
  // Non-empty state
  ['foo', false],
  [['bar'], false],
])(
  'Select isEmpty compares against defined string with more then 0 characters state of value',
  (valueToTest: any, expected: boolean) => {
    const component: SelectComponentSchema = {
      openForms: {
        translations: {},
        dataSrc: 'manual',
      },
      type: 'select',
      key: 'select',
      id: 'select',
      label: 'select',
      dataSrc: 'values',
      dataType: 'string',
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

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
