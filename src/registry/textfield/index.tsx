import type {TextFieldComponentSchema} from '@open-formulieren/types';
import {FastField} from 'formik';

import MultiField from '@/components/forms/MultiField';
import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioTextFieldProps {
  componentDefinition: TextFieldComponentSchema;
}

export const FormioTextField: React.FC<FormioTextFieldProps> = ({componentDefinition}) => {
  const {
    key,
    label,
    description,
    tooltip,
    placeholder,
    autocomplete,
    validate,
    disabled,
    showCharCount,
  } = componentDefinition;

  const sharedProps: Pick<
    React.ComponentProps<typeof TextField>,
    'name' | 'label' | 'description' | 'tooltip' | 'isRequired' | 'isReadOnly'
  > = {
    name: key,
    label,
    description,
    tooltip,
    isRequired: validate?.required,
    isReadOnly: disabled,
  };
  return componentDefinition.multiple ? (
    <MultiField<string>
      {...sharedProps}
      newItemValue=""
      renderField={({name, label, isReadOnly}) => (
        <FastField name={name}>
          {() => (
            <TextField
              name={name}
              label={label}
              placeholder={placeholder}
              showCharCount={showCharCount}
              maxLength={validate?.maxLength}
              autoComplete={autocomplete}
              isReadOnly={isReadOnly}
              isMultiValue
            />
          )}
        </FastField>
      )}
    />
  ) : (
    // FIXME: needs to compare other props too (from sharedProps)
    <FastField name={key}>
      {() => (
        <TextField
          {...sharedProps}
          placeholder={placeholder}
          showCharCount={showCharCount}
          maxLength={validate?.maxLength}
          autoComplete={autocomplete}
        />
      )}
    </FastField>
  );
};

const TextFieldComponent: RegistryEntry<TextFieldComponentSchema> = {
  formField: FormioTextField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default TextFieldComponent;
