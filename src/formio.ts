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
 * Determine if a component is visible or hidden, depending on the *current* values.
 */
export const isHidden = (component: AnyComponentSchema, values: JSONObject): boolean => {
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

  // TODO: how does the scoping of the 'when' expression work for nesting and repeating
  // groups? -> check backend code and formio reference.
  const compareValue = getIn(values, when);
  const conditionSatisfied = eq === compareValue;

  // note that we return whether the component is hidden, not whether it is shown, so
  // we must invert in the return value
  return conditionSatisfied ? !show : show;
};
