import type {PostcodeComponentSchema} from '@open-formulieren/types';

import MultiField from '@/components/forms/MultiField';
import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioPostCodeProps {
  componentDefinition: PostcodeComponentSchema;
}

export const PostCodeField: React.FC<FormioPostCodeProps> = ({componentDefinition}) => {
  const {key, label, tooltip, description, validate, disabled} = componentDefinition;
  const sharedProps: Pick<
    React.ComponentProps<typeof TextField>,
    'name' | 'label' | 'description' | 'tooltip' | 'isRequired' | 'isDisabled'
  > = {
    name: key,
    label,
    description,
    tooltip,
    isRequired: validate?.required,
    isDisabled: disabled,
  };
  return componentDefinition.multiple ? (
    <MultiField<string>
      {...sharedProps}
      newItemValue=""
      renderField={({name, label}) => (
        <TextField
          name={name}
          label={label}
          pattern={validate.pattern}
          placeholder="1234 AB"
          isMultiValue
        />
      )}
    />
  ) : (
    <TextField {...sharedProps} pattern={validate.pattern} placeholder="1234 AB" />
  );
};

const PostCodeComponent: RegistryEntry<PostcodeComponentSchema> = {
  formField: PostCodeField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default PostCodeComponent;
