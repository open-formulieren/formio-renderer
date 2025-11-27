import type {MapComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const getValidationSchema: GetValidationSchema<MapComponentSchema> = (
  componentDefinition,
  {validatePlugins}
) => {
  const {key, validate = {}, errors} = componentDefinition;
  const {required, plugins = []} = validate;

  const coordinates = z.array(z.number()).length(2);
  const pointValue = coordinates;
  const lineValue = z.array(coordinates).min(1);
  const polygonValue = z.array(z.array(coordinates).min(1)).length(1);
  let schema: z.ZodFirstPartySchemaTypes = z.union([
    z.object({
      type: z.literal('Point'),
      coordinates: pointValue,
    }),
    z.object({
      type: z.literal('LineString'),
      coordinates: lineValue,
    }),
    z.object({
      type: z.literal('Polygon'),
      coordinates: polygonValue,
    }),
    z.null(),
  ]);

  if (required) {
    schema = schema.superRefine((val, ctx) => {
      if (!val) {
        // see open-forms-sdk `src/hooks/useZodErrorMap.jsx`
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_type,
          // a lie, but required for the error map hook
          received: z.ZodParsedType.undefined,
          expected: z.ZodParsedType.object,
          message: errors?.required,
        });
      }
    });
  } else {
    schema = schema.optional();
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

  return {[key]: schema};
};

export default getValidationSchema;
