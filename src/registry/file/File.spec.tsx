import type {FileComponentSchema} from '@open-formulieren/types';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ErrorMessage, FieldArray, Formik} from 'formik';
import type {ArrayHelpers} from 'formik';
import {ErrorCode} from 'react-dropzone';
import type {FileRejection, FileWithPath} from 'react-dropzone';
import {IntlProvider} from 'react-intl';
import {afterAll, afterEach, beforeAll, beforeEach, expect, test, vi} from 'vitest';

import FormSettingsProvider from '@/components/FormSettingsProvider';

import {useFileUploads} from './hooks';
import {getFileConfiguration} from './test-utils';
import type {FileParameters, FormikFileUpload} from './types';

const BASE_COMPONENT: FileComponentSchema = {
  ...getFileConfiguration(['application/pdf']),
  id: 'component1',
  type: 'file',
  key: 'attachments',
  label: 'Attachments',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_PARAMETERS: FileParameters = {
  upload: async (file: File) => {
    const simulateFailure = file.name.toLowerCase().includes('error');
    // simulate network IO - a file upload taking 200ms
    await sleep(200);

    if (simulateFailure) {
      return {
        result: 'failed',
        errors: ['Backend error 1.', 'Backend error 2.'],
      };
    } else {
      const uuid = window.crypto.randomUUID();
      return {
        result: 'success',
        url: `https://example.com/api/v2/uploads/${uuid}`,
      };
    }
  },
  // just simulate network IO
  destroy: async () => {
    await sleep(100);
  },
};

interface TestComponentContainerProps {
  componentDefinition: FileComponentSchema;
  simulatedUploads?: (File | FileRejection)[];
  parameters?: FileParameters;
}

const TestComponentContainer: React.FC<TestComponentContainerProps> = ({
  componentDefinition,
  simulatedUploads,
  parameters = DEFAULT_PARAMETERS,
}) => {
  const {key: name} = componentDefinition;
  return (
    <IntlProvider locale="en" messages={{}}>
      <FormSettingsProvider
        components={[componentDefinition]}
        componentParameters={{file: parameters}}
      >
        <Formik<{[k: string]: FormikFileUpload[]}>
          onSubmit={vi.fn()}
          initialValues={{[name]: []}}
          validateOnBlur={false}
          validateOnChange={false}
        >
          {({values}) => (
            <FieldArray name={name}>
              {arrayHelpers => (
                <TestComponent
                  componentDefinition={componentDefinition}
                  arrayHelpers={arrayHelpers}
                  uploads={values[name]}
                  simulatedUploads={simulatedUploads}
                />
              )}
            </FieldArray>
          )}
        </Formik>
      </FormSettingsProvider>
    </IntlProvider>
  );
};

interface TestComponentProps {
  componentDefinition: FileComponentSchema;
  arrayHelpers: ArrayHelpers<FormikFileUpload[]>;
  uploads: FormikFileUpload[];
  simulatedUploads?: (File | FileRejection)[];
}

const TestComponent: React.FC<TestComponentProps> = ({
  componentDefinition,
  arrayHelpers,
  uploads,
  simulatedUploads = [],
}) => {
  const {onFilesAdded, onFileRemove, localUploadErrors} = useFileUploads(
    componentDefinition.key,
    componentDefinition,
    arrayHelpers
  );
  return (
    <>
      <button type="button" onClick={() => onFilesAdded(simulatedUploads)}>
        Simulate upload
      </button>

      <button
        type="button"
        onClick={() =>
          onFilesAdded(
            simulatedUploads.map(f => ({
              file: f as FileWithPath,
              errors: [{code: ErrorCode.TooManyFiles, message: ''}],
            }))
          )
        }
      >
        Simulate TooManyFiles
      </button>

      <ul aria-label="uploads">
        {uploads.map((upload, index) => (
          <li key={upload.clientId || upload.url} data-state={upload.state}>
            {upload.originalName}
            <button type="button" onClick={() => onFileRemove(upload.clientId || upload.url)}>
              Remove upload {index}
            </button>
          </li>
        ))}
      </ul>

      <div>
        {Object.values(localUploadErrors).map((error, index) => (
          <span key={index}>{error}</span>
        ))}
      </div>

      <div data-testid="field-error">{<ErrorMessage name={componentDefinition.key} />}</div>
    </>
  );
};

const createObjectURLMock = vi.fn(() => 'blob:mock-url');
const revokeObjectURLMock = vi.fn();

// mock URL.createObjectURL since jsdom doesn't implement it.
beforeAll(() => {
  vi.stubGlobal('jest', {
    advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
  });

  if (URL.createObjectURL !== undefined) throw new Error('Mock not necessary anymore?');
  URL.createObjectURL = createObjectURLMock;
  URL.revokeObjectURL = revokeObjectURLMock;
});

beforeEach(() => {
  createObjectURLMock.mockReset();
  revokeObjectURLMock.mockReset();
});

afterEach(() => {
  if (vi.isFakeTimers()) {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  }
});

afterAll(() => {
  vi.unstubAllGlobals();
});

test('successful uploads are correctly added to the state', async () => {
  vi.useFakeTimers();
  const user = userEvent.setup({
    // Let user-event advance timers it sets under the hood, using Vitest’s fake timers
    advanceTimers: vi.advanceTimersByTime,
  });
  const component: FileComponentSchema = {...BASE_COMPONENT, multiple: true};
  const uploads: File[] = [
    new File(['dummy'], 'dummy1.pdf', {type: 'application/pdf'}),
    new File(['dummy'], 'dummy2.pdf', {type: 'application/pdf'}),
  ];

  render(<TestComponentContainer componentDefinition={component} simulatedUploads={uploads} />);

  // initially, no uploads are displayed
  const uploadsList = screen.queryAllByRole('listitem');
  expect(uploadsList).toHaveLength(0);

  await user.click(screen.getByRole('button', {name: 'Simulate upload'}));

  const pendingUploadsList = screen.queryAllByRole('listitem');
  expect(pendingUploadsList).toHaveLength(2);
  for (const pendingUpload of pendingUploadsList) {
    expect(pendingUpload.dataset.state).toBe('pending');
  }
  expect(URL.createObjectURL).toHaveBeenCalledTimes(2);

  // Let the mock upload complete so that it arrives in its state update machinery
  await vi.advanceTimersByTimeAsync(200);

  // verify that the states have been updated
  const completedUploadsList = screen.queryAllByRole('listitem');
  expect(completedUploadsList).toHaveLength(2);
  expect(completedUploadsList[0].dataset.state).toBe('success');
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
});

test('failed uploads are correctly updated in the state', async () => {
  vi.useFakeTimers();
  const user = userEvent.setup({
    // Let user-event advance timers it sets under the hood, using Vitest’s fake timers
    advanceTimers: vi.advanceTimersByTime,
  });
  const component: FileComponentSchema = {...BASE_COMPONENT, multiple: true};
  const uploads: File[] = [
    new File(['dummy'], 'error.pdf', {type: 'application/pdf'}),
    new File(['dummy'], 'dummy2.pdf', {type: 'application/pdf'}),
  ];

  render(<TestComponentContainer componentDefinition={component} simulatedUploads={uploads} />);

  // initially, no uploads are displayed
  const uploadsList = screen.queryAllByRole('listitem');
  expect(uploadsList).toHaveLength(0);

  await user.click(screen.getByRole('button', {name: 'Simulate upload'}));

  const pendingUploadsList = screen.queryAllByRole('listitem');
  expect(pendingUploadsList).toHaveLength(2);
  for (const pendingUpload of pendingUploadsList) {
    expect(pendingUpload.dataset.state).toBe('pending');
  }
  expect(URL.createObjectURL).toHaveBeenCalledTimes(2);

  // Let the mock upload complete so that it arrives in its state update machinery
  await vi.advanceTimersByTimeAsync(200);

  // wait for the upload to complete and verify that the states have been updated
  await waitFor(async () => {
    const completedUploadsList = screen.queryAllByRole('listitem');
    expect(completedUploadsList).toHaveLength(2);
    expect(completedUploadsList[0].dataset.state).toBe('error');
    expect(completedUploadsList[1].dataset.state).toBe('success');
  });
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);

  expect(screen.getByText(/Backend error 1./)).toBeVisible();
  expect(screen.getByText(/Backend error 2./)).toBeVisible();
});

test('remove file while uploading', async () => {
  vi.useFakeTimers();
  const user = userEvent.setup({
    // Let user-event advance timers it sets under the hood, using Vitest’s fake timers
    advanceTimers: vi.advanceTimersByTime,
  });
  const upload: File = new File(['dummy'], 'dummy.pdf', {type: 'application/pdf'});

  render(
    <TestComponentContainer componentDefinition={BASE_COMPONENT} simulatedUploads={[upload]} />
  );

  // these race against each other, where the remove finishes before the upload completes
  await user.click(screen.getByRole('button', {name: 'Simulate upload'}));
  await user.click(screen.getByRole('button', {name: 'Remove upload 0'}));

  // Let the mock upload complete so that it arrives in its state update machinery
  await vi.advanceTimersByTimeAsync(200);

  expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
});

test('process file rejection eagerly', async () => {
  const user = userEvent.setup();
  const upload: FileRejection = {
    file: new File(['dummy'], 'dummy.png', {type: 'image/png'}),
    errors: [
      // the error messages are built based on the code, so the react-dropzone messages
      // are effectively discarded
      {code: ErrorCode.FileInvalidType, message: '-ignored-'},
      {code: ErrorCode.FileTooLarge, message: '-ignored-'},
      {code: ErrorCode.FileTooSmall, message: '-ignored-'},
      // ErrorCode.TooManyFiles is special cased, see the next test
      {code: 'arbitrary', message: 'Not ignored.'},
    ],
  };

  render(
    <TestComponentContainer
      componentDefinition={{...BASE_COMPONENT, fileMaxSize: '1 MB', maxNumberOfFiles: 3}}
      simulatedUploads={[upload]}
    />
  );

  // these race against each other, where the remove finishes before the upload completes
  await user.click(screen.getByRole('button', {name: 'Simulate upload'}));

  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  const erroredUpload = screen.getByRole('listitem');
  expect(erroredUpload.dataset.state).toBe('error');

  // check that our transformed error messages are present.
  expect(
    screen.getByText(/The uploaded file type is not an allowed type. It must be \.pdf\./)
  ).toBeVisible();
  expect(screen.getByText(/The file must be smaller than 1 MB\./)).toBeVisible();
  expect(screen.getByText(/The file is too small\./)).toBeVisible();
  expect(screen.getByText(/Not ignored\./)).toBeVisible();
});

test('too-many-files uploaded error clear on new attepts', async () => {
  vi.useFakeTimers();
  const user = userEvent.setup({
    // Let user-event advance timers it sets under the hood, using Vitest’s fake timers
    advanceTimers: vi.advanceTimersByTime,
  });
  const uploads: File[] = [
    new File(['dummy'], 'dummy1.pdf', {type: 'application/pdf'}),
    new File(['dummy'], 'dummy2.pdf', {type: 'application/pdf'}),
    new File(['dummy'], 'dummy3.pdf', {type: 'application/pdf'}),
  ];

  render(
    <TestComponentContainer
      componentDefinition={{
        ...BASE_COMPONENT,
        multiple: true,
        maxNumberOfFiles: 2,
      }}
      simulatedUploads={uploads}
    />
  );

  expect(screen.getByTestId('field-error')).toHaveTextContent('');

  // uploading too many files triggers client-side rejection.
  await user.click(screen.getByRole('button', {name: 'Simulate TooManyFiles'}));
  // nothing is added to the file upload list in the UI
  expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  // the validation error is set and displayed
  expect(screen.getByTestId('field-error')).toHaveTextContent(/Too many files uploaded\./);

  // uploading files without client-side rejection clears the error.
  await user.click(screen.getByRole('button', {name: 'Simulate upload'}));
  await vi.advanceTimersByTimeAsync(200);
  await waitFor(() => {
    expect(screen.queryAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByTestId('field-error')).toBeEmptyDOMElement();
  });
});
