import type {ColumnsComponentSchema} from '@open-formulieren/types';
import type {Column} from '@open-formulieren/types/dist/components/columns';
import {setIn} from 'formik';

import type {ApplyVisibility} from '@/registry/types';
import {processVisibility} from '@/visibility';

const applyVisibility: ApplyVisibility<ColumnsComponentSchema> = (
  componentDefinition,
  values,
  context
) => {
  const updatedColumns: Column[] = componentDefinition.columns.map(column => {
    const {visibleComponents, updatedValues} = processVisibility(
      column.components,
      values,
      context
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
