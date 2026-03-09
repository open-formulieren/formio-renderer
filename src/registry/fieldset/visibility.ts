import type {FieldsetComponentSchema} from '@open-formulieren/types';
import {setIn} from 'formik';

import type {ApplyVisibility} from '@/registry/types';
import {processVisibility} from '@/visibility';

const applyVisibility: ApplyVisibility<FieldsetComponentSchema> = (
  componentDefinition,
  values,
  errors,
  context
) => {
  const {components: nestedComponents} = componentDefinition;

  const {visibleComponents, updatedValues, updatedErrors} = processVisibility(
    nestedComponents,
    values,
    errors,
    context
  );

  const updatedDefinition: FieldsetComponentSchema = setIn(
    componentDefinition,
    'components',
    visibleComponents
  );
  return {updatedDefinition, updatedValues, updatedErrors};
};

export default applyVisibility;
