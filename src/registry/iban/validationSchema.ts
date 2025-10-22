import type {IbanComponentSchema} from '@open-formulieren/types';
import {electronicFormatIBAN, isValidIBAN as isValidIBAN_} from 'ibantools';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const IBAN_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for IBAN that does not pass the mod-97 test.',
  defaultMessage: 'Invalid IBAN',
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
  {intl}
) => {
  const {key, validate, multiple} = componentDefinition;
  const required = validate?.required;

  let schema: z.ZodFirstPartySchemaTypes = z
    .string()
    .refine(isValidIBAN, {message: intl.formatMessage(IBAN_INVALID_MESSAGE)});
  if (!required) {
    schema = schema.or(z.literal('')).optional();
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
