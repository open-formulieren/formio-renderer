import type {FileComponentSchema, FileUploadData} from '@open-formulieren/types';
import {FormField, Paragraph} from '@utrecht/component-library-react';
import {useField} from 'formik';
import type {FormikErrors} from 'formik';
import {useId} from 'react';

import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import type {RegistryEntry} from '@/registry/types';

import './File.scss';
import UploadedFileList from './UploadedFileList';

export interface FormioFileProps {
  componentDefinition: FileComponentSchema;
}

export const FormioFile: React.FC<FormioFileProps> = ({componentDefinition}) => {
  const {key: name, label, description, tooltip, multiple, validate = {}} = componentDefinition;
  const {required: isRequired = false} = validate;
  const [{value = []}, {touched, error: formikError}] = useField<FileUploadData[] | undefined>({
    name,
    type: 'file',
  });
  const id = useId();

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

        {(!value.length || multiple) && (
          <div
            // TODO: use proper input linked to label -> check react-dropzone
            id={id}
            className="openforms-file-upload__dropzone"
            aria-describedby={errorMessageId}
            tabIndex={0}
            role="button"
          >
            <Paragraph>FILE UPLOAD HERE</Paragraph>
          </div>
        )}

        {!!value.length && (
          <div className="openforms-file-upload__uploads">
            <UploadedFileList
              multipleAllowed={multiple}
              files={value.map(({url, originalName, size}, index) => {
                const thisFileErrors = fileErrors[index];
                return {
                  name: originalName,
                  downloadUrl: url,
                  size,
                  errors: typeof thisFileErrors === 'string' ? [thisFileErrors] : undefined,
                };
              })}
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

const FileComponent: RegistryEntry<FileComponentSchema> = {
  formField: FormioFile,
  // valueDisplay: ValueDisplay,
  // getInitialValues,
  // getValidationSchema,
  // isEmpty,
};

export default FileComponent;
