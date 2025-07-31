import {
  type AnyComponentSchema,
  type ColumnsComponentSchema,
  type EditGridComponentSchema,
  type FieldsetComponentSchema,
  type FileComponentSchema,
  type TextFieldComponentSchema,
} from '@open-formulieren/types';
import {describe, expect, it} from 'vitest';

import {getMissingFields, getSoftRequiredComponents} from './utils';

const SOFT_REQUIRED_FILE_COMPONENT = {
  id: 'file',
  key: 'file',
  type: 'file',
  label: 'File upload',
  webcam: false,
  storage: 'url',
  url: '',
  file: {
    name: '',
    type: [],
    allowedTypesLabels: [],
  },
  options: {
    withCredentials: true,
  },
  filePattern: '.jpg',
  multiple: false,
  openForms: {
    translations: {},
    softRequired: true,
  },
} satisfies FileComponentSchema;

describe('getSoftRequiredFields', () => {
  it('should resolve non-nested soft required components', () => {
    const components: AnyComponentSchema[] = [
      {
        ...SOFT_REQUIRED_FILE_COMPONENT,
        id: 'file',
        key: 'file',
        label: 'File upload',
      } satisfies FileComponentSchema,
      {
        id: 'softRequiredTextfield',
        key: 'softRequiredTextfield',
        type: 'textfield',
        label: 'Soft required textfield',
        defaultValue: '',
        openForms: {
          // @ts-ignore
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
    expect(softRequiredComponents).toStrictEqual([
      {
        ...SOFT_REQUIRED_FILE_COMPONENT,
        id: 'file',
        key: 'file',
        label: 'File upload',
      } satisfies FileComponentSchema,
      {
        id: 'softRequiredTextfield',
        key: 'softRequiredTextfield',
        type: 'textfield',
        label: 'Soft required textfield',
        defaultValue: '',
        openForms: {
          // @ts-ignore
          softRequired: true,
        },
      } satisfies TextFieldComponentSchema,
    ]);
  });

  it('should resolve soft required components nested in fieldset', () => {
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

  it('should resolve soft required components nested in columns', () => {
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

  it('should resolve soft required components nested in editgrid', () => {
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
            ...SOFT_REQUIRED_FILE_COMPONENT,
            id: 'file',
            key: 'file',
            label: 'File upload',
          } satisfies FileComponentSchema,
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
        components: [
          {
            ...SOFT_REQUIRED_FILE_COMPONENT,
            id: 'file',
            key: 'file',
            label: 'File upload',
          } satisfies FileComponentSchema,
        ],
      } satisfies EditGridComponentSchema,
    ]);
  });

  it('should resolve soft required components nested in multi-level editgrid', () => {
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
              {
                ...SOFT_REQUIRED_FILE_COMPONENT,
                id: 'file',
                key: 'file',
                label: 'File upload',
              } satisfies FileComponentSchema,
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
            components: [
              {
                ...SOFT_REQUIRED_FILE_COMPONENT,
                id: 'file',
                key: 'file',
                label: 'File upload',
              } satisfies FileComponentSchema,
            ],
          },
        ],
      } satisfies EditGridComponentSchema,
    ]);
  });

  it('should only contain parents with soft required components', () => {
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

describe('regular getMissingFields', () => {
  it('should return missing non-nested soft required fields', () => {
    const components: AnyComponentSchema[] = [
      {
        ...SOFT_REQUIRED_FILE_COMPONENT,
        id: 'file',
        key: 'file',
        label: 'File upload',
      } satisfies FileComponentSchema,
      {
        id: 'softRequiredTextfield',
        key: 'softRequiredTextfield',
        type: 'textfield',
        label: 'Soft required textfield',
        openForms: {
          // @ts-ignore
          softRequired: true,
        },
      } satisfies TextFieldComponentSchema,
      {
        id: 'filledInSoftRequiredTextfield',
        key: 'filledInSoftRequiredTextfield',
        type: 'textfield',
        label: 'Filled in soft required textfield',
        openForms: {
          // @ts-ignore
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
    const missingFields = getMissingFields(softRequiredComponents, values);
    expect(missingFields).toStrictEqual([
      {
        pathToComponent: 'file',
        label: 'File upload',
      },
      {
        pathToComponent: 'softRequiredTextfield',
        label: 'Soft required textfield',
      },
    ]);
  });

  it('should return missing soft required fields nested in fieldset', () => {
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
            id: 'file',
            key: 'file',
            label: 'File upload',
          } satisfies FileComponentSchema,
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
    const missingFields = getMissingFields(softRequiredComponents, formValues);
    expect(missingFields).toStrictEqual([
      {
        pathToComponent: 'fieldset.file',
        label: 'Fieldset > File upload',
      },
      {
        pathToComponent: 'fieldset.file2',
        label: 'Fieldset > File upload 2',
      },
    ]);
  });

  it('should return missing soft required fields nested in columns', () => {
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
                id: 'file',
                key: 'file',
                label: 'File upload',
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
    ];

    const formValues = {
      columns: [],
    };

    const softRequiredComponents = getSoftRequiredComponents(components);
    const missingFields = getMissingFields(softRequiredComponents, formValues);
    expect(missingFields).toStrictEqual([
      {
        pathToComponent: 'columns.0.file',
        label: 'File upload',
      },
      {
        pathToComponent: 'columns.1.file2',
        label: 'File upload 2',
      },
    ]);
  });

  it('should return missing soft required fields nested in editgrid', () => {
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
            ...SOFT_REQUIRED_FILE_COMPONENT,
            id: 'file',
            key: 'file',
            label: 'File upload',
          } satisfies FileComponentSchema,
        ],
      } satisfies EditGridComponentSchema,
    ];

    const formValues = {
      textfield: 'simple text value',
      editgrid: [{}, {}],
    };

    const softRequiredComponents = getSoftRequiredComponents(components);
    const missingFields = getMissingFields(softRequiredComponents, formValues);
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

  it('should return missing soft required fields nested in multi-level editgrid', () => {
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
            components: [
              {
                ...SOFT_REQUIRED_FILE_COMPONENT,
                id: 'file',
                key: 'file',
                label: 'File upload',
              } satisfies FileComponentSchema,
            ],
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
    const missingFields = getMissingFields(softRequiredComponents, formValues);
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
