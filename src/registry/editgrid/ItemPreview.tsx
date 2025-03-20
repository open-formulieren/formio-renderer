/**
 * @todo
 * I'm not sure if we want to keep everything together here in the editgrid component,
 * which means that editgrid needs to know about all the other component types we
 * support, or if a more generic pattern/interface should be implemented on each
 * component that we can call recursively to have it return the value display/summary.
 *
 * The latter *could* be useful for the submission summary in the SDK...
 */
import {
  AnyComponentSchema,
  ColumnsComponentSchema,
  ContentComponentSchema,
  EditGridComponentSchema,
  FieldsetComponentSchema,
  SoftRequiredErrorsComponentSchema,
} from '@open-formulieren/types';
import {
  DataList,
  DataListItem,
  DataListKey,
  DataListValue,
  OrderedList,
  OrderedListItem,
  URLValue,
} from '@utrecht/component-library-react';
import {getIn} from 'formik';
import {FormattedDate} from 'react-intl';

import {assertManualValues as assertRadioManualValues} from '@/registry/radio/types';
import type {JSONObject, JSONValue} from '@/types';

import './ItemPreview.scss';

export interface ItemPreviewProps {
  components: AnyComponentSchema[];
  values: JSONObject;
}

/**
 * Render a non-editable preview for the components inside the edit grid, showing a
 * preview of the provided values for each.
 *
 * For the particularities of the `DataList` usage, see
 * https://nl-design-system.github.io/utrecht/storybook/?path=/docs/react_react-data-list--docs
 */
const ItemPreview: React.FC<ItemPreviewProps> = ({components, values}) => {
  return (
    <DataList appearance="rows">
      {components.map(component => (
        <ComponentDataListItem key={component.key} component={component} values={values} />
      ))}
    </DataList>
  );
};

interface ComponentDataListItemProps {
  component: AnyComponentSchema;
  values: JSONObject;
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
const ComponentDataListItem: React.FC<ComponentDataListItemProps> = ({component, values}) => {
  // handle 'layout' components separately so we can recurse into the tree and skip over them,
  // but still display their child components appropriately
  switch (component.type) {
    // content components should not be displayed at all
    case 'softRequiredErrors':
    case 'content': {
      return null;
    }
    case 'fieldset': {
      const nestedComponents = component.components;
      return (
        <>
          {nestedComponents.map(nestedComponent => (
            <ComponentDataListItem
              key={nestedComponent.key}
              component={nestedComponent}
              values={values}
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
                  <ItemPreview components={component.components} values={item} />
                </OrderedListItem>
              ))}
            </OrderedList>
          </DataListValue>
        </DataListItem>
      );
    }
  }

  // a leaf node, render it as is
  return (
    <DataListItem>
      <DataListKey>{component.label}</DataListKey>
      <DataListValue notranslate>
        <ComponentValueDisplay component={component} value={getIn(values, component.key)} />
      </DataListValue>
    </DataListItem>
  );
};

const assertNever = (type: never): string => {
  return `Unknown component ${type}.`;
};

function assertStringOrStringArray(value: JSONValue): asserts value is string | string[] {
  if (Array.isArray(value) && value.every(item => typeof item === 'string')) return;
  if (typeof value === 'string') return;
  throw Error('Invalid value type');
}

interface ComponentValueDisplayProps {
  component: Exclude<
    AnyComponentSchema,
    | ContentComponentSchema
    | SoftRequiredErrorsComponentSchema
    | FieldsetComponentSchema
    | ColumnsComponentSchema
    | EditGridComponentSchema
  >;
  value: JSONValue;
}

const ComponentValueDisplay: React.FC<ComponentValueDisplayProps> = ({component, value}) => {
  switch (component.type) {
    case 'textfield':
    case 'email':
    case 'phoneNumber':
    case 'bsn': {
      const _value = value ?? (component.multiple ? [] : '');
      assertStringOrStringArray(_value);

      const wrap = (v: string) => (component.type === 'email' ? <URLValue>{v}</URLValue> : v);

      const isMultiple = Array.isArray(_value);
      if (isMultiple && !_value.length) return '';
      if (!isMultiple) return wrap(_value);

      return (
        <OrderedList>
          {_value.map((item, index) => (
            <OrderedListItem key={`item-${index}-${item}`}>{wrap(item)}</OrderedListItem>
          ))}
        </OrderedList>
      );
    }
    case 'date': {
      const _value = value ?? (component.multiple ? [] : '');
      assertStringOrStringArray(_value);
      const isMultiple = Array.isArray(_value);
      const formatDate = (dateValue: string) =>
        dateValue ? (
          <FormattedDate value={dateValue} year="numeric" day="numeric" month="long" />
        ) : (
          ''
        );

      if (isMultiple && !_value.length) return '';
      if (!isMultiple) return formatDate(_value);

      return (
        <OrderedList>
          {_value.map((item, index) => (
            <OrderedListItem key={`item-${index}-${item}`}>{formatDate(item)}</OrderedListItem>
          ))}
        </OrderedList>
      );
    }
    case 'radio': {
      assertRadioManualValues(component);
      const option = component.values.find(opt => opt.value === value);
      return <>{option?.label ?? value}</>;
    }
    default: {
      // @ts-expect-error
      return assertNever(component.type);
    }
  }
};

export default ItemPreview;
