import type {MapComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildRequiredMessage} from '@/validationSchemas/errorMessages';

import {DEFAULT_INTERACTIONS} from './constants';

const coordinatesSchema = z.array(z.number()).length(2);

const pointSchema = z.object({
  type: z.literal('Point'),
  coordinates: coordinatesSchema,
});

const lineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(coordinatesSchema).min(2),
});

const polygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(coordinatesSchema).min(1)).length(1),
});

const getValidationSchema: GetValidationSchema<MapComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {
    key,
    label,
    validate = {},
    interactions = DEFAULT_INTERACTIONS,
    errors,
  } = componentDefinition;
  const {required, plugins = []} = validate;

  // start with z.null, we check validate.required manually in a refine step.
  let schema: z.ZodFirstPartySchemaTypes = z.null();
  // build the schema based on allowed interactions
  if (interactions.marker) {
    schema = schema.or(pointSchema);
  }
  if (interactions.polyline) {
    schema = schema.or(lineStringSchema);
  }
  if (interactions.polygon) {
    schema = schema.or(polygonSchema);
  }

  if (required) {
    schema = schema.refine(val => !!val, {
      message: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
    });
  } else {
    schema = schema.or(z.null()).optional();
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
