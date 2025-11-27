import type {IbanComponentSchema} from '@open-formulieren/types';
import {electronicFormatIBAN, isValidIBAN as isValidIBAN_} from 'ibantools';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildRequiredMessage} from '@/validationSchemas/errorMessages';

const IBAN_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for IBAN that does not pass the mod-97 test.',
  defaultMessage: 'Invalid IBAN.',
});

const isValidIBAN = (value: string): boolean => {
  const iban = electronicFormatIBAN(value);
  if (!iban) {
    return false;
  }
  return isValidIBAN_(iban);
};

const getValidationSchema: GetValidationSchema<IbanComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, multiple, errors, label} = componentDefinition;
  const {required, plugins = []} = validate;

  let schema: z.ZodFirstPartySchemaTypes = z
    .string({
      required_error: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
    })
    .refine(isValidIBAN, {message: intl.formatMessage(IBAN_INVALID_MESSAGE)});

  if (!required) {
    schema = schema.or(z.literal('')).optional();
  }

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
      schema = schema.min(1, {
        message: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
      });
    }
  }

  return {[key]: schema};
};

export default getValidationSchema;
