import type {
  AnyComponentSchema,
  Column,
  ColumnsComponentSchema,
  EditGridComponentSchema,
  FieldsetComponentSchema,
} from '@open-formulieren/types';
import {getIn} from 'formik';

export interface MissingFields {
  /**
   * The path to the component in the form values dict, used to link the "missing field"
   * entry to the corresponding form component.
   *
   * Each key, from the root to the component, is joined together in a period seperated
   * string. For children of `editgrid` and `columns` components, the children index is
   * included in the path.
   *
   * Example:
   * Lets assume you have a columns component with the key "cars", which has a
   * soft-required textfield in its first column with the key "brand".
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

export const getMissingFields = (
  SoftRequiredComponents: AnyComponentSchema[],
  values: object,
  keyPrefix: string[] = [],
  labelPrefix: string[] = []
): MissingFields[] => {
  const missingFields: MissingFields[] = [];
  for (const component of SoftRequiredComponents) {
    const pathParts = [...keyPrefix, component.key];
    const labelParts = [...labelPrefix, getIn(component, 'label', '')].filter(
      label => label !== ''
    );

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
                [...pathParts, columnIndex.toString()],
                [...labelParts]
              )
            );
          }
          columnIndex++;
        }
        break;

      case 'editgrid':
        // If editgrid is soft-required, and its empty, add it to the list.
        if (getIn(component, 'openForms.softRequired', false) && isComponentEmpty()) {
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
 * Transform the components tree to a subset of meaningful values.
 * All components in the resulting tree are either a parent of a softRequired field,
 * or they are a softRequired field.
 *
 * This function assumes that a component with children (editgrid, fieldset and columns)
 * cannot be softRequired themselves.
 *
 * The components tree is searched depth-first, meaning that we proces the first
 * component to its full extent (including its children), before moving on to the next
 * component.
 *
 * @param components AnyComponentSchema[]
 *
 * @return AnyComponentSchema[]
 */
export const getSoftRequiredComponents = (
  components: AnyComponentSchema[]
): AnyComponentSchema[] => {
  const softRequiredComponents: AnyComponentSchema[] = [];
  for (const component of components) {
    const isSoftRequired = getIn(component, `openForms.softRequired`, false);

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
        let index = 0;
        const columns: Column[] = [];

        for (const column of component.columns) {
          // We have to include each column, to keep the correct indexes.
          columns.push({
            ...column,
            components: getSoftRequiredComponents(column.components),
          });
          index++;
        }

        // If one of the columns has a child component (indicating that there is at least
        // one soft-required component somewhere in their children), we add them to the
        // list. Otherwise, we can safely ignore them.
        if (columns.some(column => column.components.length > 0)) {
          softRequiredComponents.push({
            ...component,
            columns: columns,
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
