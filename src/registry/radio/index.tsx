import RadioField from '@/components/forms/RadioField';

import type {RadioComponentSchema} from './types';

export interface FormioRadioFieldProps {
  componentDefinition: RadioComponentSchema;
}

const FormioRadioField: React.FC<FormioRadioFieldProps> = ({
  componentDefinition: {key, label, description, validate = {}, values},
}) => {
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
