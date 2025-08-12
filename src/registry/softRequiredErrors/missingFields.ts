import type {
  AnyComponentSchema,
  ColumnsComponentSchema,
  EditGridComponentSchema,
  FieldsetComponentSchema,
} from '@open-formulieren/types';
import {getIn} from 'formik';

import {JSONObject} from '@/types';

export interface MissingFields {
  /**
   * The path to the component in the form values dict, used to link the "missing field"
   * entry to the corresponding form value.
   *
   * Each key, from the root to the component, is joined together in a period seperated
   * string. This is only really noticable for children of `editgrid` components, the
   * key of the parent editgrid and the index of the edigrid item are included in the
   * path. As fieldset and columns components are purly presentational, their keys aren't
   * added.
   *
   * Example:
   * Lets assume you have an editgrid component with the key "cars", which has a
   * soft-required textfield in its first child with the key "brand".
   *
   * In this situation, the `pathToComponent` will be: "cars.0.brand".
   */
  pathToComponent: string;
  /**
   * The label to show for the "missing field" entry. This is typically the label of the
   * empty soft-required component.
   *
   * When the missing field is located inside a `editgrid` or `fieldset` component, the
   * labels of their parent components is also shown. For `editgrid` components, the
   * groupLabel will also be included. Using the ">" character, we separate the labels to
   * show the relationship in the form.
   *
   * Example:
   * Lets assume you have a fieldset with the label "Car", which has a soft-required
   * textfield with the label "Brand".
   *
   * In this situation, the `label` will be: "Car > Brand".
   */
  label: string;
}

const LABEL_SEPARATOR = ' > ';

/**
 * A function that validates the values of components, and returns a simplified
 * representation of the empty components.
 *
 * The recommended, and expected, usage is in conjunction with
 * `getSoftRequiredComponents` to return a list of missing soft-required components.
 * In theory, this function could also be used with all form components, to quickly get
 * an overview of all empty components.
 *
 * Note: fieldsets and columns can never be part of the returned list, as these are
 * presentation components. Editgrid components *can* be part of the result, when they
 * are soft-required and don't have any children.
 *
 * @param {AnyComponentSchema[]} components A list of form components.
 * @param {JSONObject} values The form values.
 * @param {string[]} keyPrefix A list of the keys of parent components. Used in recursion
 *     to easily access the value of the current component.
 * @param {string[]} labelPrefix A list of the labels of parent components. Used in
 *     recursion to create a singular label containing references to parent components.
 *
 * @return {MissingFields[]} The list of missing/empty components. Each item in this list
 *     only contains a `label`, describing the location of the component, and a
 *     `pathToComponent` which points to the exact location of the component data in the
 *     form values.
 */
export const getMissingFields = (
  components: AnyComponentSchema[],
  values: JSONObject,
  keyPrefix: string[] = [],
  labelPrefix: string[] = []
): MissingFields[] => {
  const missingFields: MissingFields[] = [];
  for (const component of components) {
    const pathParts = [...keyPrefix];
    const labelParts = [...labelPrefix];

    if (component.type !== 'fieldset' && component.type !== 'columns') {
      pathParts.push(component.key);
    }
    // Not on all components have labels
    if ('label' in component && component.label) {
      labelParts.push(component.label);
    }

    const componentValue = getIn(values, pathParts.join('.'));

    const isComponentEmpty = () => {
      const isFalsy = Array.isArray(componentValue) ? componentValue.length === 0 : !componentValue;

      return isFalsy;
    };

    switch (component.type) {
      case 'fieldset':
        missingFields.push(
          ...getMissingFields(component.components, values, pathParts, labelParts)
        );
        break;

      case 'columns':
        let columnIndex = 0;
        for (const column of component.columns) {
          if (column.components.length > 0) {
            // Only check/add columns that actually have soft-required components to the
            // missing list. If the soft-required fields aren't missing, nothing will be
            // added.
            missingFields.push(
              ...getMissingFields(
                column.components,
                values,
                pathParts,
                labelParts
              )
            );
          }
          columnIndex++;
        }
        break;

      case 'editgrid':
        // If editgrid is soft-required, and its empty, add it to the list.
        // @ts-expect-error softRequired extension not yet defined on all schemas
        if (component?.openForms?.softRequired && isComponentEmpty()) {
          missingFields.push({
            label: labelParts.join(LABEL_SEPARATOR),
            pathToComponent: pathParts.join('.'),
          });
        }

        // If editgrid has empty soft-required children, add them to the list.
        if (!isComponentEmpty() && Array.isArray(componentValue)) {
          for (let childIndex = 0; childIndex < componentValue.length; childIndex++) {
            missingFields.push(
              ...getMissingFields(
                component.components,
                values,
                [...pathParts, childIndex.toString()],
                [...labelParts, `${component.groupLabel} ${childIndex + 1}`]
              )
            );
          }
        }
        break;

      // Any other soft-required and empty components are added to the list.
      default:
        if (isComponentEmpty()) {
          missingFields.push({
            label: labelParts.join(LABEL_SEPARATOR),
            pathToComponent: pathParts.join('.'),
          });
        }
    }
  }

  return missingFields;
};

/**
 * Filters the tree of `components` on "softRequired". All components in the resulting
 * tree are either a parent of a softRequired component, or they are a softRequired
 * component.
 *
 * This function assumes that presentation components, fieldset and columns, cannot
 * be softRequired themselves.
 *
 * The components tree is searched depth-first, meaning that we proces the first
 * component to its full extent (including its children), before moving on to the next
 * component.
 *
 * @param {AnyComponentSchema[]} components A list of components to check on being
 *     softRequired.
 *
 * @return {AnyComponentSchema[]} All softRequired components, or parents of softRequired
 *     components, that were present in the `components` input.
 */
export const getSoftRequiredComponents = (
  components: AnyComponentSchema[]
): AnyComponentSchema[] => {
  const softRequiredComponents: AnyComponentSchema[] = [];
  for (const component of components) {
    // @ts-expect-error softRequired extension not yet defined on all schemas
    const isSoftRequired = component?.openForms?.softRequired || false;

    switch (component.type) {
      case 'fieldset': {
        // Filter the child components to only return soft-required components.
        // If no components are returned, there is no need to include the fieldset either.
        const softRequiredChildren = getSoftRequiredComponents(component.components);
        if (softRequiredChildren.length) {
          softRequiredComponents.push({
            ...component,
            components: softRequiredChildren,
          } satisfies FieldsetComponentSchema);
        }
        break;
      }

      case 'columns': {
        // We filter the column components on soft-required.
        const filteredColumns = component.columns.map(column => ({
          ...column,
          components: getSoftRequiredComponents(column.components),
        }));

        // If one of the columns has a child component (indicating that there is at least
        // one soft-required component somewhere in their children), we add them to the
        // list. Otherwise, we can safely ignore them.
        if (filteredColumns.some(column => column.components.length > 0)) {
          softRequiredComponents.push({
            ...component,
            columns: filteredColumns,
          } satisfies ColumnsComponentSchema);
        }
        break;
      }

      case 'editgrid': {
        // Editgrid components can be added for 2 reasons:
        // Either they have soft-required children, or they are themselves soft-required.
        const softRequiredChildren = getSoftRequiredComponents(component.components);
        if (softRequiredChildren.length) {
          softRequiredComponents.push({
            ...component,
            components: softRequiredChildren,
          } satisfies EditGridComponentSchema);
        } else if (isSoftRequired) {
          // If none of the child components are soft-required, we can safely ignore them.
          softRequiredComponents.push({
            ...component,
            components: [],
          } satisfies EditGridComponentSchema);
        }
        break;
      }

      default:
        // For any other component: if you are soft-required, join the list.
        if (isSoftRequired) {
          softRequiredComponents.push(component);
          break;
        }
    }
  }

  return softRequiredComponents;
};
