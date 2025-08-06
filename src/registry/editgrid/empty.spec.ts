import type {EditGridComponentSchema, TextFieldComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {JSONObject} from '@/types';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  ['foobar', true],
  [{}, true],
  [[], true],
  // Non-empty states
  [[{}], false],
  [[{textfield: ''}], false],
])(
  'Editgrid isEmpty compares against defined, non-empty array state of value',
  (valueToTest: JSONObject, expected: boolean) => {
    const component: EditGridComponentSchema = {
      type: 'editgrid',
      key: 'editgrid',
      id: 'editgrid',
      label: 'Editgrid',
      groupLabel: 'Editgrid item',
      disableAddingRemovingRows: false,
      components: [
        {
          type: 'textfield',
          key: 'textfield',
          id: 'textfield',
          label: 'Textfield',
        } satisfies TextFieldComponentSchema,
      ],
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
