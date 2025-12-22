import type {LicensePlateComponentSchema} from '@open-formulieren/types';

import MultiField from '@/components/forms/MultiField';
import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioLicensePlateProps {
  componentDefinition: LicensePlateComponentSchema;
}

export const FormioLicensePlate: React.FC<FormioLicensePlateProps> = ({componentDefinition}) => {
  const {key, label, tooltip, description, validate, disabled} = componentDefinition;
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
        <TextField
          name={name}
          label={label}
          pattern={validate.pattern}
          placeholder="0-AAA-12"
          isReadOnly={isReadOnly}
          isMultiValue
        />
      )}
    />
  ) : (
    <TextField {...sharedProps} pattern={validate.pattern} placeholder="0-AAA-12" />
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
