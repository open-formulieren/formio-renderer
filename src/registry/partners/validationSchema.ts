import type {PartnersComponentSchema} from '@open-formulieren/types';
import {isValid, parseISO, subDays, subYears} from 'date-fns';
import type {IntlShape} from 'react-intl';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildBsnValidationSchema} from '@/validationSchemas/bsn';
import {getErrorMessage} from '@/validationSchemas/errorMessages';

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

const buildDateOfBirthSchema = (intl: IntlShape): z.ZodFirstPartySchemaTypes => {
  const today = new Date();

  const minDate = subYears(today, 120);
  const maxDate = subDays(today, 1);

  const dateSchema = z.coerce
    .date()
    .min(minDate, {message: intl.formatMessage(DATE_OF_BIRTH_MIN_DATE_MESSAGE)})
    .max(maxDate, {message: intl.formatMessage(DATE_OF_BIRTH_MAX_DATE_MESSAGE)});

  return z
    .string({
      required_error: intl.formatMessage(getErrorMessage('required'), {
        field: 'partners.dateOfBirth',
        fieldLabel: 'Date of birth',
      }),
    })
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
  {intl}
) => {
  const {key} = componentDefinition;

  // Define partners schema
  const partnersSchema = z.array(
    z.object({
      bsn: buildBsnValidationSchema(intl),
      initials: z.string().optional(),
      affixes: z.string().optional(),
      lastName: z
        .string({
          message: intl.formatMessage(getErrorMessage('required'), {
            field: 'partners.lastName',
            fieldLabel: 'Lastname',
          }),
        })
        .min(1),
      dateOfBirth: buildDateOfBirthSchema(intl),
      // __addedManually must either be true or undefined.
      __addedManually: z.literal<boolean>(true).optional(),
    })
  );

  return {[key]: partnersSchema};
};

export default getValidationSchema;
