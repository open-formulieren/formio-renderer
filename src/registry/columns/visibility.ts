import type {ColumnsComponentSchema} from '@open-formulieren/types';
import {setIn} from 'formik';

import type {ExcludeHiddenComponents} from '@/registry/types';
import {filterVisibleComponents} from '@/visibility';

const excludeHiddenComponents: ExcludeHiddenComponents<ColumnsComponentSchema> = (
  componentDefinition,
  values,
  initialValues,
  parentHidden,
  getRegistryEntry
) => {
  const updatedColumns = componentDefinition.columns.map(column => {
    const {visibleComponents, values: updatedValues} = filterVisibleComponents(
      column.components,
      values,
      initialValues,
      getRegistryEntry,
      parentHidden
    );
    // make sure to update this for the next iteration so that it sees the up-to-date
    // side-effects of clearOnHide
    values = updatedValues;
    return {...column, components: visibleComponents};
  });

  const newComponentDefinition: ColumnsComponentSchema = setIn(
    componentDefinition,
    'columns',
    updatedColumns
  );
  return {
    componentDefinition: newComponentDefinition,
    values: values,
  };
};

export default excludeHiddenComponents;
