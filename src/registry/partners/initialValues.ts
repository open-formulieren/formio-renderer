import type {PartnersComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';
import type {JSONValue} from '@/types';

const getInitialValues: GetInitialValues<PartnersComponentSchema, JSONValue[]> = ({
  key,
  defaultValue,
}: PartnersComponentSchema) => {
  // if no default value is explicitly specified, return the empty value
  if (defaultValue === undefined) {
    defaultValue = [];
  }
  return {[key]: defaultValue as unknown as JSONValue[]};
};

export default getInitialValues;
