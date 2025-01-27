import type {BsnComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const isValidBsn = (value: string): boolean => {
  // Formula taken from https://nl.wikipedia.org/wiki/Burgerservicenummer#11-proef
  const elevenTestValue =
    9 * parseInt(value[0]) +
    8 * parseInt(value[1]) +
    7 * parseInt(value[2]) +
    6 * parseInt(value[3]) +
    5 * parseInt(value[4]) +
    4 * parseInt(value[5]) +
    3 * parseInt(value[6]) +
    2 * parseInt(value[7]) +
    -1 * parseInt(value[8]);

  return elevenTestValue % 11 === 0;
};

const getValidationSchema: GetValidationSchema<BsnComponentSchema> = componentDefinition => {
  const {key, validate} = componentDefinition;
  const required = validate?.required;

  // TODO: localize!
  const message = 'A BSN must be 9 digits';
  let schema: z.ZodFirstPartySchemaTypes = z
    .string()
    .length(9, {message})
    .regex(/[0-9]{9}/, {message})
    .refine(isValidBsn, {message: 'Invalid BSN'});
  if (!required) {
    schema = schema.or(z.literal('')).optional();
  }

  return {[key]: schema};
};

export default getValidationSchema;
