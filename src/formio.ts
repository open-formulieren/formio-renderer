/**
 * Implements Formio business logic.
 *
 * These are helpers around Formio.js concepts which we implement ourselves rather than
 * depending on formio.js or @formio/js packages.
 */
import type {AnyComponentSchema} from '@open-formulieren/types';
import type {Conditional} from '@open-formulieren/types/dist/extensions';
import {getIn} from 'formik';

import type {GetRegistryEntry, TestConditional} from '@/registry/types';

import type {JSONObject, JSONValue} from './types';

type ConditionalOptions = NonNullable<Conditional['conditional']>;

export const getConditional = (
  component: AnyComponentSchema
): Required<ConditionalOptions> | null => {
  // component must support the construct in the first place
  if (!('conditional' in component)) return null;
  // undefined or null -> nothing to extract
  if (component.conditional == undefined) return null;
  const {show, when, eq} = component.conditional;
  // incomplete configuration -> nothing to extract
  if (show == undefined || when == undefined || eq === undefined) return null;
  return {show, when, eq};
};

/**
 * Evaluate the condition expressed in component.conditional.
 *
 * Note that this is a more strict version of what Formio.js itself imlements. They
 * essentially just take `String(compareValue) === String(valueToTest)` and have
 * specialized edge cases for arrays (with an `.includes` check) and objects - which
 * are _assumed_ to come from selectboxes.
 */
const defaultTestConditional: TestConditional<AnyComponentSchema | undefined> = (
  /**
   * The component definition referenced by `conditional.when`. Could be undefined for
   * broken configurations.
   */
  referenceComponent: AnyComponentSchema | undefined,
  /**
   * The reference value specified in `conditional.eq`.
   */
  compareValue: Required<ConditionalOptions>['eq'],
  /**
   * The current value of the referenced component to compare against.
   */
  valueToTest: JSONValue
): boolean => {
  if (referenceComponent === undefined) return valueToTest === compareValue;

  // check for simple containment in a multiple: true component
  if ('multiple' in referenceComponent && referenceComponent.multiple) {
    // should not happen
    if (!Array.isArray(valueToTest)) return false;
    return valueToTest.includes(compareValue);
  }

  // default behaviour -> check strict equality
  return valueToTest === compareValue;
};

/**
 * Given an evaluation scope of values, determine if a component is visible or hidden.
 *
 * Note that the `evaluationScope` is often equal to the form values of all components,
 * but not always - e.g. when using edit grids, the item values of each item are
 * scoped inside their parent key so that components can have conditional logic based
 * on their siblings components.
 */
export const isHidden = (
  component: AnyComponentSchema,
  evaluationScope: JSONObject,
  getRegistryEntry: GetRegistryEntry,
  /**
   * A mapping of component key -> component definition so that the value can be
   * interpreted in the right context.
   */
  componentsMap: Partial<Record<string, AnyComponentSchema>>
): boolean => {
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

  // NOTE: Formio defaults to an empty string if the value is null-ish (null | undefined),
  // which makes things work when the value has been cleared by an earlier pass. It's a bit
  // shaky - in particular for `number` components I'd prefer sticking to `null` and making
  // strict comparisons like that, but let's explore that when we've actually shipped this
  // renderer.
  const compareValue: JSONValue = getIn(evaluationScope, when) ?? '';

  // delegate the comparison to the registry, if it's hooked up. When it's defined, the
  // registry definition must handle *all* the equality checks, also the array
  // containment in case the components supports `multiple: true`. If it's not defined,
  // we run simple containment/equality checks as fallback behaviour.
  const referenceComponent = componentsMap?.[when];
  let conditionSatisfied: boolean;
  if (referenceComponent === undefined) {
    conditionSatisfied = defaultTestConditional(referenceComponent, eq, compareValue);
  } else {
    const testConditional = referenceComponent
      ? (getRegistryEntry(referenceComponent)?.testConditional ?? defaultTestConditional)
      : defaultTestConditional;
    conditionSatisfied = testConditional(referenceComponent, eq, compareValue);
  }

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

/**
 * Recursively (and depth-first) iterate over all components in the component definition.
 *
 * The components returned here are how they are seen from the root down to the leaf
 * nodes, and matches how we handle values. This has some implications for compnents that
 * have nested component definitions inside them - we must treat those appropriately:
 *
 * - layout components (like fieldsets and columns) have real, addressable child
 *   components. The layout component itself does not contribute to the value at all,
 *   they are purely presentational.
 * - data components (like editgrid) contain a blueprint for each item, where items are
 *   independent from each other. From the root you can only get the value of the
 *   editgrid (an array of objects all with identical shape) itself, you cannot obtain
 *   the value of a particular nested component inside the items.
 */
function* iterComponents(components: AnyComponentSchema[]): Generator<AnyComponentSchema> {
  for (const component of components) {
    yield component;

    switch (component.type) {
      case 'fieldset': {
        yield* iterComponents(component.components);
        break;
      }
      case 'columns': {
        for (const column of component.columns) {
          yield* iterComponents(column.components);
        }
        break;
      }
      case 'editgrid': {
        // components inside edit grids are *not* real components and should not be
        // added to the map. Each nested component has its own key, which may be
        // identical to the key of a component in the outer scope and would cause
        // key collisions. In Formio, outer scope components cannot refer to inner scope
        // editgrid components.
        break;
      }
    }
  }
}

/**
 * Given a tree of component definitions, transform it into a mapping of component key
 * to the component configuration. Useful to look up component key references and
 * introspect the matching component type/configuration.
 */
export const getComponentsMap = (
  components: AnyComponentSchema[]
): Record<string, AnyComponentSchema> => {
  const map: Record<string, AnyComponentSchema> = {};
  for (const component of iterComponents(components)) {
    map[component.key] = component;
  }
  return map;
};

function* iterDependencies(components: AnyComponentSchema[]): Generator<[string, string]> {
  // build a map of dependencies
  for (const component of iterComponents(components)) {
    const conditional = getConditional(component);
    if (conditional !== null) {
      yield [component.key, conditional.when];
    }

    switch (component.type) {
      case 'editgrid': {
        // edit grid items run in their own scope with access to the outer scope, but
        // the outer scope doens't have access to the items, so we only need to check
        // for cycles *within* the edit grid item definition.
        // TODO: what if you can express a conditional on the edit grid component itself?
        const nestedDependencies = iterDependencies(component.components);
        for (const [nestedKey, nestedDependency] of nestedDependencies) {
          yield [`${component.key}.${nestedKey}`, nestedDependency];
        }
      }
    }
  }
}

export const hasAnyConditionalLogicCycle = (components: AnyComponentSchema[]): boolean => {
  // simple mapping of dependent -> dependency
  const dependencies: Map<string, string> = new Map();
  // build a map of dependencies
  for (const [dependent, dependency] of iterDependencies(components)) {
    dependencies.set(dependent, dependency);
  }

  // check if we have any cycles by testing if any of the dependents has a cycle
  return [...dependencies.entries()].some(([dependent, dependency]) => {
    let transitiveDependency: string | undefined = dependency;
    // look up what it depends on, and then look up if that depends on something until
    // our dependencies are exhausted or we encounter ourselves
    while (transitiveDependency) {
      transitiveDependency = dependencies.get(transitiveDependency);
      if (transitiveDependency === dependent) return true;
    }
    return false;
  });
};
