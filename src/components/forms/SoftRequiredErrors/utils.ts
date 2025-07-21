import {AnyComponentSchema} from '@open-formulieren/types';
import {getIn} from 'formik';

export interface SoftRequiredComponent {
  /**
   * The path to the component in the form values dict.
   */
  pathToComponent: string;
  /**
   * The label of the component.
   */
  label: string;
}

/**
 *
 *
 * A value used in the component path to indicate that this part of the component path is
 * of an editgrid child. Because `editgrid.components` is a sort of blueprint, we don't know (without looking at the form values)
 */
export const EDITGRID_CHILDREN_COMPONENT_PATH_WILDCARD = '[*]';

export const getSoftRequiredComponentsRecursive = (
  components: AnyComponentSchema[],
  componentPathPrefix: string = ''
): SoftRequiredComponent[] => {
  /**
   * Collect all the soft required components from the form, and return them in a flat
   * list.
   *
   * To collect child components (from editgrid, fieldset and columns components) we
   * need to call this function recursively.
   */

  const softRequiredComponents: SoftRequiredComponent[] = [];
  // Early return if there are no components (for example, an editgrid with 0 children)
  if (!components.length) {
    return softRequiredComponents;
  }

  components.forEach(component => {
    let pathToComponent = component.key;
    if (!componentPathPrefix) {
      pathToComponent = `${componentPathPrefix}.${pathToComponent}`;
    }

    // If component is softRequired, add it to the results list.
    if (getIn(component, `openForms.softRequired`, false)) {
      softRequiredComponents.push({
        pathToComponent,
        label: getIn(component, 'label', 'This component is anonymous'),
      });
    }

    // Add soft required components recursively
    switch (component.type) {
      case 'fieldset':
        softRequiredComponents.push(
          ...getSoftRequiredComponentsRecursive(component.components, pathToComponent)
        );
        return;
      case 'editgrid':
        softRequiredComponents.push(
          ...getSoftRequiredComponentsRecursive(
            component.components,
            `${pathToComponent}${EDITGRID_CHILDREN_COMPONENT_PATH_WILDCARD}`
          )
        );
        return;
      case 'columns':
        component.columns.forEach((column, index) => {
          softRequiredComponents.push(
            ...getSoftRequiredComponentsRecursive(column.components, `${pathToComponent}[${index}]`)
          );
        });
    }
  });

  return softRequiredComponents;
};

export const resolveEditgridChildrenPath = (
  components: SoftRequiredComponent[],
  formValues: object
): SoftRequiredComponent[] => {
  const resolvedComponents: SoftRequiredComponent[] = [];
  components.forEach(component => {
    if (!component.pathToComponent.includes(EDITGRID_CHILDREN_COMPONENT_PATH_WILDCARD)) {
      resolvedComponents.push(component);
      return;
    }

    const parts = component.pathToComponent.split(EDITGRID_CHILDREN_COMPONENT_PATH_WILDCARD);
    const pathToParent = parts.shift();
    if (!pathToParent) {
      // Should never happen.
      return;
    }

    const editgridItems: object[] = getIn(formValues, pathToParent, []);
    const subComponents: SoftRequiredComponent[] = [];
    editgridItems.forEach((_value, index) => {
      // @TODO for editgrid, the labels of the parent(s) should be added to the label
      subComponents.push({
        pathToComponent: `${pathToParent}[${index}]${parts.join(EDITGRID_CHILDREN_COMPONENT_PATH_WILDCARD)}`,
        label: component.label,
      });
    });
    resolvedComponents.push(...resolveEditgridChildrenPath(subComponents, formValues));
  });

  return resolvedComponents;
};
