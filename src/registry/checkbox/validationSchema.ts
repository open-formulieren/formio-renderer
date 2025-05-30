import type {CheckboxComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const getValidationSchema: GetValidationSchema<CheckboxComponentSchema> = componentDefinition => {
  const {key, validate = {}} = componentDefinition;
  const {required} = validate;

  const schema: z.ZodEffects<z.ZodBoolean> = z.boolean().superRefine((val, ctx) => {
    if (required && !val) {
      // see open-forms-sdk `src/hooks/useZodErrorMap.jsx`
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        // a lie, but required for the error map hook
        received: z.ZodParsedType.undefined,
        expected: z.ZodParsedType.boolean,
      });
    }
  });

  return {[key]: schema};
};

export default getValidationSchema;
