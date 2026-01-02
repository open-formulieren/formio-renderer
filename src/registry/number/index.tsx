import type {NumberComponentSchema} from '@open-formulieren/types';

import NumberField from '@/components/forms/NumberField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioNumberFieldProps {
  componentDefinition: NumberComponentSchema;
}

export const FormioNumberField: React.FC<FormioNumberFieldProps> = ({
  componentDefinition: {
    key,
    label,
    description,
    tooltip,
    validate,
    decimalLimit,
    allowNegative,
    prefix,
    suffix,
  },
}) => {
  return (
    <NumberField
      name={key}
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
      decimalLimit={decimalLimit}
      allowNegative={allowNegative}
      prefix={prefix}
      suffix={suffix}
    />
  );
};

const NumberFieldComponent: RegistryEntry<NumberComponentSchema> = {
  formField: FormioNumberField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default NumberFieldComponent;
