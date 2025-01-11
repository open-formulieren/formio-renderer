import type {FieldsetComponentSchema} from '@open-formulieren/types';

import {extractInitialValues} from '@/initialValues';
import type {GetInitialValues, GetRegistryEntry} from '@/registry/types';
import type {JSONValue} from '@/types';

const getInitialValues: GetInitialValues<FieldsetComponentSchema, JSONValue> = (
  {components}: FieldsetComponentSchema,
  getRegistryEntry: GetRegistryEntry
) => {
  // extract the default values of the nested components
  return extractInitialValues(components, getRegistryEntry);
};

export default getInitialValues;
