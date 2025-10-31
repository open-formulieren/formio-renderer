import type {FileComponentSchema, FileUploadData} from '@open-formulieren/types';
import {FormField} from '@utrecht/component-library-react';
import {FieldArray, useFormikContext} from 'formik';
import type {ArrayHelpers, FormikErrors} from 'formik';
import {useCallback, useEffect, useId, useRef} from 'react';
import type {FileRejection} from 'react-dropzone';

import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import {useFormSettings} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

import './File.scss';
import UploadInput from './UploadInput';
import UploadedFileList from './UploadedFileList';
import type {FormikFileUpload} from './types';

export interface FormioFileProps {
  componentDefinition: FileComponentSchema;
}

export const FormioFile: React.FC<FormioFileProps> = ({componentDefinition}) => {
  const {key: name} = componentDefinition;
  return (
    <FieldArray name={name}>
      {arrayHelpers => (
        <Inner componentDefinition={componentDefinition} arrayHelpers={arrayHelpers} />
      )}
    </FieldArray>
  );
};

interface InnerProps {
  componentDefinition: FileComponentSchema;
  arrayHelpers: ArrayHelpers<FormikFileUpload[]>;
}

/**
 * Child/body for `FieldArray` wrapper so we can use hooks.
 */
const Inner: React.FC<InnerProps> = ({
  componentDefinition,
  arrayHelpers: {push, replace, remove},
}) => {
  const {
    key: name,
    label,
    description,
    tooltip,
    multiple,
    maxNumberOfFiles,
    fileMaxSize,
    file: {type},
    validate = {},
  } = componentDefinition;
  const {required: isRequired = false} = validate;
  const {getFieldProps, getFieldMeta, getFieldHelpers} = useFormikContext();
  const id = useId();

  const {componentParameters} = useFormSettings();
  if (!componentParameters?.file) {
    throw new Error(
      `The 'file' component can only be used if upload/destroy parameters are provided.
      Check that the componentParameters are passed correctly in the FormioForm call.`
    );
  }

  const {value: uploads = []} = getFieldProps<FormikFileUpload[]>(name);
  const {touched, error: formikError} = getFieldMeta<FormikFileUpload[]>(name);
  const {setTouched} = getFieldHelpers<FormikFileUpload[]>(name);

  const {upload, destroy} = componentParameters.file;

  // we must be guard against race conditions because we're dealing with a list of
  // values, which may change in ordering and size while uploads are processing. Users
  // can add additional uploads or remove uploads while an earlier upload is still
  // processing, which messes with index-based access.
  // So, we track the field value (array of uploads) as mutable ref which can be
  // accessed by the callback to see the latest state.
  const uploadsRef = useRef<FormikFileUpload[]>(uploads);
  // update the ref every time the uploads change. Formik takes care of object identity.
  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  const onFilesAdded = useCallback(
    async (files: (File | FileRejection)[]) => {
      if (!touched) setTouched(true);

      for (const fileOrRejection of files) {
        const isRejection = 'errors' in fileOrRejection;
        const file = isRejection ? fileOrRejection.file : fileOrRejection;
        const tempUrl = URL.createObjectURL(file);
        const uniqueId = window.crypto.randomUUID();
        const fileUpload: FormikFileUpload = {
          // own client-side state tracking for UI updates
          clientId: uniqueId,
          state: isRejection ? 'error' : 'pending',
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
            baseUrl: '-irrelevant-',
            project: '',
          },
        };
        // add it to the formik state, which updates the ref next render.
        push(fileUpload);

        // invoke async without awaiting for parallel processing
        (async () => {
          if ('errors' in file) {
            // rejected by the upload input, don't even bother uploading
            file;
          } else {
            // accepted by the upload input, let's send it to the backend for processing
            const result = await upload(file);
            const isSuccess = result.result === 'success';
            if (isSuccess) URL.revokeObjectURL(tempUrl);

            // find the upload in the latest state
            const index = uploadsRef.current.findIndex(u => u.clientId === uniqueId);
            // it may have been removed again already, clean up and ensure the temp file
            // is deleted.
            if (index === -1) {
              if (result.result === 'success') destroy(result.url);
              return;
            }

            const fileUpload = uploadsRef.current[index];
            if (fileUpload.clientId !== uniqueId) {
              throw new Error('Race condition in ref mutation!');
            }
            const updatedUpload: FormikFileUpload = {
              ...fileUpload,
              data: {
                ...fileUpload.data,
                url: isSuccess ? result.url : fileUpload.data.url,
              },
              state: result.result === 'failed' ? 'error' : result.result,
              url: isSuccess ? result.url : fileUpload.url,
            };
            replace(index, updatedUpload);

            // TODO: manage errors
          }
        })();
      }
    },
    [upload, destroy, push, replace, touched, setTouched]
  );

  // We can have individual file errors (because the intrinsic value type of the
  // component is FileUploadData[]), a string error for the component as a whole or even
  // deeply nested errors for a file in value array. The types from Formik are very wrong,
  // which is why we need the cast. We also can't use the useFieldError hook because it's
  // meant for components with a single/multiple mode, but file components *always* have an
  // array of file uploads, even if multiple files are not allowed.
  const error = formikError as unknown as
    | undefined
    | string
    | (string | FormikErrors<FileUploadData>)[];

  // field-level error or individual file errors
  const fieldError = typeof error === 'string' && error;
  const fileErrors = (Array.isArray(error) && error) || [];

  const invalid = touched && Boolean(fieldError || fileErrors.length);
  const errorMessageId = fieldError ? `${id}-error-message` : undefined;

  return (
    <FormField type="file" invalid={invalid} className="utrecht-form-field--openforms">
      <Label
        id={id}
        isRequired={isRequired}
        tooltip={tooltip ? <Tooltip>{tooltip}</Tooltip> : undefined}
      >
        {label}
      </Label>

      <div className="openforms-file-upload">
        <div className="openforms-file-upload__description">
          <HelpText>{description}</HelpText>
        </div>

        {(!uploads.length || multiple) && (
          <UploadInput
            inputId={id}
            onFilesAdded={onFilesAdded}
            aria-describedby={errorMessageId}
            maxSize={fileMaxSize ? getSizeInBytes(fileMaxSize) : undefined}
            multiple={multiple}
            maxFiles={maxNumberOfFiles ?? 0}
            accept={Object.fromEntries(type.map(mimeType => [mimeType, [] satisfies string[]]))}
            onBlur={() => {
              if (!touched) setTouched(true);
            }}
          />
        )}

        {!!uploads.length && (
          <div className="openforms-file-upload__uploads">
            <UploadedFileList
              multipleAllowed={multiple}
              files={uploads.map(
                ({url, originalName, size, state = 'success', clientId}, index) => {
                  const thisFileErrors = fileErrors[index];
                  return {
                    // fall back to the URL for persisted uploads
                    uniqueId: clientId || url,
                    name: originalName,
                    downloadUrl: url,
                    size,
                    // the default success state applies to persisted uploads
                    state,
                    errors: typeof thisFileErrors === 'string' ? [thisFileErrors] : undefined,
                  };
                }
              )}
              onRemove={async (id: string) => {
                // find the upload in the latest state - for persisted uploads, there is no
                // such property and we can match on the API resource URL
                // TODO verify this
                const upload = uploadsRef.current.find(u => u.clientId === id || u.url === id);
                if (!upload) return;
                const index = uploadsRef.current.indexOf(upload);
                remove(index);

                const url = upload.url;
                // clean up - if it's a blob URL, the upload was not persisted in the backend
                if (url.startsWith('blob:')) {
                  URL.revokeObjectURL(url);
                } else {
                  await destroy(url);
                }
              }}
            />
          </div>
        )}

        {fieldError && errorMessageId && (
          <div className="openforms-file-upload__errors">
            <ValidationErrors error={fieldError} id={errorMessageId} />
          </div>
        )}
      </div>
    </FormField>
  );
};

// Reference: formio's file component translateScalars method, but without the weird
// units that don't make sense for files...
// Copied from https://github.com/open-formulieren/formio-builder/blob/e296210515949eae8bc2267af95a912c04b43aee/src/registry/file/edit-validation.ts
const TRANSFORMATIONS = {
  B: Math.pow(1024, 0),
  KB: Math.pow(1024, 1),
  MB: Math.pow(1024, 2),
  GB: Math.pow(1024, 3),
};

const getSizeInBytes = (filesize: string): number | undefined => {
  const match = /^(\d+)\s*(B|KB|MB|GB)?$/i.exec(filesize);
  if (match === null) {
    return undefined;
  }
  const size = parseInt(match[1], 10);
  const unit = (match[2] || 'B').toUpperCase() as keyof typeof TRANSFORMATIONS;
  return size * TRANSFORMATIONS[unit];
};

const FileComponent: RegistryEntry<FileComponentSchema> = {
  formField: FormioFile,
  // valueDisplay: ValueDisplay,
  // getInitialValues,
  // getValidationSchema,
  // isEmpty,
};

export default FileComponent;
