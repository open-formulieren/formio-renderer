import type {LicensePlateComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const LICENSE_PLATE_PATTERN: LicensePlateComponentSchema['validate']['pattern'] =
  '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$';
const LICENSE_PLATE_REGEX = new RegExp(LICENSE_PLATE_PATTERN);

const LICENSE_PLATE_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for license plate.',
  defaultMessage: 'Invalid Dutch license plate',
});

const getValidationSchema: GetValidationSchema<LicensePlateComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate, multiple} = componentDefinition;
  const {required, plugins = []} = validate;

  let schema: z.ZodFirstPartySchemaTypes = z
    .string()
    .regex(LICENSE_PLATE_REGEX, {message: intl.formatMessage(LICENSE_PLATE_INVALID_MESSAGE)});
  if (!required) schema = schema.or(z.literal('')).optional();

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

  if (multiple) {
    schema = z.array(schema);
    if (required) {
      schema = schema.min(1);
    }
  }

  return {[key]: schema};
};

export default getValidationSchema;
