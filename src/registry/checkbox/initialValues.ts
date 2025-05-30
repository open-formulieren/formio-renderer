import type {CheckboxComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<CheckboxComponentSchema, boolean> = ({
  key,
  defaultValue = false,
}: CheckboxComponentSchema) => {
  return {[key]: defaultValue};
};

export default getInitialValues;
