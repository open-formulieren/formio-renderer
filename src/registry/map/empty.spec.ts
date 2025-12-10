import type {MapComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import {getRegistryEntry} from '@/registry';
import type {JSONObject} from '@/types';

import isEmpty from './empty';

test.each([
  // Empty states

  // An empty value besides undefined and null should never happen, as the data is directly
  // set from Leaflet interactions. If it does happen, then there must be a bug somewhere
  // which must be fixed.

  [undefined, true],
  [null, true],

  // Non-empty states
  [
    {
      type: 'Point',
      coordinates: [5.291266, 52.1326332],
    },
    false,
  ],
])(
  'Map isEmpty compares against defined state of value',
  (valueToTest: JSONObject | undefined | null, expected: boolean) => {
    const component: MapComponentSchema = {
      type: 'map',
      key: 'map',
      id: 'map',
      label: 'Map field',
    };

    const result = isEmpty(component, valueToTest, getRegistryEntry);
    expect(result).toBe(expected);
  }
);
