import type {ChildrenComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';
import type {JSONObject} from '@/types';

const getInitialValues: GetInitialValues<ChildrenComponentSchema, JSONObject[]> = ({
  key,
}: ChildrenComponentSchema) => {
  return {[key]: []};
};

export default getInitialValues;
