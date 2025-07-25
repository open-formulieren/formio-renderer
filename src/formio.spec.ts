import type {
  AnyComponentSchema,
  BsnComponentSchema,
  ColumnsComponentSchema,
  ContentComponentSchema,
  EditGridComponentSchema,
  EmailComponentSchema,
  FieldsetComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import {describe, expect, test} from 'vitest';

import {getComponentsMap, hasAnyConditionalLogicCycle} from './formio';

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

describe('editgrid cycle detection', () => {
  test('does not report cycle with identical keys in different scopes', () => {
    const components: AnyComponentSchema[] = [
      {
        type: 'textfield',
        id: 'textfield',
        key: 'textfield',
        label: 'Textfield',
      },
      {
        type: 'textfield',
        id: 'textfield2',
        key: 'textfield2',
        label: 'Textfield2',
        conditional: {
          show: true,
          when: 'textfield',
          eq: 'show',
        },
      },
      {
        type: 'editgrid',
        id: 'editgrid',
        key: 'editgrid',
        label: 'Edit grid',
        disableAddingRemovingRows: false,
        groupLabel: 'Item',
        components: [
          {
            type: 'textfield',
            id: 'textfield',
            key: 'textfield',
            label: 'Textfield',
            conditional: {
              show: true,
              when: 'textfield2',
              eq: 'show',
            },
          },
        ],
      },
    ];

    const result = hasAnyConditionalLogicCycle(components);

    expect(result).toBe(false);
  });

  test('detects cycles between grid item with prefixed key', () => {
    const component: EditGridComponentSchema = {
      type: 'editgrid',
      id: 'editgrid',
      key: 'editgrid',
      label: 'Edit grid',
      disableAddingRemovingRows: false,
      groupLabel: 'Item',
      components: [
        {
          type: 'textfield',
          id: 'textfield',
          key: 'textfield',
          label: 'Textfield',
          conditional: {
            show: true,
            when: 'editgrid.textfield2',
            eq: 'show',
          },
        },
        {
          type: 'textfield',
          id: 'textfield2',
          key: 'textfield2',
          label: 'Textfield 2',
          conditional: {
            show: true,
            when: 'editgrid.textfield',
            eq: 'show',
          },
        },
      ],
    };

    const result = hasAnyConditionalLogicCycle([component]);

    expect(result).toBe(true);
  });
});

describe('The getComponentsMap utility', () => {
  test('can handle complex nested configurations', () => {
    const components: AnyComponentSchema[] = [
      {
        type: 'textfield',
        key: 'my.textfield',
        id: 'text1',
        label: 'A text field',
      } satisfies TextFieldComponentSchema,
      {
        type: 'fieldset',
        key: 'container',
        id: 'fieldset1',
        label: 'A fieldset',
        hideHeader: false,
        components: [
          {
            type: 'email',
            key: 'my.email',
            id: 'email1',
            label: 'An email field',
            validateOn: 'blur',
          } satisfies EmailComponentSchema,
          {
            type: 'columns',
            key: 'columsnLayout',
            id: 'columns1',
            columns: [
              {
                size: 12,
                sizeMobile: 4,
                components: [
                  {
                    type: 'content',
                    key: 'wysiwyg',
                    id: 'content1',
                    html: '<p>Henlo</p>',
                  } satisfies ContentComponentSchema,
                ],
              },
            ],
          } satisfies ColumnsComponentSchema,
        ],
      } satisfies FieldsetComponentSchema,
    ];

    const map = getComponentsMap(components);

    expect(map).toHaveProperty('my.textfield');
    expect(map).toHaveProperty('container');
    expect(map).toHaveProperty('my.email');
    expect(map).toHaveProperty('columsnLayout');
    expect(map).toHaveProperty('wysiwyg');
  });
});
