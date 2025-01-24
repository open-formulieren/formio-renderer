import {AnyComponentSchema} from '@open-formulieren/types';

import {isHidden} from '@/formio';
import type {GetRegistryEntry} from '@/registry/types';
import type {JSONObject} from '@/types';

/**
 * Filter the given components down to the ones that are visible given the current
 * form values.
 *
 * This returns a copy of the components tree provided with hidden components omitted,
 * taken into account layout components that may have nested hidden components.
 */
export const filterVisibleComponents = (
  components: AnyComponentSchema[],
  values: JSONObject,
  getRegistryEntry: GetRegistryEntry
): AnyComponentSchema[] => {
  const visibleComponents = components.reduce((acc: AnyComponentSchema[], componentDefinition) => {
    const hidden = isHidden(componentDefinition, values);
    if (hidden) {
      // TODO: ensure that clearOnHide behaviour is invoked here & for nested components!
      console.debug(`Component ${componentDefinition.key} is not visible`);
    } else {
      // if it's not hidden, there *may* be children that are hidden. We recurse if
      // there's a handler in the registry!
      const excludeHiddenComponents =
        getRegistryEntry(componentDefinition)?.excludeHiddenComponents;
      if (excludeHiddenComponents) {
        componentDefinition = excludeHiddenComponents(
          componentDefinition,
          values,
          getRegistryEntry
        );
      }
      acc.push(componentDefinition);
    }
    return acc;
  }, []);
  return visibleComponents;
};
