import type {ChildrenComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';
import type {JSONObject} from '@/types';

const getInitialValues: GetInitialValues<ChildrenComponentSchema, JSONObject[]> = ({
  key,
  defaultValue = [],
}: ChildrenComponentSchema) => {
  return {[key]: defaultValue as unknown as JSONObject[]};
};

export default getInitialValues;
