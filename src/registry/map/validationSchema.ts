import type {MapComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const getValidationSchema: GetValidationSchema<MapComponentSchema> = componentDefinition => {
  const {key, validate = {}} = componentDefinition;
  const {required} = validate;

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

  if (!required) {
    schema = schema.optional();
  }

  return {[key]: schema};
};

export default getValidationSchema;
