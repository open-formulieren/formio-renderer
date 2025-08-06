import type {SelectboxesComponentSchema} from '@open-formulieren/types';

import {IsEmpty} from '@/registry/types';

const isEmpty: IsEmpty<SelectboxesComponentSchema, Record<string, boolean> | null | undefined> = (
  _componentDefinition,
  value
) => {
  // Based on Formio selectboxes isEmpty implementation: https://github.com/formio/formio.js/blob/master/src/components/selectboxes/SelectBoxes.js
  if (value == null) {
    return true;
  }

  let empty = true;
  for (const key in value) {
    if (value[key]) {
      empty = false;
      break;
    }
  }

  return empty;
};

export default isEmpty;
