import type {MapComponentSchema} from '@open-formulieren/types';
import {createIntl} from 'react-intl';
import {describe, expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry/registry';

import getValidationSchema from './validationSchema';

const intl = createIntl({locale: 'en', messages: {}});

const BASE_COMPONENT: MapComponentSchema = {
  type: 'map',
  id: 'map',
  key: 'map',
  label: 'Map field',
};

const buildValidationSchema = (component: MapComponentSchema) => {
  const schemas = getValidationSchema(component, {
    intl,
    getRegistryEntry,
    validatePlugins: async () => undefined,
  });
  return schemas[component.key];
};

describe('map component validation', () => {
  test.each([
    null,
    {
      type: 'Point',
      coordinates: [52.3857386, 4.8417475],
    },
    {
      type: 'LineString',
      coordinates: [
        [4.7493255, 52.6405471],
        [4.6493255, 52.4405471],
        [4.5493255, 52.2405471],
      ],
    },
    {
      type: 'Polygon',
      coordinates: [
        [
          [5.291266, 52.1326332],
          [5.091266, 52.128332],
          [5.591266, 52.48332],
        ],
      ],
    },
  ])('valid values', value => {
    const component: MapComponentSchema = BASE_COMPONENT;
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each([
    {},
    {
      type: 'Point',
      coordinates: [],
    },
    {
      type: 'Point',
      coordinates: null,
    },
    {
      type: 'LineString',
      coordinates: [[]],
    },
    {
      type: 'LineString',
      coordinates: null,
    },
    {
      type: 'Polygon',
      coordinates: [[[]]],
    },
    {
      type: 'Polygon',
      coordinates: null,
    },
    {
      type: 'Point',
      coordinates: [4.8417475],
    },
    {
      type: 'Point',
      coordinates: [4.8417475, 4.8417475, 4.8417475],
    },
    {
      type: 'Point',
      coordinates: [null, null],
    },
    {
      type: 'Point',
      coordinates: [null, null],
    },
    {
      type: 'Point',
      coordinates: '',
    },
    // Incorrect type
    {
      type: 'Point',
      coordinates: [
        [
          [5.291266, 52.1326332],
          [5.091266, 52.128332],
          [5.591266, 52.48332],
        ],
      ],
    },
    // See second inner array element
    {
      type: 'LineString',
      coordinates: [
        [5.291266, 52.1326332],
        [5.091266, null],
        [5.591266, 52.48332],
      ],
    },
    // See second inner array element
    {
      type: 'LineString',
      coordinates: [[5.291266, 52.1326332], [5.091266], [5.591266, 52.48332]],
    },
    // See second inner array element
    {
      type: 'Polygon',
      coordinates: [
        [
          [5.291266, 52.1326332],
          [5.091266, null],
          [5.591266, 52.48332],
        ],
      ],
    },
    // See second inner array element
    {
      type: 'Polygon',
      coordinates: [[[5.291266, 52.1326332], [5.091266], [5.591266, 52.48332]]],
    },
    '',
  ])('Invalid values: %s', value => {
    const schema = buildValidationSchema(BASE_COMPONENT);

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });
});
