import type {RadioComponentSchema} from '@open-formulieren/types';

import RadioField from '@/components/forms/RadioField';

import {assertManualValues} from './types';

export interface FormioRadioFieldProps {
  componentDefinition: RadioComponentSchema;
}

const FormioRadioField: React.FC<FormioRadioFieldProps> = ({componentDefinition}) => {
  assertManualValues(componentDefinition);
  const {key, label, description, validate = {}, values} = componentDefinition;
  const {required = false} = validate;
  return (
    <RadioField
      name={key}
      label={label}
      description={description}
      isRequired={required}
      options={values}
    />
  );
};

export default FormioRadioField;
export {default as getInitialValues} from './initialValues';
export {default as getValidationSchema} from './validationSchema';
