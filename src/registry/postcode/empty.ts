import type {PostcodeComponentSchema} from '@open-formulieren/types';

import type {IsEmpty} from '@/registry/types';

const isEmpty: IsEmpty<PostcodeComponentSchema, string | string[]> = (_component, value) => {
  // Based on the formio textfield implementation https://github.com/formio/formio.js/blob/29939fc9d66f2b95527c90d3cf7729570c3d3010/src/components/textfield/TextField.js#L300
  if (value == null) {
    return true;
  }

  const isFalsy = (valueToCheck: unknown) =>
    valueToCheck == null || valueToCheck.toString().trim().length === 0;
  const isEmptyArray = Array.isArray(value) && value.every(isFalsy);

  // in edge cases the existing data & component.multiple may be misaligned
  // (updating form definitions for existing submissions), so look at the actual data
  // type rather than what it *should* be.
  return Array.isArray(value) ? value.length === 0 || isEmptyArray : isFalsy(value || '');
};

export default isEmpty;
