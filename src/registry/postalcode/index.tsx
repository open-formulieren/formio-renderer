import type {TextFieldComponentSchema} from '@open-formulieren/types';

import PostalCodeField from '@/components/forms/PostalCodeField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioPostCodeProps {
  componentDefinition: TextFieldComponentSchema;
}

export const FormioPostCode: React.FC<FormioPostCodeProps> = ({
  componentDefinition: {key, label, description, tooltip, validate},
}) => {
  return (
    <PostalCodeField
      name={key}
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
      placeholder="AAAA-10"
    />
  );
};

const PostalCodeComponent: RegistryEntry<TextFieldComponentSchema> = {
  formField: FormioPostCode,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default PostalCodeComponent;
