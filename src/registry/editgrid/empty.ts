import type {EditGridComponentSchema} from '@open-formulieren/types';

import type {GetRegistryEntry, IsEmpty} from '@/registry/types';
import type {JSONObject} from '@/types';

/**
 * A function that validates the editgrid children components and returns whether they
 * are considered as empty or not.
 *
 * Each (child) component is validated according to its `isEmpty` implemented function.
 *
 * @param editgridDefinition The parent (editgrid) component definition.
 * @param childValues The values of the editgrid's child component.
 * @param getRegistryEntry Hook to look up a component in the registry.
 *
 * @return The function returns whether the (child) component is empty (true) or not (false).
 */
export function hasEmptyChildComponent(
  editgridDefinition: EditGridComponentSchema,
  childValues: JSONObject,
  getRegistryEntry: GetRegistryEntry
): boolean {
  const childrenKeys = Object.keys(childValues);

  for (const childrenKey of childrenKeys) {
    const value = childValues[childrenKey];
    const childDefinition = editgridDefinition.components.find(c => c.key === childrenKey);

    if (!childDefinition) continue;

    const registry = getRegistryEntry(childDefinition);
    if (!registry?.isEmpty) continue;

    const isChildEmpty = registry.isEmpty(childDefinition, value, getRegistryEntry);

    if (!isChildEmpty) return false;
  }

  return true;
}

const isEmpty: IsEmpty<EditGridComponentSchema, JSONObject[]> = (
  _componentDefinition,
  value,
  getRegistryEntry
) => {
  if (value == null || value.length === 0) return true;

  return value.every(val => hasEmptyChildComponent(_componentDefinition, val, getRegistryEntry));
};

export default isEmpty;
