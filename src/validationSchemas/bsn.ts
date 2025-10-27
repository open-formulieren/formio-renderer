import type {IntlShape} from 'react-intl';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

const BSN_STRUCTURE_MESSAGE = defineMessage({
  description: 'Validation error describing shape of BSN.',
  defaultMessage: 'A BSN must be 9 digits.',
});

const BSN_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for BSN that does not pass the 11-test.',
  defaultMessage: 'Invalid BSN.',
});

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

/**
 * Build a zod schema for the basic BSN validation rules: 9 digits and conform the
 * 11-test.
 */
export const buildBsnValidationSchema = (intl: IntlShape): z.ZodFirstPartySchemaTypes => {
  return z
    .string()
    .length(9, {message: intl.formatMessage(BSN_STRUCTURE_MESSAGE)})
    .regex(/[0-9]{9}/, {message: intl.formatMessage(BSN_STRUCTURE_MESSAGE)})
    .refine(isValidBsn, {message: intl.formatMessage(BSN_INVALID_MESSAGE)});
};
