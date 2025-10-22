import type {RadioComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

import {assertManualValues} from './types';

type ValuesEnum = z.ZodEnum<[string, ...string[]]> | z.ZodEffects<ValuesEnum, string, string>;
type ValidationSchema =
  | ValuesEnum
  | z.ZodUnion<[z.ZodOptional<ValuesEnum>, z.ZodNull, z.ZodLiteral<''>]>;

const getValidationSchema: GetValidationSchema<RadioComponentSchema> = (
  componentDefinition,
  {validatePlugins}
) => {
  assertManualValues(componentDefinition);
  const {key, validate = {}, values} = componentDefinition;
  const {required, plugins = []} = validate;

  const enumMembers = values.map(({value}) => value);
  if (enumMembers.length === 0) return {[key]: z.never()};

  // z.enum requires a non empty array in its types
  const [head, ...rest] = enumMembers;
  let schema: ValidationSchema = z.enum([head, ...rest]);

  if (plugins.length) {
    schema = schema.superRefine(async (val, ctx) => {
      const message = await validatePlugins(plugins, val);
      if (!message) return;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: message,
      });
    });
  }

  if (!required) {
    schema = z.union([schema.optional(), z.null(), z.literal('')]);
  }

  return {[key]: schema};
};

export default getValidationSchema;
