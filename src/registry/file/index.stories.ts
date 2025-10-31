import type {FileComponentSchema, FileUploadData} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';

import type {FormSettings} from '@/context';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import {FormioFile} from './';

// import ValueDisplay from './ValueDisplay';

const FILE_COMPONENT_BOILERPLATE: Pick<
  FileComponentSchema,
  'webcam' | 'options' | 'storage' | 'url'
> = {
  webcam: false,
  options: {
    withCredentials: true,
  },
  storage: 'url',
  url: 'https://example.com/ignored/upload/dummy',
};

type ExampleMimeType =
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.rar'
  | 'application/zip'
  | 'image/heic'
  | 'image/jpeg'
  | 'image/png'
  | 'text/csv'
  | 'text/plain';

const MIME_TO_LABEL: Record<ExampleMimeType, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.rar': '.rar',
  'application/zip': '.zip',
  'image/heic': '.heic',
  'image/jpeg': '.jpeg',
  'image/png': '.png',
  'text/csv': '.csv',
  'text/plain': '.txt',
};

const getFileConfiguration = (
  mimeTypes: ExampleMimeType[]
): Pick<FileComponentSchema, 'file' | 'filePattern'> => {
  const patternString = mimeTypes.join(',');
  const labels = mimeTypes.map(mimeType => MIME_TO_LABEL[mimeType]);
  return {
    filePattern: patternString,
    file: {
      name: '', // used by the backend as a file name template
      type: mimeTypes,
      allowedTypesLabels: labels,
    },
  };
};

export default {
  title: 'Component registry / basic / file',
  component: FormioFile,
  decorators: [withFormSettingsProvider, withFormik],
  parameters: {
    formSettings: {
      componentParameters: {
        // TODO - add mocks for upload endpoint in due time
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
          file: [] satisfies FileUploadData[],
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
          file: [] satisfies FileUploadData[],
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
            {
              data: {
                url: 'https://example.com/temporary-file-uploads/cfc5de78-c451-4bef-af22-4bf0e0768f57',
                form: '',
                name: 'cfc5de78-c451-4bef-af22-4bf0e0768f57.pdf',
                size: 137000, // 137 kB
                baseUrl: 'https://example.com/',
                project: '',
              },
              name: '',
              originalName: 'file-1.pdf',
              size: 137000, // 137 kB
              storage: 'url',
              type: 'application/pdf',
              url: 'https://example.com/temporary-file-uploads/cfc5de78-c451-4bef-af22-4bf0e0768f57',
            },
          ] satisfies FileUploadData[],
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
            {
              data: {
                url: 'https://example.com/temporary-file-uploads/cfc5de78-c451-4bef-af22-4bf0e0768f57',
                form: '',
                name: 'cfc5de78-c451-4bef-af22-4bf0e0768f57.pdf',
                size: 137000, // 137 kB
                baseUrl: 'https://example.com/',
                project: '',
              },
              name: '',
              originalName: 'file-1.pdf',
              size: 137000, // 137 kB
              storage: 'url',
              type: 'application/pdf',
              url: 'https://example.com/temporary-file-uploads/cfc5de78-c451-4bef-af22-4bf0e0768f57',
            },
            {
              data: {
                url: 'https://example.com/temporary-file-uploads/8ffc2b89-cc40-4da9-824d-da0042b52f05',
                form: '',
                name: '8ffc2b89-cc40-4da9-824d-da0042b52f05.doc',
                size: 1024 * 1000 * 1000, // 1 MB
                baseUrl: 'https://example.com/',
                project: '',
              },
              name: '',
              originalName: 'file-2.doc',
              size: 1024 * 1000 * 1000, // 1 MB
              storage: 'url',
              type: 'application/msword',
              url: 'https://example.com/temporary-file-uploads/8ffc2b89-cc40-4da9-824d-da0042b52f05',
            },
          ] satisfies FileUploadData[],
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
          file: [] satisfies FileUploadData[],
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
            {
              data: {
                url: 'https://example.com/temporary-file-uploads/cfc5de78-c451-4bef-af22-4bf0e0768f57',
                form: '',
                name: 'cfc5de78-c451-4bef-af22-4bf0e0768f57.pdf',
                size: 137000, // 137 kB
                baseUrl: 'https://example.com/',
                project: '',
              },
              name: '',
              originalName: 'file-1.pdf',
              size: 137000, // 137 kB
              storage: 'url',
              type: 'application/pdf',
              url: 'https://example.com/temporary-file-uploads/cfc5de78-c451-4bef-af22-4bf0e0768f57',
            },
          ] satisfies FileUploadData[],
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
