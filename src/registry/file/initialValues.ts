import type {FileComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';
import type {JSONObject} from '@/types';

const getInitialValues: GetInitialValues<FileComponentSchema, JSONObject[]> = ({
  key,
}: FileComponentSchema) => {
  // file uploads cannot have a default value, because we don't have access to the
  // user's file system to fetch the uploads, so it must always be an empty array.
  return {[key]: [] satisfies JSONObject[]};
};

export default getInitialValues;
