import type {MapComponentSchema} from '@open-formulieren/types';
import {expect, test} from 'vitest';

import type {JSONObject} from '@/types';

import isEmpty from './empty';

test.each([
  // Empty states
  [undefined, true],
  [null, true],
  [NaN, true],
  // Non-empty states
  [{}, false],
  [
    {
      type: 'Point',
      coordinates: [5.291266, 52.1326332],
    },
    false,
  ],
])(
  'file isEmpty compares against defined, non-empty array state of value',
  (valueToTest: JSONObject | null, expected: boolean) => {
    const component: MapComponentSchema = {
      type: 'map',
      key: 'map',
      id: 'map',
      label: 'Map field',
    };

    const result = isEmpty(component, valueToTest);
    expect(result).toBe(expected);
  }
);
