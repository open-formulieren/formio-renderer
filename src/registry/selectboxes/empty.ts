import type {SelectboxesComponentSchema} from '@open-formulieren/types';

import {IsEmpty} from '@/registry/types';

const isEmpty: IsEmpty<SelectboxesComponentSchema, Record<string, boolean> | null> = (
  _componentDefinition,
  value
) => {
  // Based on Formio selectboxes isEmpty implementation: https://github.com/formio/formio.js/blob/master/src/components/selectboxes/SelectBoxes.js
  if (value === undefined) {
    return true;
  }

  for (const key in value) {
    if (value[key]) {
      return false;
    }
  }

  // If not of the values are `true`, then the selectboxes component is empty.
  return true;
};

export default isEmpty;
