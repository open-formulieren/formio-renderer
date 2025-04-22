import type {AnyComponentSchema, ColumnsComponentSchema} from '@open-formulieren/types';

import type {GetRegistryEntry, GetValidationSchema} from '@/registry/types';
import type {SchemaRecord} from '@/validationSchema';

const getValidationSchema: GetValidationSchema<ColumnsComponentSchema> = (
  {columns},
  intl,
  getRegistryEntry: GetRegistryEntry
) => {
  const allComponents = columns.reduce(
    (acc: AnyComponentSchema[], {components}) => [...acc, ...components],
    []
  );

  const componentSchemas = allComponents.reduce((acc: SchemaRecord, componentDefinition) => {
    const getValidationSchema = getRegistryEntry(componentDefinition)?.getValidationSchema;
    if (getValidationSchema !== undefined) {
      const schemaRecord = getValidationSchema(componentDefinition, intl, getRegistryEntry);
      acc = {...acc, ...schemaRecord};
    }
    return acc;
  }, {} satisfies SchemaRecord);

  return componentSchemas;
};

export default getValidationSchema;
