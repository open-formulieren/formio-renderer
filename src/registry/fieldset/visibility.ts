import type {FieldsetComponentSchema} from '@open-formulieren/types';
import {setIn} from 'formik';

import type {ExcludeHiddenComponents} from '@/registry/types';
import {filterVisibleComponents} from '@/visibility';

const excludeHiddenComponents: ExcludeHiddenComponents<FieldsetComponentSchema> = (
  componentDefinition,
  values,
  parentHidden,
  getRegistryEntry
) => {
  const {components: nestedComponents} = componentDefinition;
  const {visibleComponents, values: updatedValues} = filterVisibleComponents(
    nestedComponents,
    values,
    getRegistryEntry
  );
  const newComponentDefinition: FieldsetComponentSchema = setIn(
    componentDefinition,
    'components',
    visibleComponents
  );
  return {
    componentDefinition: newComponentDefinition,
    values: updatedValues,
  };
};

export default excludeHiddenComponents;
