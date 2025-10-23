import type {TextareaComponentSchema} from '@open-formulieren/types';

import MultiField from '@/components/forms/MultiField';
import Textarea from '@/components/forms/Textarea';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioTextareaProps {
  componentDefinition: TextareaComponentSchema;
}

export const FormioTextarea: React.FC<FormioTextareaProps> = ({componentDefinition}) => {
  const {
    key,
    label,
    description,
    tooltip,
    placeholder,
    validate,
    showCharCount,
    autocomplete,
    rows,
    disabled,
  } = componentDefinition;
  const sharedProps: Pick<
    React.ComponentProps<typeof Textarea>,
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
        <Textarea
          name={name}
          label={label}
          placeholder={placeholder}
          showCharCount={showCharCount}
          maxLength={validate?.maxLength}
          autoComplete={autocomplete}
          rows={rows}
          isMultiValue
        />
      )}
    />
  ) : (
    <Textarea
      {...sharedProps}
      placeholder={placeholder}
      showCharCount={showCharCount}
      maxLength={validate?.maxLength}
      autoComplete={autocomplete}
      rows={rows}
    />
  );
};

const TextareaComponent: RegistryEntry<TextareaComponentSchema> = {
  formField: FormioTextarea,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default TextareaComponent;
