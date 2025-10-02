import type {PostcodeComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioPostCodeProps {
  componentDefinition: PostcodeComponentSchema;
}

export const FormioPostCode: React.FC<FormioPostCodeProps> = ({
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
      placeholder="AAAA 10"
    />
  );
};

const PostalCodeComponent: RegistryEntry<PostcodeComponentSchema> = {
  formField: FormioPostCode,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default PostalCodeComponent;
