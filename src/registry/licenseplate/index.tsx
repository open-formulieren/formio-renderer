import type {LicensePlateComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioLicensePlateProps {
  componentDefinition: LicensePlateComponentSchema;
}

export const FormioLicensePlate: React.FC<FormioLicensePlateProps> = ({
  componentDefinition: {key, label, description, tooltip, validate},
}) => {
  return (
    <TextField
      name={key}
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate.required}
      pattern={validate.pattern}
      placeholder="0-AAA-12"
    />
  );
};

const LicensePlateComponent: RegistryEntry<LicensePlateComponentSchema> = {
  formField: FormioLicensePlate,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default LicensePlateComponent;
