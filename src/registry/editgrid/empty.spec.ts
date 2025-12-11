import type {
  EditGridComponentSchema,
  SelectboxesComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';
import type {JSONObject} from '@/types';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  [[], true],
  [[{}], true],
  [[{}, {}], true],
  [[{textfield: ''}], true],
  [[{textfield: ''}, {}], true],
  [[{textfield: ''}, {textfield1: ['']}], true],
  [[{textfield1: []}], true],
  [[{selectboxes: {}}], true],
  [[{selectboxes: {'123': false}}], true],
  [[{textfield: '', textfield1: [], selectboxes: {}, editgrid1: [{textfield2: ''}]}], true],
  // Non-empty states
  [[{textfield: 'test'}], false],
  [[{editgrid1: [{textfield2: 'foo'}]}], false],
  [
    [
      {
        textfield: '',
        textfield1: [],
        selectboxes: {'123': false},
        editgrid1: [{textfield2: 'foo'}],
      },
    ],
    false,
  ],
])(
  'Editgrid isEmpty compares against defined, non-empty array state of value',
  (valueToTest: JSONObject[] | undefined, expected: boolean) => {
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
        {
          type: 'textfield',
          key: 'textfield1',
          id: 'textfield1',
          label: 'Textfield1',
          multiple: true,
        } satisfies TextFieldComponentSchema,
        {
          type: 'selectboxes',
          id: 'selectboxes',
          key: 'selectboxes',
          label: 'Select boxes',
          openForms: {dataSrc: 'manual', translations: {}},
          values: [
            {value: 'a', label: 'A'},
            {value: 'b', label: 'B'},
          ],
          defaultValue: {a: false, b: false},
        } satisfies SelectboxesComponentSchema,
        {
          type: 'editgrid',
          key: 'editgrid1',
          id: 'editgrid1',
          label: 'Editgrid1',
          groupLabel: 'Editgrid item 1',
          disableAddingRemovingRows: false,
          components: [
            {
              type: 'textfield',
              key: 'textfield2',
              id: 'textfield2',
              label: 'Textfield2',
            } satisfies TextFieldComponentSchema,
          ],
        } satisfies EditGridComponentSchema,
      ],
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
