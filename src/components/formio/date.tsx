import {DateComponentSchema} from '@open-formulieren/types';

import {FormioComponentRenderer} from '@/components/formio';
import {TextField} from '@/components/forms';

const RenderDate: FormioComponentRenderer<DateComponentSchema> = ({component}) => {
  const {key, label, description, tooltip} = component;
  console.log(key);
  return (
    <TextField name={key} type="date" label={label} description={description} tooltip={tooltip} />
  );
};

export default RenderDate;
