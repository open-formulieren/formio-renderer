import type {FieldsetComponentSchema} from '@open-formulieren/types';
import {setIn} from 'formik';

import type {ApplyVisibility} from '@/registry/types';
import {filterVisibleComponents} from '@/visibility';

const applyVisibility: ApplyVisibility<FieldsetComponentSchema> = (
  componentDefinition,
  values,
  context
) => {
  const {parentHidden, initialValues, getRegistryEntry} = context;
  const {components: nestedComponents} = componentDefinition;
  const {visibleComponents, values: updatedValues} = filterVisibleComponents(
    nestedComponents,
    values,
    initialValues,
    getRegistryEntry,
    parentHidden
  );
  const updatedDefinition: FieldsetComponentSchema = setIn(
    componentDefinition,
    'components',
    visibleComponents
  );
  return {updatedDefinition, updatedValues};
};

export default applyVisibility;
