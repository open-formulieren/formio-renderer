import type {SelectboxesComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';

import {assertManualValues} from './types';

const getInitialValues: GetInitialValues<
  SelectboxesComponentSchema,
  Record<string, boolean>
> = componentDefinition => {
  assertManualValues(componentDefinition);
  const {key, defaultValue, values} = componentDefinition;
  // ensure that each option from the available options has a default value, grabbing
  // the default from `defaultValue` if it's present and otherwise defaulting to `false`
  const defaults: Record<string, boolean> = values.reduce(
    (acc, {value}) => ({...acc, [value]: defaultValue?.[value] ?? false}),
    {} satisfies Record<string, boolean>
  );
  return {[key]: defaults};
};

export default getInitialValues;
