import {AnyComponentSchema} from '@open-formulieren/types';
import {setIn} from 'formik';
import {z} from 'zod';

import type {GetRegistryEntry} from '@/registry/types';

export type KeySchemaPair = [string, z.ZodFirstPartySchemaTypes];

type SchemaTree = {
  [k: string]: z.ZodFirstPartySchemaTypes | SchemaTree;
};

export type SchemaRecord = Record<string, z.ZodFirstPartySchemaTypes>;

/**
 * Process key-value pairs where keys are Formio component keys that may have dots in
 * them and values are zod schemas.
 *
 * The keys are transformed into a tree structure that represents the shape of the
 * submission data, and for each leaf node the respective zod validation schema is
 * assigned. Finally, this tree is converted into a zod.object schema tree ready to use
 * as validator.
 */
export const composeValidationSchemas = (pairs: KeySchemaPair[]): z.ZodObject<any> => {
  // first, create a tree for all the nested keys that we can process to turn
  // into a recursive z.object for the matching schema.
  let completeTree: SchemaTree = {};
  for (const [key, nestedSchema] of pairs) {
    completeTree = setIn(completeTree, key, nestedSchema);
  }

  const createZodObject = (tree: SchemaTree): z.ZodObject<any> =>
    z.object(
      Object.entries(tree).reduce((acc: SchemaRecord, [key, value]) => {
        acc[key] = value instanceof z.ZodSchema ? value : createZodObject(value);
        return acc;
      }, {} satisfies SchemaRecord)
    );

  return createZodObject(completeTree);
};

/**
 * Build the ZOD validation schema (recursively) for the provided component definitions.
 */
export const buildValidationSchema = (
  components: AnyComponentSchema[],
  getRegistryEntry: GetRegistryEntry
): z.ZodFirstPartySchemaTypes => {
  // visit all components and ask them to produce their validation schema. Merge all that
  // into a single object and finally compose the deep zod validation schema.

  // Note that we can directly convert this to a zod object, since keys may have dots
  // in them that creates levels of nesting.
  const allSchemas = components.reduce((acc: SchemaRecord, componentDefinition) => {
    const getValidationSchema = getRegistryEntry(componentDefinition)?.getValidationSchema;
    if (getValidationSchema !== undefined) {
      const schemaRecord = getValidationSchema(componentDefinition, getRegistryEntry);
      acc = {...acc, ...schemaRecord};
    }
    return acc;
  }, {} satisfies SchemaRecord);
  const composedSchema = composeValidationSchemas(Object.entries(allSchemas));
  return composedSchema;
};
