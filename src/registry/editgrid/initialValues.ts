import type {EditGridComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';
import type {JSONObject} from '@/types';

const getInitialValues: GetInitialValues<EditGridComponentSchema, JSONObject[]> = ({
  key,
  defaultValue = [],
}: EditGridComponentSchema) => {
  // For some reason the defaultValue is not properly set to an (empty) array by the
  // formio.js builder in the backend, so we need to handle this case even though it
  // should not be possible according to the type definitions.
  if (defaultValue == null) {
    defaultValue = [];
  }

  // we just expose the component definition default value. This is not a layout
  // component, so we needn't recurse into the `components` property.
  // FXIME in upstream types repo: instead of `unknown` type, use `JSONObject` since we
  // know that the default value must be an array and JSON serializable.
  return {[key]: defaultValue as JSONObject[]};
};

export default getInitialValues;
