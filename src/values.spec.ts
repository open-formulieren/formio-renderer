import {expect, test} from 'vitest';

import type {JSONObject} from './types';
import {deepMergeValues} from './values';

test('Deep merge empty objects', () => {
  const result = deepMergeValues({}, {});

  expect(result).toEqual({});
});

test.each([
  {foo: 'bar'},
  {foo: {bar: 'baz'}},
  {foo: ['bar', 'baz']},
  {foo: 42},
  {foo: null},
  {foo: true},
  {foo: false},
] satisfies JSONObject[])('Deep merge with empty override (base: %s)', (base: JSONObject) => {
  const result = deepMergeValues(base, {});

  expect(result).toEqual(base);
});

test.each([
  [{}, {foo: 'bar'}, {foo: 'bar'}],
  [{foo: 'bar'}, {foo: 'baz'}, {foo: 'baz'}],
  [{one: 'one', two: 'two'}, {one: 'three'}, {one: 'three', two: 'two'}],
  [
    {foo: {bar: 'baz', other: null}},
    {foo: {bar: ['array', 'items']}},
    {foo: {bar: ['array', 'items'], other: null}},
  ],
] satisfies [JSONObject, JSONObject, JSONObject][])(
  'Deep merge overwrites base values (base: %s, overrides: %s)',
  (base: JSONObject, overrides: JSONObject, expected: JSONObject) => {
    const result = deepMergeValues(base, overrides);

    expect(result).toEqual(expected);
  }
);
