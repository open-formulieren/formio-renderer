import type {ColumnsComponentSchema} from '@open-formulieren/types';

import type {ExcludeHiddenComponents} from '@/registry/types';
import {filterVisibleComponents} from '@/visibility';

const excludeHiddenComponents: ExcludeHiddenComponents<ColumnsComponentSchema> = (
  componentDefinition,
  values,
  getRegistryEntry
) => {
  const updatedColumns = componentDefinition.columns.map(column => {
    const visible = filterVisibleComponents(column.components, values, getRegistryEntry);
    return {...column, components: visible};
  });
  return {...componentDefinition, columns: updatedColumns};
};

export default excludeHiddenComponents;
