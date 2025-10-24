import type {FieldsetComponentSchema} from '@open-formulieren/types';

import type {GetValidationSchema} from '@/registry/types';
import type {SchemaRecord} from '@/validationSchema';

const getValidationSchema: GetValidationSchema<FieldsetComponentSchema> = (
  {components},
  context
) => {
  const componentSchemas = components.reduce((acc: SchemaRecord, componentDefinition) => {
    const getValidationSchema = context.getRegistryEntry(componentDefinition)?.getValidationSchema;
    if (getValidationSchema !== undefined) {
      const schemaRecord = getValidationSchema(componentDefinition, context);
      acc = {...acc, ...schemaRecord};
    }
    return acc;
  }, {} satisfies SchemaRecord);

  return componentSchemas;
};

export default getValidationSchema;
