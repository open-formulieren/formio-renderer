import type {ChildDetails, ChildrenComponentSchema} from '@open-formulieren/types';
import {isValid, parseISO, subDays, subYears} from 'date-fns';
import {defineMessage} from 'react-intl';
import type {IntlShape} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildBsnValidationSchema} from '@/validationSchemas/bsn';
import {getErrorMessage} from '@/validationSchemas/errorMessages';

const DATE_OF_BIRTH_MIN_DATE_MESSAGE = defineMessage({
  description: 'Validation error for children.dateOfBirth that is after the minimum date.',
  defaultMessage: 'Date of birth must be within the last 120 years.',
});

const DATE_OF_BIRTH_MAX_DATE_MESSAGE = defineMessage({
  description: 'Validation error for children.dateOfBirth that is after the maximum date.',
  defaultMessage: 'Date of birth cannot be in the future.',
});

const DATE_OF_BIRTH_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for children.dateOfBirth invalid format.',
  defaultMessage: 'The format of the date of birth is incorrect.',
});

const DUPLICATE_BSN_VALUES_MESSAGE = defineMessage({
  description: 'Validation error for duplicate children.bsn values.',
  defaultMessage: 'The BSN {bsn} is used for multiple children. Each child must have a unique BSN.',
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
        field: 'children.dateOfBirth',
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

const buildChildSchema = (intl: IntlShape): z.ZodSchema => {
  return z.object({
    bsn: buildBsnValidationSchema(intl),
    firstNames: z
      .string({
        required_error: intl.formatMessage(getErrorMessage('required'), {
          field: 'children.firstNames',
          fieldLabel: 'First name',
        }),
      })
      .min(1),
    dateOfBirth: buildDateOfBirthSchema(intl),
    selected: z.boolean().optional(),
    // __addedManually must either be true or undefined.
    __addedManually: z.literal<boolean>(true).optional(),
    // __id must be a string or undefined.
    __id: z.string().optional(),
  });
};

const getValidationSchema: GetValidationSchema<ChildrenComponentSchema> = (
  componentDefinition,
  {intl}
) => {
  const {key} = componentDefinition;

  // Define children schema
  const childrenSchema: z.ZodFirstPartySchemaTypes = z
    .array(buildChildSchema(intl))
    .superRefine(async (val: ChildDetails[], ctx) => {
      // Check for duplicate bsn's
      const duplicateBsns = val.reduce<string[]>((carry, value, index) => {
        if (val.findIndex(c => c.bsn === value.bsn) !== index) {
          carry.push(value.bsn);
        }
        return carry;
      }, []);

      if (duplicateBsns.length) {
        duplicateBsns.forEach(bsn => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: intl.formatMessage(DUPLICATE_BSN_VALUES_MESSAGE, {bsn}),
          });
        });
      }
    })
    .optional();

  return {[key]: childrenSchema};
};

export default getValidationSchema;
export {buildChildSchema};
