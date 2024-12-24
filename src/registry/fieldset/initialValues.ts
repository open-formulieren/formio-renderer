import type {FieldsetComponentSchema} from '@open-formulieren/types';

import type {GetRegistryEntry} from '@/registry/types';
import type {JSONValue} from '@/types';
import {extractInitialValues} from '@/utils';

const getInitialValues = (
  {components}: FieldsetComponentSchema,
  getRegistryEntry: GetRegistryEntry
): [string, JSONValue][] => {
  // extract the default values of the nested components
  const initialValuePairs = extractInitialValues(components, getRegistryEntry);
  return initialValuePairs;
};

export default getInitialValues;
