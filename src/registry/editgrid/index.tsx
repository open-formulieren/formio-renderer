import type {AnyComponentSchema, EditGridComponentSchema} from '@open-formulieren/types';

import FormFieldContainer from '@/components/FormFieldContainer';
import type {FormioComponentProps} from '@/components/FormioComponent';
import {EditGrid as EditGridField} from '@/components/forms';
import type {RegistryEntry} from '@/registry/types';
import {JSONObject} from '@/types';

import getInitialValues from './initialValues';

export interface EditGridProps {
  componentDefinition: EditGridComponentSchema;
  renderNested: React.FC<FormioComponentProps>;
}

export interface ItemBodyProps {
  renderNested: React.FC<FormioComponentProps>;
  components: AnyComponentSchema[];
  values: JSONObject;
  expanded: boolean;
}

const ItemBody: React.FC<ItemBodyProps> = ({
  renderNested: FormioComponent,
  components,
  values,
  expanded,
}) => {
  // TODO: incorporate conditional visibility here, which is complicated.
  const componentsToRender = components;

  if (!expanded) {
    return (
      <code>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </code>
    );
  }
  return (
    <FormFieldContainer>
      {componentsToRender.map((definition, index) => (
        <FormioComponent key={`${definition.id || index}`} componentDefinition={definition} />
      ))}
    </FormFieldContainer>
  );
};

export const EditGrid: React.FC<EditGridProps> = ({
  componentDefinition: {
    key,
    components,
    label,
    hideLabel,
    description,
    validate,
    disableAddingRemovingRows,
    groupLabel,
    addAnother,
    saveRow,
    removeRow,
  },
  renderNested: FormioComponent,
}) => {
  // TODO: get correct emptyItem data from nested components
  const emptyItem: JSONObject | null = disableAddingRemovingRows ? null : {};

  return (
    <EditGridField<JSONObject>
      name={key}
      label={hideLabel ? null : label}
      isRequired={validate?.required}
      description={description}
      enableIsolation
      getItemHeading={(_, index: number) => (groupLabel ? `${groupLabel} ${index + 1}` : undefined)}
      getItemBody={(values, _, {expanded}) => (
        <ItemBody
          renderNested={FormioComponent}
          components={components}
          values={values}
          expanded={expanded}
        />
      )}
      emptyItem={emptyItem}
      addButtonLabel={addAnother}
      canEditItem={() => true}
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
