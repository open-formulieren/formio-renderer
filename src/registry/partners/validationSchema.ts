import type {PartnersComponentSchema} from '@open-formulieren/types';
import {isValid, parseISO, subDays, subYears} from 'date-fns';
import type {IntlShape} from 'react-intl';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const BSN_STRUCTURE_MESSAGE = defineMessage({
  description: 'Validation error for partners.bsn that does not match the shape of BSN.',
  defaultMessage: 'A BSN must be 9 digits.',
});

const BSN_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for partners.bsn that does not pass the 11-test.',
  defaultMessage: 'Invalid BSN.',
});

const DATE_OF_BIRTH_MIN_DATE_MESSAGE = defineMessage({
  description: 'Validation error for partners.dateOfBirth that is after the minimum date.',
  defaultMessage: 'Date of birth must be within the last 120 years.',
});

const DATE_OF_BIRTH_MAX_DATE_MESSAGE = defineMessage({
  description: 'Validation error for partners.dateOfBirth that is after the maximum date.',
  defaultMessage: 'Date of birth cannot be in the future.',
});

const DATE_OF_BIRTH_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for partners.dateOfBirth invalid format.',
  defaultMessage: 'The format of the date of birth is incorrect.',
});

const LAST_NAME_REQUIRED_MESSAGE = defineMessage({
  description: 'Validation error for required partners.lastName field.',
  defaultMessage: 'You must provide a last name.',
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

const buildBsnSchema = (intl: IntlShape): z.ZodFirstPartySchemaTypes => {
  return z
    .string()
    .length(9, {message: intl.formatMessage(BSN_STRUCTURE_MESSAGE)})
    .regex(/[0-9]{9}/, {message: intl.formatMessage(BSN_STRUCTURE_MESSAGE)})
    .refine(isValidBsn, {message: intl.formatMessage(BSN_INVALID_MESSAGE)});
};

const buildDateOfBirthSchema = (intl: IntlShape): z.ZodFirstPartySchemaTypes => {
  const today = new Date();

  const minDate = subYears(today, 120);
  const maxDate = subDays(today, 1);

  const dateSchema = z.coerce
    .date()
    .min(minDate, {message: intl.formatMessage(DATE_OF_BIRTH_MIN_DATE_MESSAGE)})
    .max(maxDate, {message: intl.formatMessage(DATE_OF_BIRTH_MAX_DATE_MESSAGE)});

  return z
    .string()
    .refine(
      value => {
        const parsed = parseISO(value);
        return isValid(parsed);
      },
      {message: intl.formatMessage(DATE_OF_BIRTH_INVALID_MESSAGE)}
    )
    .pipe(dateSchema);
};

/**
 * Partners component validation schema for validating partner component values.
 *
 * The partner component has some edge-cases that should be impossible, and therefore are
 * not covered in this validation schema. This includes:
 * - adding multiple partners manually
 * - combining manually added and server fetched partners
 * - having partners with the same bsn number
 */
const getValidationSchema: GetValidationSchema<PartnersComponentSchema> = (
  componentDefinition,
  intl
) => {
  const {key} = componentDefinition;

  // Define partners schema
  const partnersSchema = z.array(
    z.object({
      bsn: buildBsnSchema(intl),
      initials: z.string().optional(),
      affixes: z.string().optional(),
      lastName: z.string().min(1, {message: intl.formatMessage(LAST_NAME_REQUIRED_MESSAGE)}),
      dateOfBirth: buildDateOfBirthSchema(intl),
      // __addedManually must either be true or undefined.
      __addedManually: z.literal<boolean>(true).optional(),
    })
  );

  return {[key]: partnersSchema};
};

export default getValidationSchema;
