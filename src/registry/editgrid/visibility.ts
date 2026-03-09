import type {EditGridComponentSchema} from '@open-formulieren/types';
import {getIn, replace, setIn} from 'formik';

import type {ApplyVisibility} from '@/registry/types';
import type {JSONObject} from '@/types';
import {extractInitialValues} from '@/values';
import type {Errors} from '@/visibility';
import {processVisibility} from '@/visibility';

const applyVisibility: ApplyVisibility<EditGridComponentSchema> = (
  componentDefinition,
  values,
  errors,
  context
) => {
  const {key, components} = componentDefinition;
  const initialValues = extractInitialValues(components, context.getRegistryEntry);

  // ensure we keep adding to the parent scope in case of nested edit grids
  const outerGetEvaluationScope = context?.getEvaluationScope ?? ((v: JSONObject): JSONObject => v);

  let items: JSONObject[] | undefined = getIn(values, key);
  let itemsErrors: Errors[] | string | undefined = getIn(errors, key);

  // Make sure `clearOnHide` actually clears the edit-grid
  if (items === undefined) {
    return {
      updatedDefinition: componentDefinition,
      updatedValues: values,
      updatedErrors: errors,
    };
  }

  for (let index: number = 0; index < items.length; index++) {
    const itemValues = items[index];

    // extract the errors for the particular edit grid item. These are either:
    // - undefined (no errors at all)
    // - a string - for an error for the item as a whole
    // - an object (Errors) with nested errors for the item fields
    //
    // Only the last variant is relevant and requires removing errors if one of the
    // child components is hidden.
    const itemErrors =
      (itemsErrors && Array.isArray(itemsErrors) && itemsErrors[index]) || undefined;
    const relevantItemErrors =
      itemErrors && !Array.isArray(itemErrors) && typeof itemErrors !== 'string'
        ? itemErrors
        : undefined;

    const getEvaluationScope = (itemValues: JSONObject): JSONObject => {
      const innerEvaluationScope: JSONObject = setIn(values, key, itemValues);
      return outerGetEvaluationScope(innerEvaluationScope);
    };

    // we cannot process visibleComponents and omit the hidden ones, as there is no
    // definition for a single item -> the display layer needs to do this. We can only
    // process the value mutations, which (in turn) drive the presentation.
    const {updatedValues: updatedItemValues, updatedErrors: updatedRelevantItemErrors} =
      processVisibility(components, itemValues, relevantItemErrors, {
        ...context,
        initialValues,
        getEvaluationScope,
      });

    // process an update by replace the item
    if (updatedItemValues !== itemValues) {
      items = replace(items, index, updatedItemValues) as JSONObject[];
    }
    if (itemsErrors && updatedRelevantItemErrors !== relevantItemErrors) {
      itemsErrors = replace(itemsErrors, index, updatedRelevantItemErrors) as Errors[];
    }
  }

  // update the array value of the edit grid - if no items were changed, this is an
  // identity update and no state changes will trigger
  const updatedValues: JSONObject = setIn(values, key, items);
  const updatedErrors: Errors = errors !== undefined ? setIn(errors, key, itemsErrors) : errors;

  return {
    updatedDefinition: componentDefinition,
    updatedValues: updatedValues,
    updatedErrors: updatedErrors,
  };
};

export default applyVisibility;
