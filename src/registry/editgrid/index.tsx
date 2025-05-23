import type {AnyComponentSchema, EditGridComponentSchema} from '@open-formulieren/types';
import {setIn, useFormikContext} from 'formik';
import {createContext, useContext} from 'react';
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
  const {values: itemValues} = useFormikContext<JSONObject>();
  // assign the local item values to the editgrid scope - key is the key of the
  // editgrid itself.
  const scopedValues = setIn(parentValues, parentKey, itemValues);
  const componentsToRender = filterVisibleComponents(components, scopedValues, getRegistryEntry);
  if (!expanded) {
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
