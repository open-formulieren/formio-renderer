import {EmailComponentSchema} from '@open-formulieren/types';

import {FormioComponentRenderer} from '@/components/formio';
import {TextField} from '@/components/forms';

const RenderEmail: FormioComponentRenderer<EmailComponentSchema> = ({component}) => {
  const {key, label, description, tooltip, autocomplete, multiple} = component;
  console.log(key, multiple);
  return (
    <TextField
      name={key}
      type="email"
      label={label}
      description={description}
      tooltip={tooltip}
      autoComplete={autocomplete}
    />
  );
};

export default RenderEmail;
