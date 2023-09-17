import {NumberComponentSchema} from '@open-formulieren/types';

import {FormioComponentRenderer} from '@/components/formio';
import {TextField} from '@/components/forms';

const RenderNumber: FormioComponentRenderer<NumberComponentSchema> = ({component}) => {
  const {key, label, description, tooltip} = component;
  console.log(key);
  return (
    <TextField name={key} type="number" label={label} description={description} tooltip={tooltip} />
  );
};

export default RenderNumber;
