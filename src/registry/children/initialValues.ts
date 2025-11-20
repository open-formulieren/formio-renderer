import type {ChildrenComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';
import type {JSONObject} from '@/types';

const getInitialValues: GetInitialValues<ChildrenComponentSchema, JSONObject[]> = ({
  key,
  enableSelection,
  defaultValue = [],
}: ChildrenComponentSchema) => {
  if (defaultValue?.length && enableSelection) {
    defaultValue = defaultValue.map(child => ({
      ...child,
      // By default, none of the children should be selected
      selected: false,
    }));
  }

  return {[key]: defaultValue as unknown as JSONObject[]};
};

export default getInitialValues;
