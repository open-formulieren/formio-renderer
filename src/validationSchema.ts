import type {AnyComponentSchema} from '@open-formulieren/types';
import {setIn} from 'formik';
import {useCallback, useRef} from 'react';
import type {IntlShape} from 'react-intl';
import {z} from 'zod';
import {ValidationError} from 'zod-formik-adapter';

import type {GetRegistryEntry} from '@/registry/types';

import type {JSONObject} from './types';

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
export const composeValidationSchemas = (pairs: KeySchemaPair[]): z.ZodObject<z.ZodRawShape> => {
  // first, create a tree for all the nested keys that we can process to turn
  // into a recursive z.object for the matching schema.
  let completeTree: SchemaTree = {};
  for (const [key, nestedSchema] of pairs) {
    completeTree = setIn(completeTree, key, nestedSchema);
  }

  const createZodObject = (tree: SchemaTree): z.ZodObject<z.ZodRawShape> =>
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
  intl: IntlShape,
  getRegistryEntry: GetRegistryEntry
): z.ZodObject<z.ZodRawShape> => {
  // visit all components and ask them to produce their validation schema. Merge all that
  // into a single object and finally compose the deep zod validation schema.

  // Note that we can directly convert this to a zod object, since keys may have dots
  // in them that creates levels of nesting.
  const allSchemas = components.reduce((acc: SchemaRecord, componentDefinition) => {
    const getValidationSchema = getRegistryEntry(componentDefinition)?.getValidationSchema;
    if (getValidationSchema !== undefined) {
      const schemaRecord = getValidationSchema(componentDefinition, intl, getRegistryEntry);
      acc = {...acc, ...schemaRecord};
    }
    return acc;
  }, {} satisfies SchemaRecord);
  const composedSchema = composeValidationSchemas(Object.entries(allSchemas));
  return composedSchema;
};

type Schema = z.ZodSchema<JSONObject>;

/**
 * Validate an object against a Zod validation schema.
 *
 * @throws ValidationError if the object does not conform to the validation schema.
 */
export const validate = async <T = JSONObject>(schema: Schema, obj: T): Promise<void> => {
  const result = await schema.safeParseAsync(obj);
  if (result.success) return;

  // transform into validation error
  const error = new ValidationError(result.error.message);
  error.inner = result.error.errors.map(err => ({
    message: err.message,
    path: err.path.join('.'),
  }));
  throw error;
};

export interface UseValidationSchema {
  /**
   * Setter to update the validation schema to use in the validate call.
   *
   * It is guaranteed to have a stable identity.
   */
  setSchema: (newSchema: Schema) => void;
  /**
   * Validation callback to pass to Formik's `validationSchema` prop. Throws
   * zod-formik-adapter's ValidationError when there are schema parsing errors.
   *
   * It is guaranteed to have a stable identity.
   */
  validate: (obj: JSONObject) => Promise<void>;
}

export const useValidationSchema = (schema: Schema): UseValidationSchema => {
  // the ref itself is stable, so using it in useCallback dependencies makes those
  // callbacks stable identities too.
  const ref = useRef<Schema>(schema);

  const setSchema = useCallback((newSchema: Schema) => (ref.current = newSchema), [ref]);
  const _validate = useCallback(
    async (obj: JSONObject): Promise<void> => await validate(ref.current, obj),
    [ref]
  );

  return {
    setSchema,
    validate: _validate,
  };
};

export interface UseValidationSchemas {
  /**
   * Setter to update the validation schema to use in the validate call.
   *
   * It is guaranteed to have a stable identity.
   */
  setSchema: (index: number, newSchema: Schema) => void;
  /**
   * Validation callback to pass to Formik's `validationSchema` prop. Throws
   * zod-formik-adapter's ValidationError when there are schema parsing errors.
   *
   * It is guaranteed to have a stable identity.
   */
  validate: (index: number, obj: JSONObject) => Promise<void>;
}

/**
 * Multi-schema variant of useValidationSchema, suitable for edit grids/array values.
 */
export const useValidationSchemas = (schemas: Schema[]): UseValidationSchemas => {
  // the ref itself is stable, so using it in useCallback dependencies makes those
  // callbacks stable identities too.
  const ref = useRef<(Schema | undefined)[]>(schemas);

  const setSchema = useCallback(
    (index: number, newSchema: Schema) => (ref.current[index] = newSchema),
    [ref]
  );
  const _validate = useCallback(
    async (index: number, obj: JSONObject): Promise<void> => {
      const schema = ref.current[index];
      if (schema === undefined) {
        throw new Error(`No schema at index ${index} - this is likely a logical bug.`);
      }
      return await validate(schema, obj);
    },
    [ref]
  );

  return {
    setSchema,
    validate: _validate,
  };
};
