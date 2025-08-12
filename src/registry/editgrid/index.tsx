import type {AnyComponentSchema, EditGridComponentSchema} from '@open-formulieren/types';
import {replace, setIn, useFormikContext} from 'formik';
import {createContext, useContext, useEffect, useMemo} from 'react';
import {useIntl} from 'react-intl';
import {z} from 'zod';

import FormFieldContainer from '@/components/FormFieldContainer';
import type {FormioComponentProps} from '@/components/FormioComponent';
import {EditGrid as EditGridField} from '@/components/forms';
import {getComponentsMap} from '@/formio';
import {useFormSettings} from '@/hooks';
import type {GetRegistryEntry, RegistryEntry} from '@/registry/types';
import {JSONObject} from '@/types';
import {buildValidationSchema, useValidationSchemas} from '@/validationSchema';
import {extractInitialValues} from '@/values';
import {processVisibility} from '@/visibility';

import ItemPreview from './ItemPreview';
import getInitialValues from './initialValues';
import applyVisibility from './visibility';

// set up a context to track the parent values when dealing with nested edit grids
interface ParentValuesContextType {
  keyPrefix: string; // component keys from root to leaf, to track position in nested edit grids
  values: JSONObject;
  componentsMap: Record<string, AnyComponentSchema>;
}

const ParentValuesContext = createContext<ParentValuesContextType>({
  keyPrefix: '',
  values: {},
  componentsMap: {},
});
ParentValuesContext.displayName = 'ParentValuesContext';

export interface ItemBodyProps {
  index: number;
  renderNested: React.FC<FormioComponentProps>;
  getRegistryEntry: GetRegistryEntry;
  components: AnyComponentSchema[];
  parentKey: string;
  parentValues: JSONObject;
  parentComponentsMap: Record<string, AnyComponentSchema>;
  initialValues: JSONObject;
  onItemValuesUpdated: (itemValues: JSONObject) => void;
  onValidationSchemaChange: (index: number, schema: z.ZodSchema<JSONObject>) => void;
  expanded: boolean;
}

const ItemBody: React.FC<ItemBodyProps> = ({
  index,
  renderNested: FormioComponent,
  getRegistryEntry,
  components,
  parentKey,
  parentValues,
  parentComponentsMap,
  initialValues,
  onItemValuesUpdated,
  onValidationSchemaChange,
  expanded,
}) => {
  const intl = useIntl();
  const {values: itemValues} = useFormikContext<JSONObject>();

  const componentsMap = useMemo(() => {
    const localComponentsMap: Record<string, AnyComponentSchema> = Object.fromEntries(
      Object.entries(getComponentsMap(components)).map(([key, component]) => [
        `${parentKey}.${key}`,
        component,
      ])
    );
    // add the namespaced edit grid item components in the parent map so that siblings
    // and any parent can be looked up.
    return {...parentComponentsMap, ...localComponentsMap};
  }, [parentComponentsMap, components]);

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
        componentsMap,
      }
    );
    const updatedValidationSchema = buildValidationSchema(
      visibleComponents,
      intl,
      getRegistryEntry
    );
    onValidationSchemaChange(index, updatedValidationSchema);
    return {visibleComponents, updatedItemValues};
  }, [
    intl,
    getRegistryEntry,
    onValidationSchemaChange,
    parentValues,
    parentKey,
    components,
    initialValues,
    itemValues,
  ]);

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
        components={components}
        keyPrefix={parentKey}
        values={scopedValues}
        getRegistryEntry={getRegistryEntry}
        componentsMap={componentsMap}
      />
    );
  }

  return (
    <ParentValuesContext.Provider
      value={{
        keyPrefix: parentKey,
        values: parentValues,
        componentsMap: componentsMap,
      }}
    >
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
  const {values: parentValues, setFieldValue, getFieldProps} = useFormikContext<JSONObject>();
  const {value} = getFieldProps<JSONObject[]>(key);

  const {
    keyPrefix,
    values: grandParentValues,
    componentsMap: parentComponentsMap,
  } = useContext(ParentValuesContext);
  const isRoot = keyPrefix === '';

  // ensure we keep setting a deeper scope when dealing with nesting
  const parentScope = !isRoot ? setIn(grandParentValues, keyPrefix, parentValues) : parentValues;

  const initialValues = extractInitialValues(components, getRegistryEntry);
  const emptyItem: JSONObject | null = disableAddingRemovingRows ? null : initialValues;

  // if this is the root scope (the most outer edit grid), then we must build the components
  // map from the FormioForm render context.
  const {components: formConfigurationComponents} = useFormSettings();
  const componentsMap = useMemo(() => {
    if (!isRoot) return parentComponentsMap;
    return getComponentsMap(formConfigurationComponents);
  }, [isRoot, formConfigurationComponents, parentComponentsMap]);

  const {setSchema, validate: validateFn} = useValidationSchemas([]);

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
          index={index}
          renderNested={FormioComponent}
          getRegistryEntry={getRegistryEntry}
          components={components}
          parentKey={keyPrefix ? `${keyPrefix}.${key}` : key}
          parentValues={parentScope}
          parentComponentsMap={componentsMap}
          initialValues={initialValues}
          onItemValuesUpdated={newItemValues => {
            const updatedFieldValue = replace(value, index, newItemValues);
            setFieldValue(key, updatedFieldValue);
          }}
          onValidationSchemaChange={setSchema}
          expanded={expanded}
        />
      )}
      emptyItem={emptyItem}
      addButtonLabel={addAnother}
      canEditItem={() => true}
      validate={validateFn}
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
