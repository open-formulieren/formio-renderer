import type {ColumnsComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues, GetRegistryEntry} from '@/registry/types';
import type {JSONValue} from '@/types';
import {extractInitialValues} from '@/values';

const getInitialValues: GetInitialValues<ColumnsComponentSchema, JSONValue> = (
  {columns}: ColumnsComponentSchema,
  getRegistryEntry: GetRegistryEntry
) => {
  // extract the default values of the nested components in each column
  const initialValues = columns.reduce(
    (acc, column) => ({...acc, ...extractInitialValues(column.components, getRegistryEntry)}),
    {} satisfies Record<string, JSONValue>
  );

  return initialValues;
};

export default getInitialValues;
