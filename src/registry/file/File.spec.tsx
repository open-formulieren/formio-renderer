import type {FileComponentSchema} from '@open-formulieren/types';
import {ErrorMessage, FieldArray, Formik} from 'formik';
import type {ArrayHelpers} from 'formik';
import {ErrorCode} from 'react-dropzone';
import type {FileRejection, FileWithPath} from 'react-dropzone';
import {IntlProvider} from 'react-intl';
import {afterEach, expect, test, vi} from 'vitest';
import {render} from 'vitest-browser-react';

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

afterEach(() => {
  vi.restoreAllMocks();
  if (vi.isFakeTimers()) {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  }
});

test('successful uploads are correctly added to the state', async () => {
  vi.useFakeTimers();
  const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
  const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
  const component: FileComponentSchema = {...BASE_COMPONENT, multiple: true};
  const uploads: File[] = [
    new File(['dummy'], 'dummy1.pdf', {type: 'application/pdf'}),
    new File(['dummy'], 'dummy2.pdf', {type: 'application/pdf'}),
  ];

  const screen = await render(
    <TestComponentContainer componentDefinition={component} simulatedUploads={uploads} />
  );

  // initially, no uploads are displayed
  const uploadsList = screen.getByRole('listitem').all();
  expect(uploadsList).toHaveLength(0);

  await screen.getByRole('button', {name: 'Simulate upload'}).click();

  const pendingUploadsList = screen.getByRole('listitem').all();
  expect(pendingUploadsList).toHaveLength(2);
  for (const pendingUpload of pendingUploadsList) {
    await expect.element(pendingUpload).toHaveAttribute('data-state', 'pending');
  }
  expect(createObjectURLSpy).toHaveBeenCalledTimes(2);

  // Let the mock upload complete so that it arrives in its state update machinery
  await vi.advanceTimersByTimeAsync(200);

  // verify that the states have been updated
  const completedUploadsList = screen.getByRole('listitem').all();
  expect(completedUploadsList).toHaveLength(2);
  await expect.element(completedUploadsList[0]).toHaveAttribute('data-state', 'success');
  expect(revokeObjectURLSpy).toHaveBeenCalledTimes(2);
});

test('failed uploads are correctly updated in the state', async () => {
  vi.useFakeTimers();
  const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
  const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
  const component: FileComponentSchema = {...BASE_COMPONENT, multiple: true};
  const uploads: File[] = [
    new File(['dummy'], 'error.pdf', {type: 'application/pdf'}),
    new File(['dummy'], 'dummy2.pdf', {type: 'application/pdf'}),
  ];

  const screen = await render(
    <TestComponentContainer componentDefinition={component} simulatedUploads={uploads} />
  );

  // initially, no uploads are displayed
  const uploadsList = screen.getByRole('listitem').all();
  expect(uploadsList).toHaveLength(0);

  await screen.getByRole('button', {name: 'Simulate upload'}).click();

  const pendingUploadsList = screen.getByRole('listitem').all();
  expect(pendingUploadsList).toHaveLength(2);
  for (const pendingUpload of pendingUploadsList) {
    await expect.element(pendingUpload).toHaveAttribute('data-state', 'pending');
  }
  expect(createObjectURLSpy).toHaveBeenCalledTimes(2);

  // Let the mock upload complete so that it arrives in its state update machinery
  await vi.advanceTimersByTimeAsync(200);

  // wait for the upload to complete and verify that the states have been updated
  const completedUploadsList = screen.getByRole('listitem').all();
  expect(completedUploadsList).toHaveLength(2);
  await expect.element(completedUploadsList[0]).toHaveAttribute('data-state', 'error');
  await expect.element(completedUploadsList[1]).toHaveAttribute('data-state', 'success');
  expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1);

  await expect.element(screen.getByText(/Backend error 1./)).toBeVisible();
  await expect.element(screen.getByText(/Backend error 2./)).toBeVisible();
});

test('remove file while uploading', async () => {
  vi.useFakeTimers();
  const upload: File = new File(['dummy'], 'dummy.pdf', {type: 'application/pdf'});

  const screen = await render(
    <TestComponentContainer componentDefinition={BASE_COMPONENT} simulatedUploads={[upload]} />
  );

  // these race against each other, where the remove finishes before the upload completes
  await screen.getByRole('button', {name: 'Simulate upload'}).click();
  await screen.getByRole('button', {name: 'Remove upload 0'}).click();

  // Let the mock upload complete so that it arrives in its state update machinery
  await vi.advanceTimersByTimeAsync(200);

  await expect.element(screen.getByRole('listitem')).not.toBeInTheDocument();
});

test('process file rejection eagerly', async () => {
  const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
  const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
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

  const screen = await render(
    <TestComponentContainer
      componentDefinition={{...BASE_COMPONENT, fileMaxSize: '1 MB', maxNumberOfFiles: 3}}
      simulatedUploads={[upload]}
    />
  );

  // these race against each other, where the remove finishes before the upload completes
  await screen.getByRole('button', {name: 'Simulate upload'}).click();

  expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
  expect(revokeObjectURLSpy).not.toHaveBeenCalled();
  const erroredUpload = screen.getByRole('listitem');
  await expect.element(erroredUpload).toHaveAttribute('data-state', 'error');

  // check that our transformed error messages are present.
  await expect
    .element(screen.getByText(/The uploaded file type is not an allowed type. It must be \.pdf\./))
    .toBeVisible();
  await expect.element(screen.getByText(/The file must be smaller than 1 MB\./)).toBeVisible();
  await expect.element(screen.getByText(/The file is too small\./)).toBeVisible();
  await expect.element(screen.getByText(/Not ignored\./)).toBeVisible();
});

test('too-many-files uploaded error clear on new attepts', async () => {
  vi.useFakeTimers();
  const uploads: File[] = [
    new File(['dummy'], 'dummy1.pdf', {type: 'application/pdf'}),
    new File(['dummy'], 'dummy2.pdf', {type: 'application/pdf'}),
    new File(['dummy'], 'dummy3.pdf', {type: 'application/pdf'}),
  ];

  const screen = await render(
    <TestComponentContainer
      componentDefinition={{
        ...BASE_COMPONENT,
        multiple: true,
        maxNumberOfFiles: 2,
      }}
      simulatedUploads={uploads}
    />
  );

  await expect.element(screen.getByTestId('field-error')).toHaveTextContent('');

  // uploading too many files triggers client-side rejection.
  await screen.getByRole('button', {name: 'Simulate TooManyFiles'}).click();
  // nothing is added to the file upload list in the UI
  await expect.element(screen.getByRole('listitem')).not.toBeInTheDocument();
  // the validation error is set and displayed
  await expect
    .element(screen.getByTestId('field-error'))
    .toHaveTextContent(/Too many files uploaded\./);

  // uploading files without client-side rejection clears the error.
  await screen.getByRole('button', {name: 'Simulate upload'}).click();
  await vi.advanceTimersByTimeAsync(200);
  expect(screen.getByRole('listitem').all()).toHaveLength(3);
  await expect.element(screen.getByTestId('field-error')).toBeEmptyDOMElement();
});
