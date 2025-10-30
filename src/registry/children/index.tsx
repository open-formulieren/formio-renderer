import type {ChildrenComponentSchema} from '@open-formulieren/types';
import {Checkbox as UtrechtCheckbox} from '@utrecht/component-library-react';
import {clsx} from 'clsx';
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
import './index.scss';
import getInitialValues from './initialValues';
import {BSN, DateOfBirth, FirstNames} from './subFields';
import type {ExtendedChildDetails} from './types';

type WrappedJSONObject = {[k: string]: JSONObject | WrappedJSONObject};

export interface ItemBodyProps {
  expanded: boolean;
  enableSelection: boolean;
}

const ItemBody: React.FC<ItemBodyProps> = ({expanded, enableSelection}) => {
  const intl = useIntl();
  const {values, setFieldValue} = useFormikContext<ExtendedChildDetails[]>();

  const rawNamePrefix = useFieldConfig('');
  if (!rawNamePrefix.endsWith('.')) throw new Error('Unexpected name prefix');
  const namePrefix = rawNamePrefix.slice(0, -1);
  const itemValues: ExtendedChildDetails = getIn(values, namePrefix);

  if (!expanded) {
    return (
      <div
        className={clsx('openforms-children__item-body', {
          'openforms-children__item-body--with-selection': enableSelection,
        })}
      >
        {enableSelection && (
          <UtrechtCheckbox
            name={`${namePrefix}.selected`}
            aria-label={intl.formatMessage(
              {
                description: 'Children component: child select box aria label',
                defaultMessage: '{firstname} should be included in the form submission',
              },
              {
                firstname: itemValues.firstNames,
              }
            )}
            checked={!!itemValues?.selected}
            onChange={() => {
              setFieldValue(`${namePrefix}.selected`, !itemValues?.selected);
            }}
          />
        )}
        <ChildPreview childData={itemValues} inline />
      </div>
    );
  }

  // This can only be reached if the item is editable.
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
  componentDefinition: {key, label, description, tooltip, hideLabel, enableSelection},
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

  const children: ExtendedChildDetails[] = getIn(parentScope, parentKey);
  const serverFetchedChildren = children.filter(child => !('__addedManually' in child));
  // If there are no server-fetched children, we can add children manually.
  const canAddChildrenManually = serverFetchedChildren.length === 0;

  return (
    <EditGridField<ExtendedChildDetails>
      name={key}
      label={hideLabel ? null : label}
      tooltip={tooltip}
      description={description}
      enableIsolation
      getItemBody={(_, __, {expanded}) => (
        <ItemBody expanded={expanded} enableSelection={enableSelection} />
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
