import type {ColumnsComponentSchema} from '@open-formulieren/types';

import type {ExcludeHiddenComponents} from '@/registry/types';
import {filterVisibleComponents} from '@/visibility';

const excludeHiddenComponents: ExcludeHiddenComponents<ColumnsComponentSchema> = (
  componentDefinition,
  values,
  getRegistryEntry
) => {
  const updatedColumns = componentDefinition.columns.map(column => {
    const {visibleComponents} = filterVisibleComponents(
      column.components,
      values,
      getRegistryEntry
    );
    return {...column, components: visibleComponents};
  });
  return {...componentDefinition, columns: updatedColumns};
};

export default excludeHiddenComponents;
