import type {AnyComponentSchema} from '@open-formulieren/types';
import {
  DataList,
  DataListItem,
  DataListKey,
  DataListValue,
  OrderedList,
  OrderedListItem,
} from '@utrecht/component-library-react';
import {getIn, setIn} from 'formik';
import {useMemo} from 'react';

import {getComponentsMap} from '@/formio';
import type {GetRegistryEntry} from '@/registry/types';
import type {JSONObject} from '@/types';
import {processVisibility} from '@/visibility';

import './ItemPreview.scss';

export interface ItemPreviewProps {
  components: AnyComponentSchema[];
  keyPrefix: string;
  values: JSONObject;
  componentsMap: Record<string, AnyComponentSchema>;
  getRegistryEntry: GetRegistryEntry;
}

/**
 * Render a non-editable preview for the components inside the edit grid, showing a
 * preview of the provided values for each.
 *
 * For the particularities of the `DataList` usage, see
 * https://nl-design-system.github.io/utrecht/storybook/?path=/docs/react_react-data-list--docs
 */
const ItemPreview: React.FC<ItemPreviewProps> = ({
  components,
  keyPrefix,
  values,
  componentsMap: parentComponentsMap,
  getRegistryEntry,
}) => {
  const componentsMap = useMemo(() => {
    const localComponentsMap: Record<string, AnyComponentSchema> = Object.fromEntries(
      Object.entries(getComponentsMap(components)).map(([key, component]) => [
        `${keyPrefix}.${key}`,
        component,
      ])
    );
    return {...parentComponentsMap, ...localComponentsMap};
  }, [parentComponentsMap, components]);

  // The `ItemBody` component takes care of (recursively) processing the value changes
  // from clearOnHide side-effects. In the preview, we only need to worry about whether
  // a component is visible or not.
  const {visibleComponents} = processVisibility(components, values, {
    parentHidden: false,
    initialValues: {}, // actual value is not relevant here, it's handled in `ItemBody`
    getRegistryEntry,
    componentsMap,
  });
  return (
    <DataList appearance="rows">
      {visibleComponents.map(component => (
        <ComponentDataListItem
          key={component.key}
          component={component}
          keyPrefix={keyPrefix}
          values={values}
          getRegistryEntry={getRegistryEntry}
          componentsMap={componentsMap}
        />
      ))}
    </DataList>
  );
};

interface ComponentDataListItemProps {
  component: AnyComponentSchema;
  keyPrefix: string;
  values: JSONObject;
  componentsMap: Record<string, AnyComponentSchema>;
  getRegistryEntry: GetRegistryEntry;
}

/**
 * Handle a single component to display the data item/summary for.
 *
 * The component may itself produce multiple data items, depending on its type. We process
 * the layout and oddballs like editgrid first recurse into them for the leaf node display,
 * so that we don't clutter the summary view with layout details, just like how Formio
 * skips over layout components.
 */
const ComponentDataListItem: React.FC<ComponentDataListItemProps> = ({
  component,
  keyPrefix,
  values,
  componentsMap,
  getRegistryEntry,
}) => {
  // handle 'layout' components separately so we can recurse into the tree and skip over them,
  // but still display their child components appropriately
  switch (component.type) {
    // content components should not be displayed at all
    case 'softRequiredErrors':
    case 'content': {
      return null;
    }
    // in fieldsets, only the nested components are interesting, so recurse
    case 'fieldset': {
      const nestedComponents = component.components;
      return (
        <>
          {nestedComponents.map(nestedComponent => (
            <ComponentDataListItem
              key={nestedComponent.key}
              component={nestedComponent}
              keyPrefix={keyPrefix}
              values={values}
              getRegistryEntry={getRegistryEntry}
              componentsMap={componentsMap}
            />
          ))}
        </>
      );
    }
    case 'columns': {
      const nestedComponents = component.columns.reduce(
        (acc, column) => [...acc, ...column.components],
        [] satisfies AnyComponentSchema[]
      );
      return (
        <>
          {nestedComponents.map(nestedComponent => (
            <ComponentDataListItem
              key={nestedComponent.key}
              component={nestedComponent}
              keyPrefix={keyPrefix}
              values={values}
              getRegistryEntry={getRegistryEntry}
              componentsMap={componentsMap}
            />
          ))}
        </>
      );
    }
    case 'editgrid': {
      const items: JSONObject[] = getIn(values, `${keyPrefix}.${component.key}`) || [];
      return (
        <DataListItem>
          <DataListKey>{component.label}</DataListKey>
          <DataListValue>
            <OrderedList>
              {items.map((item, index) => (
                <OrderedListItem key={index}>
                  <ItemPreview
                    components={component.components}
                    keyPrefix={`${keyPrefix}.${component.key}`}
                    // scope the values again so that conditional logic can work
                    values={setIn(values, `${keyPrefix}.${component.key}`, item)}
                    getRegistryEntry={getRegistryEntry}
                    componentsMap={componentsMap}
                  />
                </OrderedListItem>
              ))}
            </OrderedList>
          </DataListValue>
        </DataListItem>
      );
    }
  }

  // a leaf node, use the registry to get the display.
  const ValueDisplay = getRegistryEntry(component)?.valueDisplay;
  // if no ValueDisplay is configured, render nothing.
  if (!ValueDisplay) return null;

  const componentValue = getIn(values, `${keyPrefix}.${component.key}`);
  return (
    <DataListItem>
      <DataListKey>{component.label}</DataListKey>
      <DataListValue notranslate>
        <ValueDisplay componentDefinition={component} value={componentValue} />
      </DataListValue>
    </DataListItem>
  );
};

export default ItemPreview;
