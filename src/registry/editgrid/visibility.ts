import type {EditGridComponentSchema} from '@open-formulieren/types';
import {getIn, replace, setIn} from 'formik';

import type {ApplyVisibility} from '@/registry/types';
import type {JSONObject} from '@/types';
import {extractInitialValues} from '@/values';
import {processVisibility} from '@/visibility';

const applyVisibility: ApplyVisibility<EditGridComponentSchema> = (
  componentDefinition,
  values,
  context
) => {
  const {key, components} = componentDefinition;
  const initialValues = extractInitialValues(components, context.getRegistryEntry);

  // ensure we keep adding to the parent scope in case of nested edit grids
  const outerGetEvaluationScope = context?.getEvaluationScope ?? ((v: JSONObject): JSONObject => v);

  let items: JSONObject[] = getIn(values, key) ?? [];
  for (let index: number = 0; index < items.length; index++) {
    const itemValues = items[index];

    const getEvaluationScope = (itemValues: JSONObject): JSONObject => {
      const innerEvaluationScope: JSONObject = setIn(values, key, itemValues);
      return outerGetEvaluationScope(innerEvaluationScope);
    };

    // we cannot process visibleComponents and omit the hidden ones, as there is no
    // definition for a single item -> the display layer needs to do this. We can only
    // process the value mutations, which (in turn) drive the presentation.
    const {updatedValues: updatedItemValues} = processVisibility(components, itemValues, {
      ...context,
      initialValues,
      getEvaluationScope,
    });

    // process an update by replace the item
    if (updatedItemValues !== itemValues) {
      items = replace(items, index, updatedItemValues) as JSONObject[];
    }
  }

  // update the array value of the edit grid - if no items were changed, this is an
  // identity update and no state changes will trigger
  const updatedValues: JSONObject = setIn(values, key, items);

  return {
    updatedDefinition: componentDefinition,
    updatedValues: updatedValues,
  };
};

export default applyVisibility;
