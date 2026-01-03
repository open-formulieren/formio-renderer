import type {SelectboxesComponentSchema} from '@open-formulieren/types';

import type {TestConditional} from '@/registry/types';

const testConditional: TestConditional<SelectboxesComponentSchema> = (
  _: SelectboxesComponentSchema,
  // the `value` of the selectboxes option that should be checked
  compareValue: string,
  valueToTest
): boolean => {
  if (Array.isArray(valueToTest) || typeof valueToTest !== 'object' || valueToTest == null) {
    return false;
  }
  // note that someone *can* reference a `value` from the options that doesn't exist,
  // but we can't properly express that in the types here
  const value = valueToTest[compareValue];
  if (value == undefined) return false;
  if (typeof value !== 'boolean') return false;
  return value ?? false;
};

export default testConditional;
