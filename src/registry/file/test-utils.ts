import type {FileComponentSchema} from '@open-formulieren/types';

import type {FormikFileUpload} from './types';

export const FILE_COMPONENT_BOILERPLATE: Pick<
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
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.rar'
  | 'application/zip'
  | 'image/heic'
  | 'image/jpeg'
  | 'image/png'
  | 'text/csv'
  | 'text/plain'
  | '*';

const MIME_TO_LABEL: Record<ExampleMimeType, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.rar': '.rar',
  'application/zip': '.zip',
  'image/heic': '.heic',
  'image/jpeg': '.jpeg',
  'image/png': '.png',
  'text/csv': '.csv',
  'text/plain': '.txt',
  '*': 'any file type',
};

export const getFileConfiguration = (
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

interface FileFactoryOpts {
  name: string;
  size: number;
  type: ExampleMimeType;
  state: FormikFileUpload['state'] | undefined;
  omitClientState?: boolean;
}

export const buildFile = (
  opts: FileFactoryOpts,
  overrides?: Partial<FormikFileUpload>
): FormikFileUpload => {
  const {name, size, type, state, omitClientState = false} = opts;

  const uniqueUUID = window.crypto.randomUUID();
  const url = `https://example.com/temporary-file-uploads/${uniqueUUID}`;
  const extension = name.split('.').pop() || 'bin';
  const fileData: FormikFileUpload = {
    data: {
      url,
      form: '',
      name: `${uniqueUUID}.${extension}`,
      size,
      baseUrl: 'https://example.com/',
      project: '',
    },
    name: '',
    originalName: name,
    size,
    storage: 'url',
    type,
    url,
    ...overrides,
  };
  if (!omitClientState) {
    fileData.state = overrides?.state ?? state;
    fileData.clientId = overrides?.clientId ?? uniqueUUID;
  }
  return fileData;
};
