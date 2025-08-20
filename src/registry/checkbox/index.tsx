import type {CheckboxComponentSchema} from '@open-formulieren/types';

import Checkbox from '@/components/forms/Checkbox';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioCheckboxProps {
  componentDefinition: CheckboxComponentSchema;
}

export const FormioCheckbox: React.FC<FormioCheckboxProps> = ({
  componentDefinition: {key, label, description, tooltip, validate},
}) => {
  return (
    <Checkbox
      name={key}
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
    />
  );
};

const CheckboxComponent: RegistryEntry<CheckboxComponentSchema> = {
  formField: FormioCheckbox,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default CheckboxComponent;
