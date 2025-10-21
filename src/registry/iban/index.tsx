import type {IbanComponentSchema} from '@open-formulieren/types';

import MultiField from '@/components/forms/MultiField';
import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioIBANProps {
  componentDefinition: IbanComponentSchema;
}

export const FormioIBAN: React.FC<FormioIBANProps> = ({componentDefinition}) => {
  const {key, label, tooltip, description, validate} = componentDefinition;
  const sharedProps: Pick<
    React.ComponentProps<typeof TextField>,
    'name' | 'label' | 'description' | 'tooltip' | 'isRequired'
  > = {
    name: key,
    label,
    description,
    tooltip,
    isRequired: validate?.required,
  };

  return componentDefinition.multiple ? (
    <MultiField<string>
      {...sharedProps}
      newItemValue=""
      renderField={({name, label}) => (
        <TextField
          name={name}
          label={label}
          type="text"
          inputMode="text"
          placeholder=""
          isMultiValue
        />
      )}
    />
  ) : (
    <TextField {...sharedProps} type="text" inputMode="text" placeholder="" />
  );
};

const IBANComponent: RegistryEntry<IbanComponentSchema> = {
  formField: FormioIBAN,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default IBANComponent;
