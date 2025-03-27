import {AnyComponentSchema} from '@open-formulieren/types';
import {
  DataList,
  DataListItem,
  DataListKey,
  DataListValue,
  OrderedList,
  OrderedListItem,
} from '@utrecht/component-library-react';
import {getIn} from 'formik';

import type {GetRegistryEntry} from '@/registry/types';
import type {JSONObject} from '@/types';

import './ItemPreview.scss';

export interface ItemPreviewProps {
  components: AnyComponentSchema[];
  values: JSONObject;
  getRegistryEntry: GetRegistryEntry;
}

/**
 * Render a non-editable preview for the components inside the edit grid, showing a
 * preview of the provided values for each.
 *
 * For the particularities of the `DataList` usage, see
 * https://nl-design-system.github.io/utrecht/storybook/?path=/docs/react_react-data-list--docs
 */
const ItemPreview: React.FC<ItemPreviewProps> = ({components, values, getRegistryEntry}) => {
  return (
    <DataList appearance="rows">
      {components.map(component => (
        <ComponentDataListItem
          key={component.key}
          component={component}
          values={values}
          getRegistryEntry={getRegistryEntry}
        />
      ))}
    </DataList>
  );
};

interface ComponentDataListItemProps {
  component: AnyComponentSchema;
  values: JSONObject;
  getRegistryEntry: GetRegistryEntry;
}

/**
 * Handle a single component to display the data item/summary for.
 *
 * The component may itself produce multiple data items, depending on its type. We process
 * the layout and oddballs like editgrid first recurse into them for the leaf node display,
 * so that we don't clutter the summary view with layout details, just like how Formio
 * skips over layout components.
 *
 * @todo ensure that a component is checked for visibility before it's rendered.
 */
const ComponentDataListItem: React.FC<ComponentDataListItemProps> = ({
  component,
  values,
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
              values={values}
              getRegistryEntry={getRegistryEntry}
            />
          ))}
        </>
      );
    }
    case 'columns': {
      return 'columns is TODO';
    }
    case 'editgrid': {
      const items: JSONObject[] = getIn(values, component.key) || [];
      return (
        <DataListItem>
          <DataListKey>{component.label}</DataListKey>
          <DataListValue>
            <OrderedList>
              {items.map((item, index) => (
                <OrderedListItem key={index}>
                  <ItemPreview
                    components={component.components}
                    values={item}
                    getRegistryEntry={getRegistryEntry}
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

  return (
    <DataListItem>
      <DataListKey>{component.label}</DataListKey>
      <DataListValue notranslate>
        <ValueDisplay componentDefinition={component} value={getIn(values, component.key)} />
      </DataListValue>
    </DataListItem>
  );
};

export default ItemPreview;
