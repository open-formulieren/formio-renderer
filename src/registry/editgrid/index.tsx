import type {AnyComponentSchema, EditGridComponentSchema} from '@open-formulieren/types';
import {setIn, useFormikContext} from 'formik';
import {createContext, useContext, useEffect, useMemo} from 'react';
import {useIntl} from 'react-intl';

import FormFieldContainer from '@/components/FormFieldContainer';
import type {FormioComponentProps} from '@/components/FormioComponent';
import {EditGrid as EditGridField} from '@/components/forms';
import type {GetRegistryEntry, RegistryEntry} from '@/registry/types';
import {JSONObject} from '@/types';
import {buildValidationSchema} from '@/validationSchema';
import {extractInitialValues} from '@/values';
import {filterVisibleComponents} from '@/visibility';

import ItemPreview from './ItemPreview';
import getInitialValues from './initialValues';

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
  expanded: boolean;
}

const ItemBody: React.FC<ItemBodyProps> = ({
  renderNested: FormioComponent,
  getRegistryEntry,
  components,
  parentKey,
  parentValues,
  expanded,
}) => {
  const {values: itemValues, setValues} = useFormikContext<JSONObject>();

  const {visibleComponents: componentsToRender, updatedItemValues} = useMemo(() => {
    console.group('filterVisibleComponents');
    console.log('components', components);
    console.log('parentValues', parentValues);
    const {visibleComponents, values: updatedItemValues} = filterVisibleComponents(
      components,
      itemValues,
      {}, // TODO - proper initialvalues
      getRegistryEntry,
      false,
      setIn(parentValues, parentKey, itemValues)
    );
    console.log('visibleComponents', visibleComponents);
    console.log('updatedItemValues', updatedItemValues);
    console.groupEnd();
    return {visibleComponents, updatedItemValues};
  }, [components, parentValues, parentKey, itemValues]);

  // handle the side-effects from the visibility checks that apply clearOnHide to the
  // values. We can't call setValues directly, since updating state during render like
  // this is not allowed, so we need a synchronization step.
  useEffect(() => {
    // update the formik values with the calculated values with side-effects applied
    // until this converges/resolves. We rely on the object identity here to detect
    // (deep) differences!
    if (updatedItemValues !== itemValues) {
      setValues(updatedItemValues);
    }
  }, [setValues, itemValues, updatedItemValues]);

  if (!expanded) {
    // assign the local item values to the editgrid scope - `parentKey` is the key of the
    // editgrid itself.
    const scopedValues = setIn(parentValues, parentKey, itemValues);
    return (
      <ItemPreview
        components={componentsToRender}
        keyPrefix={parentKey}
        values={scopedValues}
        getRegistryEntry={getRegistryEntry}
      />
    );
  }

  return (
    <ParentValuesContext.Provider value={{keyPrefix: parentKey, values: parentValues}}>
      <FormFieldContainer>
        {componentsToRender.map((definition, index) => (
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
  const {values: parentValues} = useFormikContext<JSONObject>();

  const {keyPrefix, values: grandParentValues} = useContext(ParentValuesContext);
  // ensure we keep setting a deeper scope when dealing with nesting
  const parentScope = keyPrefix ? setIn(grandParentValues, keyPrefix, parentValues) : parentValues;

  const emptyItem: JSONObject | null = disableAddingRemovingRows
    ? null
    : extractInitialValues(components, getRegistryEntry);

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
      getItemBody={(_, __, {expanded}) => (
        <ItemBody
          renderNested={FormioComponent}
          getRegistryEntry={getRegistryEntry}
          components={components}
          parentKey={keyPrefix ? `${keyPrefix}.${key}` : key}
          parentValues={parentScope}
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
};

export default EditGridComponent;
