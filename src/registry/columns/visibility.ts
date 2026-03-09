import type {ColumnsComponentSchema} from '@open-formulieren/types';
import type {Column} from '@open-formulieren/types/dist/components/columns';
import {setIn} from 'formik';

import type {ApplyVisibility} from '@/registry/types';
import {processVisibility} from '@/visibility';

const applyVisibility: ApplyVisibility<ColumnsComponentSchema> = (
  componentDefinition,
  values,
  errors,
  context
) => {
  const updatedColumns: Column[] = componentDefinition.columns.map(column => {
    const {visibleComponents, updatedValues, updatedErrors} = processVisibility(
      column.components,
      values,
      errors,
      context
    );
    // make sure to update this for the next iteration so that it sees the up-to-date
    // side-effects of clearOnHide
    values = updatedValues;
    errors = updatedErrors;
    return setIn(column, 'components', visibleComponents);
  });

  const updatedDefinition: ColumnsComponentSchema = setIn(
    componentDefinition,
    'columns',
    updatedColumns
  );

  return {updatedDefinition, updatedValues: values, updatedErrors: errors};
};

export default applyVisibility;
