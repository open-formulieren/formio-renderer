import type {RadioComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

import {assertManualValues} from './types';

type ValuesEnum = z.ZodEnum<[string, ...string[]]>;
type MaybeOptionalSchema = ValuesEnum | z.ZodOptional<ValuesEnum>;
type ValidationSchema = MaybeOptionalSchema | z.ZodUnion<[MaybeOptionalSchema, z.ZodNull]>;

const getValidationSchema: GetValidationSchema<RadioComponentSchema> = componentDefinition => {
  assertManualValues(componentDefinition);
  const {key, validate = {}, values} = componentDefinition;
  const {required} = validate;

  const enumMembers = values.map(({value}) => value);
  if (enumMembers.length === 0) return {[key]: z.never()};

  // z.enum requires a non empty array in its types
  const [head, ...rest] = enumMembers;
  let schema: ValidationSchema = z.enum([head, ...rest]);
  if (!required) {
    schema = schema.optional().or(z.null());
  }

  return {[key]: schema};
};

export default getValidationSchema;
