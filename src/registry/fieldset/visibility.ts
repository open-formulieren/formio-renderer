import type {FieldsetComponentSchema} from '@open-formulieren/types';

import type {ExcludeHiddenComponents} from '@/registry/types';
import {filterVisibleComponents} from '@/visibility';

const excludeHiddenComponents: ExcludeHiddenComponents<FieldsetComponentSchema> = (
  componentDefinition,
  values,
  getRegistryEntry
) => {
  const {components: nestedComponents} = componentDefinition;
  const {visibleComponents} = filterVisibleComponents(nestedComponents, values, getRegistryEntry);
  return {...componentDefinition, components: visibleComponents};
};

export default excludeHiddenComponents;
