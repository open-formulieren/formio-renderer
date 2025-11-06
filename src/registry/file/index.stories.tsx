import type {FileComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import type {FormSettings} from '@/context';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';
import type {JSONObject} from '@/types';

import {FormioFile} from './';
import ValueDisplay from './ValueDisplay';
import {FILE_COMPONENT_BOILERPLATE, buildFile, getFileConfiguration} from './test-utils';
import type {FormikFileUpload} from './types';

export default {
  title: 'Component registry / basic / file',
  component: FormioFile,
  decorators: [withFormSettingsProvider, withFormik],
  parameters: {
    formSettings: {
      componentParameters: {
        file: {
          upload: async () => {
            const uuid = window.crypto.randomUUID();
            return {
              result: 'success',
              url: `https://example.com/api/v2/uploads/${uuid}`,
            };
          },
          destroy: async () => {},
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
} satisfies Meta<typeof FormioFile>;

type Story = StoryObj<typeof FormioFile>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      ...FILE_COMPONENT_BOILERPLATE,
      ...getFileConfiguration(['application/pdf', 'application/msword']),
      id: 'component1',
      type: 'file',
      key: 'my.file',
      label: 'Your file',
    } satisfies FileComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          file: [] satisfies FormikFileUpload[],
        },
      },
    },
  },
};

export const WithDescriptionAndTooltip: Story = {
  args: {
    componentDefinition: {
      ...FILE_COMPONENT_BOILERPLATE,
      ...getFileConfiguration(['application/pdf', 'application/msword']),
      id: 'component1',
      type: 'file',
      key: 'my.file',
      label: 'Your file',
      tooltip: 'Surprise!',
      description: 'A description',
    } satisfies FileComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          file: [] satisfies FormikFileUpload[],
        },
      },
    },
  },
};

export const SingleFileUpload: Story = {
  args: {
    componentDefinition: {
      ...FILE_COMPONENT_BOILERPLATE,
      ...getFileConfiguration(['application/pdf', 'application/msword']),
      id: 'component1',
      type: 'file',
      key: 'my.file',
      label: 'Your file',
      description: 'Click or drag a file to upload.',
      maxNumberOfFiles: 1,
      multiple: false,
    } satisfies FileComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          file: [
            buildFile({
              name: 'file-1.pdf',
              size: 137000, // 137 kB
              type: 'application/pdf',
              state: 'success',
            }),
          ],
        },
      },
    },
  },
};

export const MultipleFilesUpload: Story = {
  args: {
    componentDefinition: {
      ...FILE_COMPONENT_BOILERPLATE,
      ...getFileConfiguration(['application/pdf', 'application/msword']),
      id: 'component1',
      type: 'file',
      key: 'my.file',
      label: 'Your file',
      description: 'Click or drag a file to upload.',
      multiple: true,
    } satisfies FileComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          file: [
            buildFile({
              name: 'file-1.pdf',
              size: 137000, // 137 kB
              type: 'application/pdf',
              state: 'success',
            }),
            buildFile({
              name: 'file-2.doc',
              size: 1024 * 1000 * 1000, // 1 MB
              type: 'application/msword',
              state: 'pending',
            }),
          ],
        },
      },
    },
  },
};

export const WithRestrictions: Story = {
  args: {
    componentDefinition: {
      ...FILE_COMPONENT_BOILERPLATE,
      ...getFileConfiguration(['image/jpeg', 'image/png', 'image/heic']),
      id: 'component1',
      type: 'file',
      key: 'my.file',
      label: 'Your file',
      description: 'Click or drag a file to upload.',
      maxNumberOfFiles: 3,
      multiple: true,
      fileMaxSize: '2 MB',
    } satisfies FileComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          file: [
            buildFile({
              name: 'screenshot.png',
              size: 137000, // 137 kB
              type: 'image/png',
              state: 'success',
            }),
          ],
        },
      },
    },
  },
};

export const MaxFilesLimitReached: Story = {
  args: {
    componentDefinition: {
      ...FILE_COMPONENT_BOILERPLATE,
      ...getFileConfiguration(['image/jpeg', 'image/png', 'image/heic']),
      id: 'component1',
      type: 'file',
      key: 'my.file',
      label: 'Your file',
      description: 'Upload button/dropzone not shown if the file limit is reached',
      maxNumberOfFiles: 3,
      multiple: true,
    } satisfies FileComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          file: [
            buildFile({
              name: 'screenshot1.png',
              size: 137000, // 137 kB
              type: 'image/png',
              state: 'success',
            }),
            buildFile({
              name: 'screenshot2.png',
              size: 137000, // 137 kB
              type: 'image/png',
              state: 'success',
            }),
            buildFile({
              name: 'screenshot3.png',
              size: 137000, // 137 kB
              type: 'image/png',
              state: 'success',
            }),
          ],
        },
      },
    },
  },
};

export const DisplayComponentValidationError: Story = {
  args: WithDescriptionAndTooltip.args,
  parameters: {
    formik: {
      initialValues: {
        my: {
          file: [] satisfies FormikFileUpload[],
        },
      },
      initialTouched: {
        my: {
          file: true,
        },
      },
      initialErrors: {
        my: {
          file: 'The combined file upload size exceeds the 10MB limit.',
        },
      },
    },
  },
};

export const DisplayFileValidationError: Story = {
  args: WithDescriptionAndTooltip.args,
  parameters: {
    formik: {
      initialValues: {
        my: {
          file: [
            buildFile({
              name: 'file-1.pdf',
              size: 137000, // 137 kB
              type: 'application/pdf',
              state: 'error',
            }),
          ],
        },
      },
      initialTouched: {
        my: {
          file: true,
        },
      },
      initialErrors: {
        my: {
          file: ['A virus was detected in this file.'],
        },
      },
    },
  },
};

export const SimulateBackendRejection: Story = {
  ...MinimalConfiguration,
  parameters: {
    ...MinimalConfiguration.parameters,
    formSettings: {
      componentParameters: {
        file: {
          upload: async () => ({
            result: 'failed',
            errors: ['Simulated backend error.'],
          }),
          destroy: async () => {},
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: FileComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
  values?: JSONObject;
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

/**
 * Base story for validation tests/interactions.
 *
 * Any file ending with the `.docx` extension is rejected by the "backend", other files
 * have a success state.
 */
const BaseValidationStory: ValidationStory = {
  render: renderComponentInForm,
  parameters: {
    formik: {
      disable: true,
    },
    formSettings: {
      componentParameters: {
        file: {
          upload: async (file: File) => {
            if (file.name.toLowerCase().endsWith('.docx')) {
              return {
                result: 'failed',
                errors: ['Backend blocks .docx files.'],
              };
            }
            return {
              result: 'success',
              url: `https://example.com/api/v2/uploads/${window.crypto.randomUUID()}`,
            };
          },
          destroy: async () => {},
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
};

export const ValidateMaxSizeAndMaxNumberOfFiles: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      ...FILE_COMPONENT_BOILERPLATE,
      ...getFileConfiguration([
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]),
      id: 'component1',
      type: 'file',
      key: 'my.file',
      label: 'Your file',
      multiple: true,
      maxNumberOfFiles: 2,
      fileMaxSize: '3 kB',
    } satisfies FileComponentSchema,
    values: {
      my: {
        file: [
          buildFile({
            name: 'file-1.pdf',
            size: 1024 * 2,
            type: 'application/pdf',
            state: 'success',
          }),
          buildFile({
            name: 'file-2.pdf',
            size: 1024 * 1,
            type: 'application/pdf',
            state: 'success',
          }),
          buildFile({
            name: 'file-3.docx',
            size: 1024 * 2.1,
            type: 'application/pdf',
            state: undefined,
          }),
          buildFile({name: 'file-4.docx', size: 1024 * 4, type: 'application/pdf', state: 'error'}),
        ] as unknown as JSONObject[],
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('link', {name: 'file-1.pdf'})).toBeVisible();
    expect(canvas.getByRole('link', {name: 'file-2.pdf'})).toBeVisible();
    expect(canvas.getByRole('link', {name: 'file-3.docx'})).toBeVisible();
    expect(canvas.getByRole('link', {name: 'file-4.docx'})).toBeVisible();

    // Initially, there are file-level validation errors, these get displayed before the
    // field-level errors.
    await step('Trigger errors for initial values', async () => {
      await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
      expect(await canvas.findByText(/The file must be smaller than 3 kB./)).toBeVisible();
    });

    await step('Remove file with individual error(s) reveals field-level errors', async () => {
      const removeButton = canvas.getByRole('button', {name: `Remove 'file-4.docx'`});
      await userEvent.click(removeButton);

      // validation should be triggered and we see the field-level error
      expect(
        await canvas.findByText('Too many files uploaded. You can upload up to 2 files.')
      ).toBeVisible();
    });
  },
};

export const ValidateNoPendingOrErroredUploads: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      ...FILE_COMPONENT_BOILERPLATE,
      ...getFileConfiguration([
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]),
      id: 'component1',
      type: 'file',
      key: 'my.file',
      label: 'Your file',
      multiple: true,
    } satisfies FileComponentSchema,
    values: {
      my: {
        file: [
          buildFile({
            name: 'file-1.pdf',
            size: 1024 ** 1,
            type: 'application/pdf',
            state: 'pending',
          }),
          buildFile({name: 'file-2.pdf', size: 1024 ** 1, type: 'application/pdf', state: 'error'}),
        ] as unknown as JSONObject[],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findAllByText('The upload must be completed before you can continue.')
    ).toHaveLength(2);
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: FileComponentSchema;
  value: FormikFileUpload[];
}

type ValueDisplayStory = StoryObj<ValueDisplayStoryArgs>;

const BaseValueDisplayStory: ValueDisplayStory = {
  render: args => <ValueDisplay {...args} />,
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const SingleValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      ...FILE_COMPONENT_BOILERPLATE,
      ...getFileConfiguration([
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]),
      id: 'component1',
      type: 'file',
      key: 'my.file',
      label: 'Your file',
      multiple: false,
    } satisfies FileComponentSchema,
    value: [
      buildFile({
        name: 'my-single-upload.doc',
        type: 'application/msword',
        size: 123,
        state: undefined,
      }),
    ],
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      ...FILE_COMPONENT_BOILERPLATE,
      ...getFileConfiguration([
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]),
      id: 'component1',
      type: 'file',
      key: 'my.file',
      label: 'Your file',
      multiple: true,
    } satisfies FileComponentSchema,
    value: [
      buildFile({
        name: 'attachment one with $pecial character<s>.doc',
        type: 'application/msword',
        size: 123,
        state: undefined,
        omitClientState: true,
      }),
      buildFile({
        name: 'I made a PDF.png',
        type: 'image/png',
        size: 123,
        state: 'success',
      }),
    ],
  },
};

export const EmptyValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      ...FILE_COMPONENT_BOILERPLATE,
      ...getFileConfiguration([
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]),
      id: 'component1',
      type: 'file',
      key: 'my.file',
      label: 'Your file',
    } satisfies FileComponentSchema,
    value: [],
  },
};
