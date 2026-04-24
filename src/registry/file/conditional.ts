import type {FileComponentSchema} from '@open-formulieren/types';

import type {TestConditional} from '@/registry/types';

// should normally be FileUploadData[], but due to historical reasons/mistakes strings
// are actually returned
const testConditional: TestConditional<FileComponentSchema, string> = (
  _: FileComponentSchema,
  compareValue,
  valueToTest
): boolean => {
  if (!Array.isArray(valueToTest)) return false;
  // we normalize empty strings to the semantic meaning of 'are there no file uploads?'
  // which requires the value array to be empty.
  return compareValue === '' && valueToTest.length === 0;
};

export default testConditional;
