import type {RadioComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildRequiredMessage} from '@/validationSchemas/errorMessages';

type ValuesEnum = z.ZodEnum<[string, ...string[]]>;

const getValidationSchema: GetValidationSchema<RadioComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, values, errors, label} = componentDefinition;
  const {required, plugins = []} = validate;

  const enumMembers = values.map(({value}) => value);
  if (enumMembers.length === 0) return {[key]: z.never()};

  // z.enum requires a non empty array in its types
  const [head, ...rest] = enumMembers;
  let optionsSchema: ValuesEnum | z.ZodOptional<ValuesEnum> = z.enum([head, ...rest]);
  // if the field is not required, we must allow the undefined option (result of
  // pre-processing for null and empty strings)
  if (!required) {
    optionsSchema = optionsSchema.optional();
  }

  // schema for the bare string base for the option, used for `required` validation
  let baseSchema: z.ZodOptional<z.ZodString> | z.ZodString = z.string({
    required_error: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
  });
  if (!required) {
    baseSchema = baseSchema.optional();
  }

  // transform all empty-ish values (null, undefined, empty string) into `undefined` to
  // signal it's empty.
  let schema: z.ZodFirstPartySchemaTypes = z.preprocess(
    val => (val == null || val === '' ? undefined : val),
    baseSchema
      // apply enum/options validation
      .pipe(optionsSchema)
  );

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

  return {[key]: schema};
};

export default getValidationSchema;
