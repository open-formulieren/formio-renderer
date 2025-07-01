import type {FieldsetComponentSchema} from '@open-formulieren/types';
import {setIn} from 'formik';

import type {ApplyVisibility} from '@/registry/types';
import {processVisibility} from '@/visibility';

const applyVisibility: ApplyVisibility<FieldsetComponentSchema> = (
  componentDefinition,
  values,
  context
) => {
  const {components: nestedComponents} = componentDefinition;

  const {visibleComponents, updatedValues} = processVisibility(nestedComponents, values, context);

  const updatedDefinition: FieldsetComponentSchema = setIn(
    componentDefinition,
    'components',
    visibleComponents
  );
  return {updatedDefinition, updatedValues};
};

export default applyVisibility;
