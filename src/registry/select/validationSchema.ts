import type {SelectComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

import {assertManualValues} from './types';

type ValuesEnum = z.ZodEnum<[string, ...string[]]>;
type ValidationSchema =
  | ValuesEnum
  | z.ZodUnion<[z.ZodOptional<ValuesEnum>, z.ZodLiteral<''>]>
  | z.ZodArray<ValuesEnum>;

const getValidationSchema: GetValidationSchema<SelectComponentSchema> = componentDefinition => {
  assertManualValues(componentDefinition);
  const {
    key,
    validate = {},
    multiple = false,
    data: {values: options},
  } = componentDefinition;
  const {required} = validate;

  const enumMembers = options.map(({value}) => value);
  if (enumMembers.length === 0) return {[key]: z.never()};

  // z.enum requires a non empty array in its types
  const [head, ...rest] = enumMembers;
  let schema: ValidationSchema = z.enum([head, ...rest]);
  if (multiple) {
    schema = z.array(schema);
    if (required) {
      schema = schema.min(1);
    }
  } else if (!required) {
    schema = z.union([schema.optional(), z.literal('')]);
  }

  return {[key]: schema};
};

export default getValidationSchema;
