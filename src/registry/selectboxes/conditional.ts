import type {SelectboxesComponentSchema} from '@open-formulieren/types';

import type {TestConditional} from '@/registry/types';

const testConditional: TestConditional<SelectboxesComponentSchema> = (
  _: SelectboxesComponentSchema,
  // the `value` of the selectboxes option that should be checked
  compareValue: string,
  valueToTest: SelectboxesComponentSchema['defaultValue']
): boolean => {
  // note that someone *can* reference a `value` from the options that doesn't exist,
  // but we can't properly express that in the types here
  return valueToTest[compareValue] ?? false;
};

export default testConditional;
