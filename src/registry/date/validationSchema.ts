import type {DateComponentSchema} from '@open-formulieren/types';
import {isValid, parseISO} from 'date-fns';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const getValidationSchema: GetValidationSchema<DateComponentSchema> = componentDefinition => {
  const {key, validate = {}} = componentDefinition;
  // FIXME: minDate and maxDate are typed as any in Formio's types!
  const {required, minDate, maxDate} = validate;

  let dateSchema = z.coerce.date();
  if (minDate) {
    dateSchema = dateSchema.min(parseISO(minDate));
  }
  if (maxDate) {
    dateSchema = dateSchema.max(parseISO(maxDate));
  }

  // TODO-82: this zod schema accepts 10-10-2000 as a valid date. Don't think this should be allowed
  // let schema: z.ZodFirstPartySchemaTypes = z.string().pipe(dateSchema);
  let schema: z.ZodFirstPartySchemaTypes = z
    .string()
    .refine(
      value => {
        const parsed = parseISO(value);
        return isValid(parsed);
      },
      {message: 'FOUT'}
    )
    .transform(value => parseISO(value));

  if (!required) {
    schema = z.union([schema, z.literal('')]).optional();
  }

  return {[key]: schema};
};

export default getValidationSchema;
