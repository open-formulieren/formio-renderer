import type {FileComponentSchema} from '@open-formulieren/types';
import {useFormikContext} from 'formik';
import type {ArrayHelpers, FieldHelperProps} from 'formik';
import {useCallback, useEffect, useRef, useState} from 'react';
import {ErrorCode} from 'react-dropzone';
import type {FileRejection} from 'react-dropzone';
import {useIntl} from 'react-intl';
import type {IntlShape} from 'react-intl';

import {useFormSettings} from '@/hooks';

import type {FileParameters, FormikFileUpload} from './types';
import {TOO_MANY_FILES_ERROR, transformReactDropzoneErrors} from './validationSchema';

type FileArrayHelpers = ArrayHelpers<FormikFileUpload[]>;

/**
 * Return value for the `useFileUploads` hook.
 */
interface UseFileUploads {
  /**
   * Callback to invoke when files are added to the upload input, forward it to the
   * `UploadInput` component.
   */
  onFilesAdded: (files: (File | FileRejection)[]) => Promise<void>;
  /**
   * Callback to invoke when a file is removed from the uploaded files list.
   *
   * Takes the unique ID of the file, which is either the `clientId` or a server-side
   * unique identifier if `clientId` is absent.
   */
  onFileRemove: (uniqueId: string) => Promise<void>;
  /**
   * Map of `uniqueId` to error message, originating from react-dropzone.
   *
   * These errors are not tracked in the Formik errors state, because they are produced
   * *before* we can add the upload to the Formik state.
   */
  localUploadErrors: Record<string, string>;
}

/**
 * Implement the core file upload (drop/select) handling logic.
 *
 * Provides a callback for the `onFilesAdded` handler and manages the local error state
 * of file uploads, produced by react-dropzone.
 */
export const useFileUploads = (
  name: string,
  componentDefinition: FileComponentSchema,
  arrayHelpers: FileArrayHelpers
): UseFileUploads => {
  const {push, replace, remove} = arrayHelpers;

  const intl = useIntl();
  const {upload, destroy} = useFileComponentParameters();
  const [touched, setTouched] = useTouchedState(name);
  const {validateField, setFieldError} = useFormikContext();

  // get access to the latest Formik state for the field.
  const uploadsRef = useUploadsRef(name);

  // keep track of more specific errors outside of the validation schema - if present,
  // it overrides the error produced by the schema since resolving these normally
  // fixes the schema errors too.
  // The data structure is keyed by unique upload ID, with the error message as string.
  const [localUploadErrors, setLocalUploadErrors] = useState<Record<string, string>>({});

  const onFilesAdded = useCallback(
    async (files: (File | FileRejection)[]) => {
      if (!touched) setTouched(true);
      // clear any errors, in case a previous interaction set them
      setFieldError(componentDefinition.key, undefined);

      const context: HandleUploadContext = {
        intl,
        uploadsRef,
        componentDefinition,
        upload,
        destroy,
      };

      // eagerly check if we have files with errors for "too many files" - we want to
      // prevent adding these to the Formik state because clearing/updating the error
      // when files are removed and/or automatically retrying the upload is too complex.
      // This way, we can display a field-level validation error that too many files are
      // offered, while resolving the problem as a user results in a re-validation run
      // which clears the error again.
      const maxNumFilesExceeded = files.some(fileOrRejection => {
        const isRejection = 'errors' in fileOrRejection;
        if (!isRejection) return false;
        return fileOrRejection.errors.some(err => err.code === ErrorCode.TooManyFiles);
      });
      // add error and abort early
      if (maxNumFilesExceeded) {
        const error = intl.formatMessage(TOO_MANY_FILES_ERROR, {
          maxNumberOfFiles: componentDefinition.maxNumberOfFiles,
        });
        setFieldError(componentDefinition.key, error);
        return;
      }

      for (const fileOrRejection of files) {
        handleUpload(
          fileOrRejection,
          push,
          (uniqueId: string, errMsg: string) =>
            setLocalUploadErrors(prev => ({...prev, [uniqueId]: errMsg})),
          replace,
          context
        );
      }
    },
    [
      uploadsRef,
      intl,
      upload,
      destroy,
      push,
      replace,
      setFieldError,
      componentDefinition,
      touched,
      setTouched,
    ]
  );

  const onFileRemove = async (uniqueId: string): Promise<void> => {
    // find the upload in the latest state - for persisted uploads, there is no
    // such property and we can match on the API resource URL.
    const upload = uploadsRef.current.find(u => u.clientId === uniqueId || u.url === uniqueId);
    if (!upload) return;

    // clear local errors from the state to avoid memory leaking
    const clientId = upload.clientId;
    if (clientId) {
      setLocalUploadErrors(prev => {
        const copy = {...prev};
        if (copy[clientId]) delete copy[clientId];
        return copy;
      });
    }

    const index = uploadsRef.current.indexOf(upload);
    remove(index);
    // Ensure that the validation runs a tick later than the values state
    // update, otherwise it will see the stale state.
    window.queueMicrotask(() => validateField(name));

    const url = upload.url;
    // clean up - if it's a blob URL, the upload was not persisted in the backend
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    } else {
      await destroy(url);
    }
  };

  return {onFilesAdded, onFileRemove, localUploadErrors};
};

/**
 * Given a `File` instance, convert it to an object suitable for the Formik state value.
 */
const fileToFormikUploadData = (file: File): [string, FormikFileUpload] => {
  const tempUrl = URL.createObjectURL(file);
  const uniqueId = window.crypto.randomUUID();
  const fileUpload: FormikFileUpload = {
    // own client-side state tracking for UI updates
    clientId: uniqueId,
    state: 'pending',
    // server data
    name: file.name,
    originalName: file.name,
    size: file.size,
    storage: 'url',
    type: file.type,
    url: tempUrl,
    data: {
      url: tempUrl,
      form: '',
      name: file.name, // TODO: do we need to strip soft hyphens here or what?
      size: file.size,
      // remnant from Formio.js, but our backend validates that it looks like an
      // actual URL.
      baseUrl: 'https://example.com/irrelevant',
      project: '',
    },
  };
  return [uniqueId, fileUpload];
};

interface HandleUploadContext extends FileParameters {
  intl: IntlShape;
  uploadsRef: React.MutableRefObject<FormikFileUpload[]>;
  componentDefinition: FileComponentSchema;
}

/**
 * Helper to handle the 'upload' of an individual file (or rejection), as received from
 * react-dropzone. Callers must take care to *not* await each call when looping over a
 * collection, as that effectively makes things sequential.
 *
 * If react-dropzone returned a rejection, we don't bother trying to upload to a backend,
 * instead we just update the Formik state and ensure the errors are available for
 * display.
 *
 * Otherwise, if we can proceed with the upload, we dispatch that to the backend and
 * wait for the result. The outcome is either success or error, in both cases we update
 * the Formik state for this particular upload, and if there are errors, we ensure they
 * are added to the error state so they can be displayed.
 */
const handleUpload = async (
  fileOrRejection: File | FileRejection,
  onAdd: (fileUpload: FormikFileUpload) => void,
  onAddError: (uniqueId: string, error: string) => void,
  onReplace: (index: number, fileUpload: FormikFileUpload) => void,
  context: HandleUploadContext
): Promise<void> => {
  const {intl, uploadsRef, componentDefinition, upload, destroy} = context;

  const isRejection = 'errors' in fileOrRejection;
  const file = isRejection ? fileOrRejection.file : fileOrRejection;
  const [uniqueId, fileUpload] = fileToFormikUploadData(file);

  if ('errors' in fileOrRejection) {
    // rejected by the upload input, don't even bother uploading
    fileUpload.state = 'error';
    onAdd(fileUpload);
    const errMsg = transformReactDropzoneErrors(intl, componentDefinition, fileOrRejection);
    onAddError(uniqueId, errMsg);
    return;
  }

  // add it to the formik state, which updates the ref next render.
  onAdd(fileUpload);
  const tempUrl = fileUpload.url;

  // call the immediately self-executing async function for the async upload process,
  // but don't wait for the result. All necessary state updates are handled inside,
  // which allows for true parallel file uploads.
  (async () => {
    // accepted by the upload input, let's send it to the backend for processing
    const uploadResult = await upload(file);
    const result = uploadResult.result;

    // find the upload in the latest state - we use the ref for index lookup here
    // because the async upload consumes time, and race conditions are relevant!
    const refIndex = uploadsRef.current.findIndex(u => u.clientId === uniqueId);
    const hasFileBeenRemoved = refIndex === -1;

    let updatedUpload: FormikFileUpload;
    switch (result) {
      case 'success': {
        const {url: backendUrl} = uploadResult;
        URL.revokeObjectURL(tempUrl);
        // If the user removed the file again during upload, clean up the
        // temporary upload again. This is deliberately *not* awaited -
        // failures are not fatal.
        if (hasFileBeenRemoved) {
          destroy(backendUrl);
          return;
        }
        updatedUpload = {...fileUpload, state: 'success', url: backendUrl};
        updatedUpload.data.url = backendUrl;
        break;
      }
      case 'failed': {
        updatedUpload = {...fileUpload, state: 'error'};
        const errMsg = uploadResult.errors.join('\n');
        onAddError(uniqueId, errMsg);
        break;
      }
      default: {
        const exhaustiveCheck: never = result;
        throw new Error(`Unhandled result: ${exhaustiveCheck}`);
      }
    }

    // now update the file upload in the Formik state, but check if our index
    // still matches as we might have a race condition on our hands.
    if (uploadsRef.current[refIndex]?.clientId !== updatedUpload.clientId) {
      throw new Error('Race condition in ref mutation, aborting!');
    }
    onReplace(refIndex, updatedUpload);
  })();
};

const useFileComponentParameters = () => {
  const {componentParameters} = useFormSettings();
  if (!componentParameters?.file) {
    throw new Error(
      `The 'file' component can only be used if upload/destroy parameters are provided.
      Check that the componentParameters are passed correctly in the FormioForm call.`
    );
  }
  const {upload, destroy} = componentParameters.file;
  return {upload, destroy};
};

const useTouchedState = (
  name: string
): [boolean, FieldHelperProps<FormikFileUpload[]>['setTouched']] => {
  const {getFieldMeta, getFieldHelpers} = useFormikContext();
  const {touched} = getFieldMeta<FormikFileUpload[]>(name);
  const {setTouched} = getFieldHelpers<FormikFileUpload[]>(name);
  return [touched, setTouched];
};

/**
 * Synchronize the file uploads in the Formik state to the the mutable ref value to
 * provide access to the current Formik state to callback functions that need an up to
 * date view of the Formik state.
 */
const useUploadsRef = (name: string): React.MutableRefObject<FormikFileUpload[]> => {
  const {getFieldProps} = useFormikContext();
  const {value: uploads = []} = getFieldProps<FormikFileUpload[]>(name);

  // we must guard against race conditions because we're dealing with a list of
  // values, which may change in ordering and size while uploads are processing.
  //
  // Users can add additional uploads or remove uploads while an earlier upload is still
  // processing - this reshuffles the structure of the uploads array and makes using
  // indices unreliable.
  //
  // So, we track the field value (array of uploads) as mutable ref which can be
  // accessed by the callback to see the latest state. Records are matched based on a
  // unique client side ID.
  const uploadsRef = useRef<FormikFileUpload[]>(uploads);
  // update the ref every time the uploads change. Formik takes care of object identity.
  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  return uploadsRef;
};
