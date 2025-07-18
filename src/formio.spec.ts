import type {
  AnyComponentSchema,
  BsnComponentSchema,
  ColumnsComponentSchema,
  EmailComponentSchema,
  FieldsetComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {hasAnyConditionalLogicCycle} from './formio';

test.each([
  // no components at all
  [[]],
  // just a single component
  [
    [
      {
        type: 'textfield',
        id: 'textfield',
        key: 'textfield',
        label: 'Textfield',
      } satisfies TextFieldComponentSchema,
    ],
  ],
  // multiple components without any conditionals
  [
    [
      {
        type: 'textfield',
        id: 'textfield',
        key: 'textfield',
        label: 'Textfield',
      } satisfies TextFieldComponentSchema,
      {
        type: 'email',
        id: 'email',
        key: 'email',
        label: 'Textfield',
        validateOn: 'blur',
      } satisfies EmailComponentSchema,
    ],
  ],
  // multiple components without reference cycles
  [
    [
      {
        type: 'textfield',
        id: 'textfield',
        key: 'textfield',
        label: 'Textfield',
      } satisfies TextFieldComponentSchema,
      {
        type: 'email',
        id: 'email',
        key: 'email',
        label: 'Textfield',
        validateOn: 'blur',
        conditional: {
          show: false,
          when: 'textfield',
          eq: 'some-value',
        },
      } satisfies EmailComponentSchema,
    ],
  ],
  // component with broken reference
  [
    [
      {
        type: 'email',
        id: 'email',
        key: 'email',
        label: 'Textfield',
        validateOn: 'blur',
        conditional: {
          show: false,
          when: 'textfield',
          eq: 'some-value',
        },
      } satisfies EmailComponentSchema,
    ],
  ],
])(
  'hasAnyConditionalLogicCycle does not detect a cycle in %s',
  (components: AnyComponentSchema[]) => {
    const result = hasAnyConditionalLogicCycle(components);

    expect(result).toBe(false);
  }
);

test.each([
  // two components with a reference cycle
  [
    [
      {
        type: 'textfield',
        id: 'textfield',
        key: 'textfield',
        label: 'Textfield',
        conditional: {
          show: false,
          when: 'email',
          eq: 'some-value',
        },
      } satisfies TextFieldComponentSchema,
      {
        type: 'email',
        id: 'email',
        key: 'email',
        label: 'Textfield',
        validateOn: 'blur',
        conditional: {
          show: false,
          when: 'textfield',
          eq: 'some-value',
        },
      } satisfies EmailComponentSchema,
    ],
  ],
  // cycle spans more nodes & nested configuration used
  [
    [
      {
        type: 'textfield',
        id: 'textfield',
        key: 'textfield',
        label: 'Textfield',
        conditional: {
          show: false,
          when: 'email',
          eq: 'some-value',
        },
      } satisfies TextFieldComponentSchema,
      {
        type: 'bsn',
        id: 'bsn',
        key: 'bsn',
        label: 'BSN',
        conditional: {
          show: false,
          when: 'textfield',
          eq: 'some-value',
        },
        validateOn: 'blur',
        inputMask: '999999999',
      } satisfies BsnComponentSchema,
      {
        type: 'fieldset',
        id: 'fieldset',
        key: 'fieldset',
        label: 'Fieldset',
        hideHeader: false,
        components: [
          {
            type: 'email',
            id: 'email',
            key: 'email',
            label: 'Textfield',
            validateOn: 'blur',
            conditional: {
              show: false,
              when: 'bsn',
              eq: 'some-value',
            },
          } satisfies EmailComponentSchema,
        ],
      } satisfies FieldsetComponentSchema,
    ],
  ],
])('hasAnyConditionalLogicCycle detects the cycle in %s', (components: AnyComponentSchema[]) => {
  const result = hasAnyConditionalLogicCycle(components);

  expect(result).toBe(true);
});

test('hasAnyConditionalLogicCycle detects cycles in column components', () => {
  const columns: ColumnsComponentSchema = {
    type: 'columns',
    id: 'columns',
    key: 'columns',
    columns: [
      {
        size: 6,
        sizeMobile: 4,
        components: [
          {
            type: 'textfield',
            id: 'textfield1',
            key: 'textfield1',
            label: 'textfield1',
            conditional: {
              show: true,
              when: 'textfield2',
              eq: 'cycle',
            },
          },
        ],
      },
      {
        size: 6,
        sizeMobile: 4,
        components: [
          {
            type: 'textfield',
            id: 'textfield2',
            key: 'textfield2',
            label: 'textfield2',
            conditional: {
              show: true,
              when: 'textfield1',
              eq: 'cycle',
            },
          },
        ],
      },
    ],
  };

  const result = hasAnyConditionalLogicCycle([columns]);

  expect(result).toBe(true);
});
