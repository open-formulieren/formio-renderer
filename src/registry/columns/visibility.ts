import type {Column, ColumnsComponentSchema} from '@open-formulieren/types';
import {setIn} from 'formik';

import type {ApplyVisibility} from '@/registry/types';
import {filterVisibleComponents} from '@/visibility';

const applyVisibility: ApplyVisibility<ColumnsComponentSchema> = (
  componentDefinition,
  values,
  context
) => {
  const {parentHidden, initialValues, getRegistryEntry} = context;

  const updatedColumns: Column[] = componentDefinition.columns.map(column => {
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
    return setIn(column, 'components', visibleComponents);
  });

  const updatedDefinition: ColumnsComponentSchema = setIn(
    componentDefinition,
    'columns',
    updatedColumns
  );

  return {updatedDefinition, updatedValues: values};
};

export default applyVisibility;
