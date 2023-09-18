import {TextFieldComponentSchema} from '@open-formulieren/types';

import {FormioComponentRenderer} from '@/components/formio';
import {TextField} from '@/components/forms';

const RenderTextField: FormioComponentRenderer<TextFieldComponentSchema> = ({component}) => {
  const {
    key,
    label,
    description,
    tooltip,
    showCharCount,
    autocomplete,
    multiple = false,
  } = component;
  return (
    <TextField
      name={key}
      label={label}
      description={description}
      tooltip={tooltip}
      showCharCount={showCharCount}
      autoComplete={autocomplete}
    />
  );
};

export default RenderTextField;
