import type {FieldsetComponentSchema} from '@open-formulieren/types';

import type {GetRegistryEntry, GetValidationSchema} from '@/registry/types';
import type {SchemaRecord} from '@/validationSchema';

const getValidationSchema: GetValidationSchema<FieldsetComponentSchema> = (
  {components},
  getRegistryEntry: GetRegistryEntry
) => {
  const componentSchemas = components.reduce((acc: SchemaRecord, componentDefinition) => {
    const getValidationSchema = getRegistryEntry(componentDefinition)?.getValidationSchema;
    if (getValidationSchema !== undefined) {
      const schemaRecord = getValidationSchema(componentDefinition, getRegistryEntry);
      acc = {...acc, ...schemaRecord};
    }
    return acc;
  }, {} satisfies SchemaRecord);

  return componentSchemas;
};

export default getValidationSchema;
