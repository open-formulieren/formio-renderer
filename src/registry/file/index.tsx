import type {FileComponentSchema, FileUploadData} from '@open-formulieren/types';
import {FormField} from '@utrecht/component-library-react';
import {FieldArray, useFormikContext} from 'formik';
import type {ArrayHelpers, FormikErrors} from 'formik';
import {useId} from 'react';

import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import type {RegistryEntry} from '@/registry/types';

import './File.scss';
import UploadInput from './UploadInput';
import UploadedFileList from './UploadedFileList';
import type {FileMeta} from './UploadedFileList';
import {useFileUploads} from './hooks';
import type {FormikFileUpload} from './types';
import {getSizeInBytes} from './utils';
import getValidationSchema from './validationSchema';

export interface FormioFileProps {
  componentDefinition: FileComponentSchema;
}

export const FormioFile: React.FC<FormioFileProps> = ({componentDefinition}) => {
  const {key: name} = componentDefinition;
  return (
    <FieldArray name={name} validateOnChange={false}>
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
const Inner: React.FC<InnerProps> = ({componentDefinition, arrayHelpers}) => {
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

  const {value: uploads = []} = getFieldProps<FormikFileUpload[]>(name);
  const {touched, error: formikError} = getFieldMeta<FormikFileUpload[]>(name);
  const {setTouched} = getFieldHelpers<FormikFileUpload[]>(name);

  const {onFilesAdded, onFileRemove, localUploadErrors} = useFileUploads(
    name,
    componentDefinition,
    arrayHelpers
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

  const invalid =
    touched && Boolean(fieldError || fileErrors.length || Object.keys(localUploadErrors).length);
  const errorMessageId = fieldError ? `${id}-error-message` : undefined;

  const maxFilesToSelect = maxNumberOfFiles
    ? Math.max(maxNumberOfFiles - uploads.length, 0)
    : undefined;

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
            multiple={multiple && (maxFilesToSelect === undefined || maxFilesToSelect > 1)}
            maxFiles={maxNumberOfFiles ?? undefined}
            maxFilesToSelect={maxFilesToSelect}
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
              files={uploads.map((upload, index) => {
                const localUploadError = upload.clientId
                  ? localUploadErrors?.[upload.clientId]
                  : undefined;
                return formikFileUploadToFileMeta(upload, fileErrors[index], localUploadError);
              })}
              onRemove={onFileRemove}
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

const formikFileUploadToFileMeta = (
  upload: FormikFileUpload,
  /**
   * An error specific to this file. It can be a string if it's about the upload as a
   * whole, can be `undefined` in case there are no errors, or could be a nested object
   * with errors for the individual file properties, produced by the Zod schema.
   */
  fileErrors: string | FormikErrors<FormikFileUpload> | undefined,
  /**
   * Possible local error from the `UploadInput` component, not present in the Formik
   * error state.
   *
   * @see `./hooks.ts` for why these can exist.
   */
  localError: string | undefined
): FileMeta => {
  const {clientId, url, originalName, size, state} = upload;

  let errors: string[] = [];

  if (typeof fileErrors === 'string') {
    errors = [fileErrors];
  } else if (fileErrors) {
    // for nested property errors, just lift them up to the file level since we don't
    // have input fields for these sub-properties anyway.
    for (const err of Object.values(fileErrors)) {
      if (typeof err !== 'string') continue;
      errors.push(err);
    }
  }
  // check if we have any local drag & drop error state, which trumps
  // schema errors
  if (clientId && localError) errors = [localError];

  return {
    // fall back to the URL for persisted uploads - these don't have a clientId
    uniqueId: clientId || url,
    name: originalName,
    downloadUrl: url,
    size,
    // the default success state applies to persisted uploads
    state: state ?? 'success',
    errors: errors,
  };
};

const FileComponent: RegistryEntry<FileComponentSchema> = {
  formField: FormioFile,
  // valueDisplay: ValueDisplay,
  // getInitialValues,
  getValidationSchema,
  // isEmpty,
};

export default FileComponent;
