import type {ChildDetails, ChildrenComponentSchema} from '@open-formulieren/types';
import {getIn, setIn, useFormikContext} from 'formik';
import {useContext} from 'react';
import {useIntl} from 'react-intl';

import FormFieldContainer from '@/components/FormFieldContainer';
import {EditGrid as EditGridField} from '@/components/forms';
import {useFieldConfig} from '@/hooks';
import ParentValuesContext from '@/registry/editgrid/ParentValuesContext';
import type {RegistryEntry} from '@/registry/types';
import type {JSONObject} from '@/types';

import ChildPreview from './ChildPreview';
import ValueDisplay from './ValueDisplay';
import {EMPTY_CHILD} from './constants';
import getInitialValues from './initialValues';
import {BSN, DateOfBirth, FirstNames} from './subFields';
import type {ManuallyAddedChildDetails} from './types';

type WrappedJSONObject = {[k: string]: JSONObject | WrappedJSONObject};

export interface ItemBodyProps {
  index: number;
  parentKey: string;
  parentValues: {[K: string]: (ChildDetails | ManuallyAddedChildDetails)[]};
  expanded: boolean;
}

const ItemBody: React.FC<ItemBodyProps> = ({index, parentKey, parentValues, expanded}) => {
  const {values} = useFormikContext<(ChildDetails | ManuallyAddedChildDetails)[]>();

  const rawNamePrefix = useFieldConfig('');
  if (!rawNamePrefix.endsWith('.')) throw new Error('Unexpected name prefix');
  const namePrefix = rawNamePrefix.slice(0, -1);
  let itemValues: ChildDetails | ManuallyAddedChildDetails | undefined = getIn(values, namePrefix);

  // If itemValues is undefined, we're dealing with an uneditable item.
  if (!itemValues) {
    itemValues = parentValues[parentKey][index];
  }

  if (!expanded) {
    return <ChildPreview childData={itemValues} />;
  }

  return (
    <FormFieldContainer>
      <BSN />
      <FirstNames />
      <DateOfBirth />
    </FormFieldContainer>
  );
};

export interface FormioChildrenFieldProps {
  componentDefinition: ChildrenComponentSchema;
}

export const FormioChildrenField: React.FC<FormioChildrenFieldProps> = ({
  componentDefinition: {key, label, description, tooltip, hideLabel},
}) => {
  const {values} = useFormikContext<WrappedJSONObject>();
  const intl = useIntl();

  const rawNamePrefix = useFieldConfig('');
  const namePrefix = rawNamePrefix ? rawNamePrefix.slice(0, -1) : '';
  const parentValues: JSONObject = getIn(values, namePrefix);

  const {keyPrefix, values: grandParentValues} = useContext(ParentValuesContext);
  const isRoot = keyPrefix === '';

  // ensure we keep setting a deeper scope when dealing with nesting
  const parentScope = !isRoot ? setIn(grandParentValues, keyPrefix, parentValues) : parentValues;
  const parentKey = !isRoot ? `${keyPrefix}.${key}` : key;

  const children: (ChildDetails | ManuallyAddedChildDetails)[] = getIn(parentScope, parentKey);
  const serverFetchedChildren = children.filter(
    (child): child is ChildDetails => !('__addedManually' in child)
  );
  // If there are no server-fetched children, we can add children manually.
  const canAddChildrenManually = serverFetchedChildren.length === 0;

  return (
    <EditGridField<ChildDetails | ManuallyAddedChildDetails>
      name={key}
      label={hideLabel ? null : label}
      tooltip={tooltip}
      description={description}
      enableIsolation
      getItemBody={(_, index, {expanded}) => (
        <ItemBody
          index={index}
          parentKey={parentKey}
          parentValues={parentScope}
          expanded={expanded}
        />
      )}
      emptyItem={canAddChildrenManually ? EMPTY_CHILD : undefined}
      canEditItem={item => '__addedManually' in item}
      canRemoveItem={item => '__addedManually' in item}
      // @TODO
      validate={() => Promise.resolve()}
      addButtonLabel={intl.formatMessage({
        description: 'Children component: add child button label',
        defaultMessage: 'Add child',
      })}
      saveItemLabel={intl.formatMessage({
        description: 'Children component: save child button label',
        defaultMessage: 'Save child',
      })}
      removeItemLabel={intl.formatMessage({
        description: 'Children component: remove child button label',
        defaultMessage: 'Remove child',
      })}
    />
  );
};

const ChildrenFieldComponent: RegistryEntry<ChildrenComponentSchema> = {
  formField: FormioChildrenField,
  getInitialValues,
  valueDisplay: ValueDisplay,
};

export default ChildrenFieldComponent;
