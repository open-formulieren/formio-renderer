/**
 * Implements Formio business logic.
 *
 * These are helpers around Formio.js concepts which we implement ourselves rather than
 * depending on formio.js or @formio/js packages.
 */
import {AnyComponentSchema} from '@open-formulieren/types';
import {getIn} from 'formik';
import {ConditionalOptions} from 'formiojs';

import {JSONObject} from './types';

// we don't support the 'json' configuration.
export type Conditional = Required<Pick<ConditionalOptions, 'show' | 'when' | 'eq'>>;

export const getConditional = (component: AnyComponentSchema): Conditional | null => {
  // component must support the construct in the first place
  if (!('conditional' in component)) return null;
  // undefined or null -> nothing to extract
  if (component.conditional == undefined) return null;
  const {show, when, eq} = component.conditional;
  // incomplete configuration -> nothing to extract
  if (show === undefined || when === undefined || eq === undefined) return null;
  return {show, when, eq};
};

/**
 * Given an evaluation scope of values, determine if a component is visible or hidden.
 *
 * Note that the `evaluationScope` is often equal to the form values of all components,
 * but not always - e.g. when using edit grids, the item values of each item are
 * scoped inside their parent key so that components can have conditional logic based
 * on their siblings components.
 */
export const isHidden = (component: AnyComponentSchema, evaluationScope: JSONObject): boolean => {
  // dynamic hidden/visible configuration
  const conditional = getConditional(component);

  // no conditional defined, so there is no dynamic behaviour. We look at the static
  // configuration instead.
  if (conditional === null) {
    // 'static' hidden/visible configuration
    const hidden = 'hidden' in component && component.hidden;
    return !!hidden;
  }

  // now that we know there is dynamic configuration, we must evaluate it and use the
  // result.
  const {show, when, eq} = conditional;

  // TODO: ensure comparison/check works for Array values (e.g. textfield with multiple: true)
  // TODO: ensure comparison/check works for selectboxes with their weird data format!

  // NOTE: Formio defaults to an empty string if the value is null-ish (null | undefined),
  // which makes things work when the value has been cleared by an earlier pass. It's a bit
  // shaky - in particular for `number` components I'd prefer sticking to `null` and making
  // strict comparisons like that, but let's explore that when we've actually shipped this
  // renderer.
  const compareValue = getIn(evaluationScope, when) ?? '';
  const conditionSatisfied = eq === compareValue;

  // note that we return whether the component is hidden, not whether it is shown, so
  // we must invert in the return value
  return conditionSatisfied ? !show : show;
};

/**
 * Extract the desired `clearOnHide` behaviour.
 *
 * @note Formio's default value is `true`, meaning that values of hidden components
 * get cleared unless specified otherwise. So even if we get `undefined` or `null`,
 * the component should be cleared on hide.
 */
export const getClearOnHide = (componentDefinition: AnyComponentSchema): boolean => {
  if ('clearOnHide' in componentDefinition) {
    return componentDefinition.clearOnHide !== false;
  }
  return true;
};
