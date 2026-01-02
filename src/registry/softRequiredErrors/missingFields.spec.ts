import type {
  AnyComponentSchema,
  CheckboxComponentSchema,
  ColumnsComponentSchema,
  EditGridComponentSchema,
  FieldsetComponentSchema,
  FileComponentSchema,
  RadioComponentSchema,
  SelectComponentSchema,
  SelectboxesComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';
import type {JSONObject} from '@/types';

import {getMissingFields, getSoftRequiredComponents} from './missingFields';

const SOFT_REQUIRED_FILE_COMPONENT = {
  id: 'file',
  key: 'file',
  type: 'file',
  label: 'File upload',
  file: {
    name: '',
    type: [],
    allowedTypesLabels: [],
  },
  filePattern: '.jpg',
  multiple: false,
  openForms: {
    translations: {},
    softRequired: true,
  },
} satisfies FileComponentSchema;

describe('getSoftRequiredFields', () => {
  test('getSoftRequiredFields should resolve non-nested soft required components', () => {
    const components: AnyComponentSchema[] = [
      SOFT_REQUIRED_FILE_COMPONENT,
      {
        id: 'softRequiredTextfield',
        key: 'softRequiredTextfield',
        type: 'textfield',
        label: 'Soft required textfield',
        defaultValue: '',
        openForms: {
          // @ts-expect-error soft required on textfield is not officially supported yet
          softRequired: true,
        },
      } satisfies TextFieldComponentSchema,
      {
        id: 'requiredTextfield',
        key: 'requiredTextfield',
        type: 'textfield',
        label: 'Required textfield',
        defaultValue: '',
        validate: {
          required: true,
        },
      } satisfies TextFieldComponentSchema,
      {
        id: 'optionalTextfield',
        key: 'optionalTextfield',
        type: 'textfield',
        label: 'Optional textfield',
        defaultValue: '',
      } satisfies TextFieldComponentSchema,
    ];

    const softRequiredComponents = getSoftRequiredComponents(components);
    expect(softRequiredComponents).toHaveLength(2);
    expect(softRequiredComponents[0]).toBe(components[0]);
    expect(softRequiredComponents[1]).toBe(components[1]);
  });

  test('getSoftRequiredFields should resolve soft required components nested in fieldset', () => {
    const components: AnyComponentSchema[] = [
      {
        type: 'fieldset',
        id: 'fieldset',
        key: 'fieldset',
        label: 'Fieldset',
        hideHeader: false,
        components: [
          {
            ...SOFT_REQUIRED_FILE_COMPONENT,
            id: 'softRequiredFile',
            key: 'softRequiredFile',
            label: 'Soft required file upload',
          } satisfies FileComponentSchema,
          {
            id: 'optionalTextfield',
            key: 'optionalTextfield',
            type: 'textfield',
            label: 'Optional textfield',
          } satisfies TextFieldComponentSchema,
        ],
      } satisfies FieldsetComponentSchema,
    ];

    const softRequiredComponents = getSoftRequiredComponents(components);
    expect(softRequiredComponents).toHaveLength(1);
    expect(softRequiredComponents).toStrictEqual([
      {
        type: 'fieldset',
        id: 'fieldset',
        key: 'fieldset',
        label: 'Fieldset',
        hideHeader: false,
        components: [
          {
            ...SOFT_REQUIRED_FILE_COMPONENT,
            id: 'softRequiredFile',
            key: 'softRequiredFile',
            label: 'Soft required file upload',
          } satisfies FileComponentSchema,
        ],
      } satisfies FieldsetComponentSchema,
    ]);
  });

  test('getSoftRequiredFields should resolve soft required components nested in columns', () => {
    const components: AnyComponentSchema[] = [
      {
        id: 'columns',
        type: 'columns',
        key: 'columns',
        columns: [
          {
            size: 6,
            sizeMobile: 4,
            components: [
              {
                ...SOFT_REQUIRED_FILE_COMPONENT,
                id: 'file1',
                key: 'file1',
                label: 'File upload 1',
              } satisfies FileComponentSchema,
              {
                id: 'textfield',
                key: 'textfield',
                type: 'textfield',
                label: 'Textfield',
              } satisfies TextFieldComponentSchema,
            ],
          },
          {
            size: 6,
            sizeMobile: 4,
            components: [
              {
                ...SOFT_REQUIRED_FILE_COMPONENT,
                id: 'file2',
                key: 'file2',
                label: 'File upload 2',
              } satisfies FileComponentSchema,
            ],
          },
        ],
      } satisfies ColumnsComponentSchema,
    ];

    const softRequiredComponents = getSoftRequiredComponents(components);
    expect(softRequiredComponents).toStrictEqual([
      {
        id: 'columns',
        type: 'columns',
        key: 'columns',
        columns: [
          {
            size: 6,
            sizeMobile: 4,
            components: [
              {
                ...SOFT_REQUIRED_FILE_COMPONENT,
                id: 'file1',
                key: 'file1',
                label: 'File upload 1',
              } satisfies FileComponentSchema,
            ],
          },
          {
            size: 6,
            sizeMobile: 4,
            components: [
              {
                ...SOFT_REQUIRED_FILE_COMPONENT,
                id: 'file2',
                key: 'file2',
                label: 'File upload 2',
              } satisfies FileComponentSchema,
            ],
          },
        ],
      } satisfies ColumnsComponentSchema,
    ]);
  });

  test('getSoftRequiredFields should resolve soft required components nested in editgrid', () => {
    const components: AnyComponentSchema[] = [
      {
        type: 'editgrid',
        id: 'editgrid',
        key: 'editgrid',
        label: 'Editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Editgrid item',
        components: [
          SOFT_REQUIRED_FILE_COMPONENT,
          {
            id: 'textfield',
            key: 'textfield',
            type: 'textfield',
            label: 'Textfield',
          } satisfies TextFieldComponentSchema,
        ],
      } satisfies EditGridComponentSchema,
    ];

    const softRequiredComponents = getSoftRequiredComponents(components);
    expect(softRequiredComponents).toStrictEqual([
      {
        type: 'editgrid',
        id: 'editgrid',
        key: 'editgrid',
        label: 'Editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Editgrid item',
        components: [SOFT_REQUIRED_FILE_COMPONENT],
      } satisfies EditGridComponentSchema,
    ]);
  });

  test('getSoftRequiredFields should resolve soft required components nested in multi-level editgrid', () => {
    const components: AnyComponentSchema[] = [
      {
        type: 'editgrid',
        id: 'outerEditgrid',
        key: 'outerEditgrid',
        label: 'Outer editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Outer editgrid item',
        components: [
          {
            type: 'editgrid',
            id: 'innerEditgrid',
            key: 'innerEditgrid',
            label: 'Inner editgrid',
            disableAddingRemovingRows: false,
            groupLabel: 'Inner editgrid item',
            components: [
              SOFT_REQUIRED_FILE_COMPONENT,
              {
                id: 'textfield',
                key: 'textfield',
                type: 'textfield',
                label: 'Textfield',
              } satisfies TextFieldComponentSchema,
            ],
          },
        ],
      } satisfies EditGridComponentSchema,
    ];

    const softRequiredComponents = getSoftRequiredComponents(components);
    expect(softRequiredComponents).toStrictEqual([
      {
        type: 'editgrid',
        id: 'outerEditgrid',
        key: 'outerEditgrid',
        label: 'Outer editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Outer editgrid item',
        components: [
          {
            type: 'editgrid',
            id: 'innerEditgrid',
            key: 'innerEditgrid',
            label: 'Inner editgrid',
            disableAddingRemovingRows: false,
            groupLabel: 'Inner editgrid item',
            components: [SOFT_REQUIRED_FILE_COMPONENT],
          },
        ],
      } satisfies EditGridComponentSchema,
    ]);
  });

  test('getSoftRequiredFields should resolve soft required editgrid without children', () => {
    const components: AnyComponentSchema[] = [
      {
        type: 'editgrid',
        id: 'editgrid',
        key: 'editgrid',
        label: 'editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Editgrid item',
        components: [],
        openForms: {
          // @ts-expect-error soft required on editgrid is not officially supported yet
          softRequired: true,
        },
      } satisfies EditGridComponentSchema,
    ];

    const softRequiredComponents = getSoftRequiredComponents(components);
    expect(softRequiredComponents).toStrictEqual([
      {
        type: 'editgrid',
        id: 'editgrid',
        key: 'editgrid',
        label: 'editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Editgrid item',
        components: [],
        openForms: {
          // @ts-expect-error soft required on editgrid is not officially supported yet
          softRequired: true,
        },
      } satisfies EditGridComponentSchema,
    ]);
  });

  test('getSoftRequiredFields should resolve soft required editgrid with non-soft required children', () => {
    const components: AnyComponentSchema[] = [
      {
        type: 'editgrid',
        id: 'editgrid',
        key: 'editgrid',
        label: 'editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Editgrid item',
        components: [
          {
            type: 'textfield',
            id: 'textfield',
            key: 'textfield',
            label: 'Textfield',
          } satisfies TextFieldComponentSchema,
        ],
        openForms: {
          // @ts-expect-error soft required on editgrid is not officially supported yet
          softRequired: true,
        },
      } satisfies EditGridComponentSchema,
    ];

    const softRequiredComponents = getSoftRequiredComponents(components);
    expect(softRequiredComponents).toStrictEqual([
      {
        type: 'editgrid',
        id: 'editgrid',
        key: 'editgrid',
        label: 'editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Editgrid item',
        components: [],
        openForms: {
          // @ts-expect-error soft required on editgrid is not officially supported yet
          softRequired: true,
        },
      } satisfies EditGridComponentSchema,
    ]);
  });

  test('getSoftRequiredFields should resolve soft required editgrid with soft required children', () => {
    const components: AnyComponentSchema[] = [
      {
        type: 'editgrid',
        id: 'editgrid',
        key: 'editgrid',
        label: 'editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Editgrid item',
        components: [
          {
            type: 'textfield',
            id: 'textfield',
            key: 'textfield',
            label: 'Textfield',
            openForms: {
              // @ts-expect-error soft required on editgrid is not officially supported yet
              softRequired: true,
            },
          } satisfies TextFieldComponentSchema,
        ],
        openForms: {
          // @ts-expect-error soft required on editgrid is not officially supported yet
          softRequired: true,
        },
      } satisfies EditGridComponentSchema,
    ];

    const softRequiredComponents = getSoftRequiredComponents(components);
    expect(softRequiredComponents).toStrictEqual([
      {
        type: 'editgrid',
        id: 'editgrid',
        key: 'editgrid',
        label: 'editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Editgrid item',
        components: [
          {
            type: 'textfield',
            id: 'textfield',
            key: 'textfield',
            label: 'Textfield',
            openForms: {
              // @ts-expect-error soft required on editgrid is not officially supported yet
              softRequired: true,
            },
          } satisfies TextFieldComponentSchema,
        ],
        openForms: {
          // @ts-expect-error soft required on editgrid is not officially supported yet
          softRequired: true,
        },
      } satisfies EditGridComponentSchema,
    ]);
  });

  test('getSoftRequiredFields should only contain parents with soft required components', () => {
    const components: AnyComponentSchema[] = [
      {
        type: 'fieldset',
        id: 'fieldset',
        key: 'fieldset',
        label: 'Fieldset',
        hideHeader: false,
        components: [
          {
            id: 'textfield1',
            key: 'textfield1',
            type: 'textfield',
            label: 'Textfield',
          } satisfies TextFieldComponentSchema,
        ],
      } satisfies FieldsetComponentSchema,
      {
        id: 'columns',
        type: 'columns',
        key: 'columns',
        columns: [
          {
            size: 6,
            sizeMobile: 4,
            components: [
              {
                id: 'textfield2',
                key: 'textfield2',
                type: 'textfield',
                label: 'Textfield',
              } satisfies TextFieldComponentSchema,
            ],
          },
          {
            size: 6,
            sizeMobile: 4,
            components: [
              {
                id: 'textfield3',
                key: 'textfield3',
                type: 'textfield',
                label: 'Textfield',
              } satisfies TextFieldComponentSchema,
            ],
          },
        ],
      } satisfies ColumnsComponentSchema,
      {
        type: 'editgrid',
        id: 'outerEditgrid',
        key: 'outerEditgrid',
        label: 'Outer editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Outer editgrid item',
        components: [
          {
            id: 'textfield4',
            key: 'textfield4',
            type: 'textfield',
            label: 'Textfield',
          } satisfies TextFieldComponentSchema,
          {
            type: 'editgrid',
            id: 'innerEditgrid',
            key: 'innerEditgrid',
            label: 'Inner editgrid',
            disableAddingRemovingRows: false,
            groupLabel: 'Inner editgrid item',
            components: [
              {
                id: 'textfield5',
                key: 'textfield5',
                type: 'textfield',
                label: 'Textfield',
              } satisfies TextFieldComponentSchema,
            ],
          },
        ],
      } satisfies EditGridComponentSchema,
    ];

    const softRequiredComponents = getSoftRequiredComponents(components);
    expect(softRequiredComponents).toStrictEqual([]);
  });
});

describe('getMissingFields', () => {
  test('getMissingFields should return missing non-nested soft required fields', () => {
    const components: AnyComponentSchema[] = [
      SOFT_REQUIRED_FILE_COMPONENT,
      {
        id: 'softRequiredTextfield',
        key: 'softRequiredTextfield',
        type: 'textfield',
        label: 'Soft required textfield',
        openForms: {
          // @ts-expect-error soft required on textfield is not officially supported yet
          softRequired: true,
        },
      } satisfies TextFieldComponentSchema,
      {
        id: 'filledInSoftRequiredTextfield',
        key: 'filledInSoftRequiredTextfield',
        type: 'textfield',
        label: 'Filled in soft required textfield',
        openForms: {
          // @ts-expect-error soft required on textfield is not officially supported yet
          softRequired: true,
        },
      } satisfies TextFieldComponentSchema,
      {
        id: 'hardRequiredTextfield',
        key: 'hardRequiredTextfield',
        type: 'textfield',
        label: 'Hard required textfield',
        validate: {
          required: true,
        },
      } satisfies TextFieldComponentSchema,
      {
        id: 'optionalRequiredTextfield',
        key: 'optionalRequiredTextfield',
        type: 'textfield',
        label: 'Optional required textfield',
      } satisfies TextFieldComponentSchema,
    ];
    const values = {filledInSoftRequiredTextfield: 'some value'};

    const softRequiredComponents = getSoftRequiredComponents(components);
    const missingFields = getMissingFields(softRequiredComponents, values, getRegistryEntry);
    expect(missingFields).toStrictEqual([
      {
        label: 'File upload',
        pathToComponent: 'file',
      },
      {
        label: 'Soft required textfield',
        pathToComponent: 'softRequiredTextfield',
      },
    ]);
  });

  test('getMissingFields should return missing soft required fields nested in fieldset', () => {
    const components: AnyComponentSchema[] = [
      {
        type: 'fieldset',
        id: 'fieldset',
        key: 'fieldset',
        label: 'Fieldset',
        hideHeader: false,
        components: [
          SOFT_REQUIRED_FILE_COMPONENT,
          {
            ...SOFT_REQUIRED_FILE_COMPONENT,
            id: 'file2',
            key: 'file2',
            label: 'File upload 2',
          } satisfies FileComponentSchema,
        ],
      } satisfies FieldsetComponentSchema,
    ];
    const formValues = {
      fieldset: {},
    };

    const softRequiredComponents = getSoftRequiredComponents(components);
    const missingFields = getMissingFields(softRequiredComponents, formValues, getRegistryEntry);
    expect(missingFields).toStrictEqual([
      {
        pathToComponent: 'file',
        label: 'Fieldset > File upload',
      },
      {
        pathToComponent: 'file2',
        label: 'Fieldset > File upload 2',
      },
    ]);
  });

  test('getMissingFields should return missing soft required fields nested in columns', () => {
    const components: AnyComponentSchema[] = [
      {
        id: 'columns',
        type: 'columns',
        key: 'columns',
        columns: [
          {
            size: 6,
            sizeMobile: 4,
            components: [SOFT_REQUIRED_FILE_COMPONENT],
          },
          {
            size: 6,
            sizeMobile: 4,
            components: [
              {
                ...SOFT_REQUIRED_FILE_COMPONENT,
                id: 'file2',
                key: 'file2',
                label: 'File upload 2',
              } satisfies FileComponentSchema,
            ],
          },
        ],
      } satisfies ColumnsComponentSchema,
    ];

    const formValues = {
      columns: [],
    };

    const softRequiredComponents = getSoftRequiredComponents(components);
    const missingFields = getMissingFields(softRequiredComponents, formValues, getRegistryEntry);
    expect(missingFields).toStrictEqual([
      {
        pathToComponent: 'file',
        label: 'File upload',
      },
      {
        pathToComponent: 'file2',
        label: 'File upload 2',
      },
    ]);
  });

  test('getMissingFields should return missing soft required fields nested in editgrid', () => {
    const components: AnyComponentSchema[] = [
      {
        type: 'editgrid',
        id: 'editgrid',
        key: 'editgrid',
        label: 'Editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Editgrid item',
        components: [SOFT_REQUIRED_FILE_COMPONENT],
      } satisfies EditGridComponentSchema,
    ];

    const formValues = {
      textfield: 'simple text value',
      editgrid: [{}, {}],
    };

    const softRequiredComponents = getSoftRequiredComponents(components);
    const missingFields = getMissingFields(softRequiredComponents, formValues, getRegistryEntry);
    expect(missingFields).toStrictEqual([
      {
        pathToComponent: 'editgrid.0.file',
        label: 'Editgrid > Editgrid item 1 > File upload',
      },
      {
        pathToComponent: 'editgrid.1.file',
        label: 'Editgrid > Editgrid item 2 > File upload',
      },
    ]);
  });

  test('getMissingFields should return missing soft required fields nested in multi-level editgrid', () => {
    const components: AnyComponentSchema[] = [
      {
        type: 'editgrid',
        id: 'editgrid',
        key: 'editgrid',
        label: 'Editgrid',
        disableAddingRemovingRows: false,
        groupLabel: 'Editgrid item',
        components: [
          {
            type: 'editgrid',
            id: 'nestededitgrid',
            key: 'nestededitgrid',
            label: 'Nested editgrid',
            disableAddingRemovingRows: false,
            groupLabel: 'Nested editgrid item',
            components: [SOFT_REQUIRED_FILE_COMPONENT],
          } satisfies EditGridComponentSchema,
        ],
      } satisfies EditGridComponentSchema,
    ];

    const formValues = {
      editgrid: [
        {
          nestededitgrid: [{}, {}],
        },
        {
          nestededitgrid: [{}],
        },
      ],
    };

    const softRequiredComponents = getSoftRequiredComponents(components);
    const missingFields = getMissingFields(softRequiredComponents, formValues, getRegistryEntry);
    expect(missingFields).toStrictEqual([
      {
        pathToComponent: 'editgrid.0.nestededitgrid.0.file',
        label:
          'Editgrid > Editgrid item 1 > Nested editgrid > Nested editgrid item 1 > File upload',
      },
      {
        pathToComponent: 'editgrid.0.nestededitgrid.1.file',
        label:
          'Editgrid > Editgrid item 1 > Nested editgrid > Nested editgrid item 2 > File upload',
      },
      {
        pathToComponent: 'editgrid.1.nestededitgrid.0.file',
        label:
          'Editgrid > Editgrid item 2 > Nested editgrid > Nested editgrid item 1 > File upload',
      },
    ]);
  });
});

test.each([
  {
    component: {
      id: 'multipleTextfield',
      key: 'multipleTextfield',
      label: 'Empty multiple textfield',
      type: 'textfield',
      multiple: true,
      openForms: {
        // @ts-expect-error not officially supported yet in the types
        softRequired: true,
      },
    } satisfies TextFieldComponentSchema,
    formValue: {
      multipleTextfield: [],
    } as JSONObject,
    expected: [
      {
        pathToComponent: 'multipleTextfield',
        label: 'Empty multiple textfield',
      },
    ],
  },
  {
    component: {
      id: 'selectboxes',
      key: 'selectboxes',
      label: 'Empty selectboxes',
      type: 'selectboxes',
      defaultValue: {
        foo: false,
        bar: false,
      },
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
      openForms: {
        // @ts-expect-error not officially supported yet in the types
        softRequired: true,
      },
    } satisfies SelectboxesComponentSchema,
    formValue: {
      selectboxes: {
        foo: false,
        bar: false,
      },
    } as JSONObject,
    expected: [
      {
        pathToComponent: 'selectboxes',
        label: 'Empty selectboxes',
      },
    ],
  },
  {
    component: {
      id: 'radio',
      key: 'radio',
      label: 'Empty radio',
      type: 'radio',
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
      openForms: {
        // @ts-expect-error not officially supported yet in the types
        softRequired: true,
      },
    } satisfies RadioComponentSchema,
    formValue: {
      radio: '',
    } as JSONObject,
    expected: [
      {
        pathToComponent: 'radio',
        label: 'Empty radio',
      },
    ],
  },
  {
    component: {
      id: 'select',
      key: 'select',
      label: 'Empty select',
      type: 'select',
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
      openForms: {
        // @ts-expect-error not officially supported yet in the types
        softRequired: true,
      },
    } satisfies SelectComponentSchema,
    formValue: {},
    expected: [
      {
        pathToComponent: 'select',
        label: 'Empty select',
      },
    ],
  },
  {
    component: {
      id: 'checkbox',
      key: 'checkbox',
      label: 'Empty checkbox',
      type: 'checkbox',
      defaultValue: false,
      openForms: {
        // @ts-expect-error not officially supported yet in the types
        softRequired: true,
      },
    } satisfies CheckboxComponentSchema,
    formValue: {
      select: '',
    } as JSONObject,
    expected: [
      {
        pathToComponent: 'checkbox',
        label: 'Empty checkbox',
      },
    ],
  },
  {
    component: {
      type: 'editgrid',
      id: 'editgrid',
      key: 'editgrid',
      label: 'Empty editgrid',
      disableAddingRemovingRows: false,
      groupLabel: 'Editgrid item',
      components: [],
      openForms: {
        // @ts-expect-error not officially supported yet in the types
        softRequired: true,
      },
    } satisfies EditGridComponentSchema,
    formValue: {
      editgrid: [],
    },
    expected: [
      {
        pathToComponent: 'editgrid',
        label: 'Empty editgrid',
      },
    ],
  },
  {
    component: {
      type: 'editgrid',
      id: 'editgrid',
      key: 'editgrid',
      label: 'Empty editgrid with children',
      disableAddingRemovingRows: false,
      groupLabel: 'Editgrid item',
      components: [
        {
          type: 'textfield',
          id: 'textfield',
          key: 'textfield',
          label: 'Textfield',
          openForms: {
            // @ts-expect-error not officially supported yet in the types
            softRequired: true,
          },
        } satisfies TextFieldComponentSchema,
      ],
      openForms: {
        // @ts-expect-error not officially supported yet in the types
        softRequired: true,
      },
    } satisfies EditGridComponentSchema,
    formValue: {
      editgrid: [],
    } as JSONObject,
    expected: [
      {
        pathToComponent: 'editgrid',
        label: 'Empty editgrid with children',
      },
    ],
  },
  {
    component: {
      type: 'editgrid',
      id: 'editgrid',
      key: 'editgrid',
      label: 'Editgrid with empty children',
      disableAddingRemovingRows: false,
      groupLabel: 'Editgrid item',
      components: [
        {
          type: 'textfield',
          id: 'textfield',
          key: 'textfield',
          label: 'Textfield',
          openForms: {
            // @ts-expect-error not officially supported yet in the types
            softRequired: true,
          },
        } satisfies TextFieldComponentSchema,
      ],
      openForms: {
        // @ts-expect-error not officially supported yet in the types
        softRequired: true,
      },
    } satisfies EditGridComponentSchema,
    formValue: {
      editgrid: [
        {
          textfield: '',
        },
      ],
    } as JSONObject,
    expected: [
      {
        label: 'Editgrid with empty children',
        pathToComponent: 'editgrid',
      },
      {
        pathToComponent: 'editgrid.0.textfield',
        label: 'Editgrid with empty children > Editgrid item 1 > Textfield',
      },
    ],
  },
])(
  '$component.label soft required components should be reported',
  ({component, formValue, expected}) => {
    const components: AnyComponentSchema[] = [component as unknown as AnyComponentSchema];

    const softRequiredComponents = getSoftRequiredComponents(components);
    const missingFields = getMissingFields(softRequiredComponents, formValue, getRegistryEntry);
    expect(missingFields).toStrictEqual(expected);
  }
);
