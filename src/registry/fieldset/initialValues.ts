import type {FieldsetComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues, GetRegistryEntry} from '@/registry/types';
import type {JSONValue} from '@/types';
import {extractInitialValues} from '@/values';

const getInitialValues: GetInitialValues<FieldsetComponentSchema, JSONValue> = (
  {components}: FieldsetComponentSchema,
  getRegistryEntry: GetRegistryEntry
) => {
  // extract the default values of the nested components
  return extractInitialValues(components, getRegistryEntry);
};

export default getInitialValues;
