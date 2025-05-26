import type {SelectboxesComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

import {assertManualValues} from './types';

// TODO: turn into z.object
type ValuesEnum = z.ZodEnum<[string, ...string[]]>;
type ValidationSchema =
  | ValuesEnum
  | z.ZodUnion<[z.ZodOptional<ValuesEnum>, z.ZodNull, z.ZodLiteral<''>]>;

const getValidationSchema: GetValidationSchema<
  SelectboxesComponentSchema
> = componentDefinition => {
  assertManualValues(componentDefinition);
  const {key, validate = {}, values} = componentDefinition;
  const {required} = validate;

  const enumMembers = values.map(({value}) => value);
  if (enumMembers.length === 0) return {[key]: z.never()};

  // z.enum requires a non empty array in its types
  const [head, ...rest] = enumMembers;
  let schema: ValidationSchema = z.enum([head, ...rest]);
  if (!required) {
    schema = z.union([schema.optional(), z.null(), z.literal('')]);
  }

  return {[key]: schema};
};

export default getValidationSchema;
