import {getIn, setIn} from 'formik';

import type {JSONValue} from '@/types';

/**
 * @private
 */
export type NestedObject<Leaf> = {
  [K: string]: MaybeNestedObject<Leaf>;
};

/**
 * @private
 */
export type MaybeNestedObject<Leaf> = Leaf | NestedObject<Leaf>;

/**
 * Deep merge source into target, returning shallow copies to keep unchanged identities
 * stable.
 *
 * @private
 */
export function merge<Leaf extends JSONValue>(
  target: NestedObject<Leaf>,
  source: NestedObject<Leaf | undefined>
): NestedObject<Leaf> {
  // loop over the keys that are defined, this way we detect explicit `undefined` keys
  // rather than the ones that are absent or explicitly set.
  for (const key in source) {
    const value = source[key];

    // if the values is explicitly set to undefined, it means the key must be removed.
    if (value === undefined) {
      target = setIn(target, key, undefined);
      continue;
    }

    // recurse
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      let intermediate: NestedObject<Leaf> | undefined = getIn(target, key);
      if (intermediate === undefined) {
        intermediate = {};
        target = setIn(target, key, intermediate);
      }

      const nested = merge(intermediate, value as NestedObject<Leaf>);
      target = setIn(target, key, nested);
      continue;
    }

    if (value && Array.isArray(value)) {
      // Arrays are used in:
      // * editgrid components
      // * file upload components
      // * components that have `multiple: true`
      //
      // Because JSON doesn't have the `undefined` concept to potentially remove array
      // items, we treat an array value as a "replace" action and don't recurse for
      // partial updates. If partial updates are required, you should emit
      // `parent.$index.nested` keys in the `source` object.
      target = setIn(target, key, value);
      continue;
    }

    // otherwise we have a primitive, so just assign it
    target = setIn(target, key, value);
  }

  return target;
}
