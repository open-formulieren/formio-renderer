import type {AnyComponentSchema, EditGridComponentSchema} from '@open-formulieren/types';
import {replace, setIn, useFormikContext} from 'formik';
import {createContext, useContext, useEffect, useMemo} from 'react';
import {useIntl} from 'react-intl';

import FormFieldContainer from '@/components/FormFieldContainer';
import type {FormioComponentProps} from '@/components/FormioComponent';
import {EditGrid as EditGridField} from '@/components/forms';
import type {GetRegistryEntry, RegistryEntry} from '@/registry/types';
import {JSONObject} from '@/types';
import {buildValidationSchema} from '@/validationSchema';
import {extractInitialValues} from '@/values';
import {processVisibility} from '@/visibility';

import ItemPreview from './ItemPreview';
import getInitialValues from './initialValues';
import applyVisibility from './visibility';

// set up a context to track the parent values when dealing with nested edit grids
interface ParentValuesContextType {
  keyPrefix: string; // component keys from root to leaf, to track position in nested edit grids
  values: JSONObject;
}

const ParentValuesContext = createContext<ParentValuesContextType>({
  keyPrefix: '',
  values: {},
});
ParentValuesContext.displayName = 'ParentValuesContext';

export interface ItemBodyProps {
  renderNested: React.FC<FormioComponentProps>;
  getRegistryEntry: GetRegistryEntry;
  components: AnyComponentSchema[];
  parentKey: string;
  parentValues: JSONObject;
  initialValues: JSONObject;
  onItemValuesUpdated: (itemValues: JSONObject) => void;
  expanded: boolean;
}

const ItemBody: React.FC<ItemBodyProps> = ({
  renderNested: FormioComponent,
  getRegistryEntry,
  components,
  parentKey,
  parentValues,
  initialValues,
  onItemValuesUpdated,
  expanded,
}) => {
  const {values: itemValues} = useFormikContext<JSONObject>();

  const {visibleComponents, updatedItemValues} = useMemo(() => {
    const {visibleComponents, updatedValues: updatedItemValues} = processVisibility(
      components,
      itemValues,
      {
        // in this case, the parent is the item itself rather than the `editgrid`
        // component. There are no mechanisms to hide an entire item. If the editgrid
        // component were to be hidden, matching key of that component will be cleared
        // and/or items won't be rendered at all because the editgrid component is
        // filtered out of the visible components.
        parentHidden: false,
        initialValues,
        getRegistryEntry,
        getEvaluationScope: (values: JSONObject): JSONObject => {
          const result: JSONObject = setIn(parentValues, parentKey, values);
          return result;
        },
      }
    );
    return {visibleComponents, updatedItemValues};
  }, [parentValues, parentKey, components, initialValues, itemValues]);

  // handle the side-effects from the visibility checks that apply clearOnHide to the
  // values. We must call the parent update handler to make sure the outer Formik state
  // gets updated, otherwise the proper values are not submitted in the outer Formik
  // element when rendering in preview mode. This in turns leads to the necessary item
  // value state updates.
  useEffect(() => {
    // update the formik values with the calculated values with side-effects applied
    // until this converges/resolves. We rely on the object identity here to detect
    // (deep) differences!
    if (updatedItemValues !== itemValues) {
      onItemValuesUpdated(updatedItemValues);
    }
  }, [onItemValuesUpdated, itemValues, updatedItemValues]);

  if (!expanded) {
    // assign the local item values to the editgrid scope - `parentKey` is the key of the
    // editgrid itself.
    const scopedValues = setIn(parentValues, parentKey, updatedItemValues);
    return (
      <ItemPreview
        components={visibleComponents}
        keyPrefix={parentKey}
        values={scopedValues}
        getRegistryEntry={getRegistryEntry}
      />
    );
  }

  return (
    <ParentValuesContext.Provider value={{keyPrefix: parentKey, values: parentValues}}>
      <FormFieldContainer>
        {visibleComponents.map((definition, index) => (
          <FormioComponent key={`${definition.id || index}`} componentDefinition={definition} />
        ))}
      </FormFieldContainer>
    </ParentValuesContext.Provider>
  );
};

export interface EditGridProps {
  componentDefinition: EditGridComponentSchema;
  renderNested: React.FC<FormioComponentProps>;
  getRegistryEntry: GetRegistryEntry;
}

export const EditGrid: React.FC<EditGridProps> = ({
  componentDefinition: {
    key,
    components,
    label,
    hideLabel,
    tooltip,
    description,
    validate,
    disableAddingRemovingRows,
    groupLabel,
    addAnother,
    saveRow,
    removeRow,
  },
  renderNested: FormioComponent,
  getRegistryEntry,
}) => {
  const intl = useIntl();
  const {values: parentValues, setFieldValue, getFieldProps} = useFormikContext<JSONObject>();
  const {value} = getFieldProps<JSONObject[]>(key);

  const {keyPrefix, values: grandParentValues} = useContext(ParentValuesContext);
  // ensure we keep setting a deeper scope when dealing with nesting
  const parentScope = keyPrefix ? setIn(grandParentValues, keyPrefix, parentValues) : parentValues;

  const initialValues = extractInitialValues(components, getRegistryEntry);
  const emptyItem: JSONObject | null = disableAddingRemovingRows ? null : initialValues;

  // build the validation schema from the nested component definitions
  // TODO: take into account hidden components!
  const zodSchema = buildValidationSchema(components, intl, getRegistryEntry);

  return (
    <EditGridField<JSONObject>
      name={key}
      label={hideLabel ? null : label}
      tooltip={tooltip}
      isRequired={validate?.required}
      description={description}
      enableIsolation
      getItemHeading={(_, index: number) => (groupLabel ? `${groupLabel} ${index + 1}` : undefined)}
      getItemBody={(_, index: number, {expanded}) => (
        <ItemBody
          renderNested={FormioComponent}
          getRegistryEntry={getRegistryEntry}
          components={components}
          parentKey={keyPrefix ? `${keyPrefix}.${key}` : key}
          parentValues={parentScope}
          initialValues={initialValues}
          onItemValuesUpdated={newItemValues => {
            const updatedFieldValue = replace(value, index, newItemValues);
            setFieldValue(key, updatedFieldValue);
          }}
          expanded={expanded}
        />
      )}
      emptyItem={emptyItem}
      addButtonLabel={addAnother}
      canEditItem={() => true}
      getItemValidationSchema={() => zodSchema}
      saveItemLabel={saveRow}
      canRemoveItem={() => !disableAddingRemovingRows}
      removeItemLabel={removeRow}
    />
  );
};

const EditGridComponent: RegistryEntry<EditGridComponentSchema> = {
  formField: EditGrid,
  getInitialValues,
  applyVisibility,
};

export default EditGridComponent;
