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
    validatePlugins: async (plugins: string[]) =>
      plugins.includes('fail') ? 'not valid' : undefined,
  });
  return schemas[component.key];
};

describe('map component validation', () => {
  test.each([
    null,
    {
      type: 'Point',
      coordinates: [4.8417475, 52.3857386],
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
    const component: MapComponentSchema = {
      ...BASE_COMPONENT,
      interactions: {marker: true, polyline: true, polygon: true},
    };
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

  test.each([undefined])('Non-required component: %s', value => {
    const schema = buildValidationSchema({...BASE_COMPONENT, validate: {required: false}});

    const {success} = schema.safeParse(value);

    expect(success).toBe(true);
  });

  test.each([undefined])('Required component: %s', value => {
    const schema = buildValidationSchema({...BASE_COMPONENT, validate: {required: true}});

    const {success} = schema.safeParse(value);

    expect(success).toBe(false);
  });

  test.each([
    ['ok', true],
    ['fail', false],
  ])('supports async plugin validation (plugin: %s)', async (plugin: string, valid: boolean) => {
    const component: MapComponentSchema = {
      ...BASE_COMPONENT,
      validate: {plugins: [plugin]},
    };
    const schema = buildValidationSchema(component);

    const value = {
      type: 'Point',
      coordinates: [4.8417475, 52.3857386],
    };
    const {success} = await schema.safeParseAsync(value);

    expect(success).toBe(valid);
  });
});

describe('map component coordinates bounds validation', () => {
  test.each([
    [
      // Latitude and longitude in wrong order
      {
        type: 'Point',
        coordinates: [52.3857386, 4.8417475],
      },
      false,
    ],
    [
      // Latitude out of Dutch bounds
      {
        type: 'Point',
        coordinates: [4.8417475, 56.3857386],
      },
      false,
    ],
    [
      // Longitude out of Dutch bounds
      {
        type: 'Point',
        coordinates: [9.8417475, 52.3857386],
      },
      false,
    ],
    [
      // Latitude and longitude out of Dutch bounds
      {
        type: 'Point',
        coordinates: [9.8417475, 56.3857386],
      },
      false,
    ],
    [
      // Latitude and longitude in Dutch bounds
      {
        type: 'Point',
        coordinates: [4.8417475, 52.3857386],
      },
      true,
    ],
  ])('Point geometry coordinate bounds %s (expected %s)', (value, expected) => {
    const component: MapComponentSchema = {
      ...BASE_COMPONENT,
      interactions: {marker: true, polyline: true, polygon: true},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(expected);
  });

  test.each([
    [
      // Latitude and longitude in wrong order
      {
        type: 'LineString',
        coordinates: [
          [52.6405471, 4.7493255],
          [52.4405471, 4.6493255],
          [52.2405471, 4.5493255],
        ],
      },
      false,
    ],
    [
      // Latitude out of Dutch bounds
      {
        type: 'LineString',
        coordinates: [
          [4.7493255, 56.6405471],
          [4.6493255, 56.4405471],
          [4.5493255, 56.2405471],
        ],
      },
      false,
    ],
    [
      // Longitude out of Dutch bounds
      {
        type: 'LineString',
        coordinates: [
          [9.7493255, 52.6405471],
          [9.6493255, 52.4405471],
          [9.5493255, 52.2405471],
        ],
      },
      false,
    ],
    [
      // Latitude and longitude out of Dutch bounds
      {
        type: 'LineString',
        coordinates: [
          [9.7493255, 56.6405471],
          [9.6493255, 56.4405471],
          [9.5493255, 56.2405471],
        ],
      },
      false,
    ],
    [
      // Latitude and longitude in Dutch bounds
      {
        type: 'LineString',
        coordinates: [
          [4.7493255, 52.6405471],
          [4.6493255, 52.4405471],
          [4.5493255, 52.2405471],
        ],
      },
      true,
    ],
  ])('Line geometry coordinate bounds %s (expected %s)', (value, expected) => {
    const component: MapComponentSchema = {
      ...BASE_COMPONENT,
      interactions: {marker: true, polyline: true, polygon: true},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(expected);
  });

  test.each([
    [
      // Latitude and longitude in wrong order
      {
        type: 'Polygon',
        coordinates: [
          [
            [52.1326332, 5.291266],
            [52.128332, 5.091266],
            [52.48332, 5.591266],
          ],
        ],
      },
      false,
    ],
    [
      // Latitude out of Dutch bounds
      {
        type: 'Polygon',
        coordinates: [
          [
            [5.291266, 56.1326332],
            [5.091266, 56.128332],
            [5.591266, 56.48332],
          ],
        ],
      },
      false,
    ],
    [
      // Longitude out of Dutch bounds
      {
        type: 'Polygon',
        coordinates: [
          [
            [9.291266, 52.1326332],
            [9.091266, 52.128332],
            [9.591266, 52.48332],
          ],
        ],
      },
      false,
    ],
    [
      // Latitude and longitude out of Dutch bounds
      {
        type: 'Polygon',
        coordinates: [
          [
            [9.291266, 56.1326332],
            [9.091266, 56.128332],
            [9.591266, 56.48332],
          ],
        ],
      },
      false,
    ],
    [
      // Latitude and longitude in Dutch bounds
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
      true,
    ],
  ])('Polygon geometry coordinate bounds %s (expected %s)', (value, expected) => {
    const component: MapComponentSchema = {
      ...BASE_COMPONENT,
      interactions: {marker: true, polyline: true, polygon: true},
    };
    const schema = buildValidationSchema(component);

    const {success} = schema.safeParse(value);

    expect(success).toBe(expected);
  });
});
