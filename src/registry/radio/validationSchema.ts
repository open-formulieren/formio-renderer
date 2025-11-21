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
  const {key, validate = {}, values, errors} = componentDefinition;
  const {required, plugins = []} = validate;

  const enumMembers = values.map(({value}) => value);
  if (enumMembers.length === 0) return {[key]: z.never()};

  // z.enum requires a non empty array in its types
  const [head, ...rest] = enumMembers;
  const baseEnum: ValidationSchema = z.enum([head, ...rest]);

  // wrap in union so superRefine sees empty values otherwise we can't validate required,
  // zod already gives an error for an empty string for example since it's not a valid enum
  let schema: z.ZodTypeAny = z.union([baseEnum, z.undefined(), z.null(), z.literal('')]);

  schema = schema.superRefine(async (val, ctx) => {
    const isEmpty = val === undefined || val === null || val === '';
    if (required && isEmpty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errors?.required || 'Required',
      });
      return;
    }

    if (plugins.length) {
      const message = await validatePlugins(plugins, val);
      if (!message) return;

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: message,
      });
    }
  });

  return {[key]: schema};
};

export default getValidationSchema;
