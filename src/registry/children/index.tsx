import type {ChildrenComponentSchema} from '@open-formulieren/types';
import {SecondaryActionButton} from '@utrecht/component-library-react';
import {FieldArray, useFormikContext} from 'formik';
import {useId, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import Fieldset from '@/components/forms/Fieldset';
import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import {useFieldConfig} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

import ChildModal from './ChildModal';
import ChildrenTable from './ChildrenTable';
import {EMPTY_CHILD} from './constants';
import isEmpty from './empty';
import type {ExtendedChildDetails} from './types';
import getValidationSchema from './validationSchema';

export interface FormioChildrenFieldProps {
  componentDefinition: ChildrenComponentSchema;
}

export const FormioChildrenField: React.FC<FormioChildrenFieldProps> = ({
  componentDefinition: {key, label, description, tooltip, enableSelection},
}) => {
  const id = useId();
  key = useFieldConfig(key);
  const {getFieldProps} = useFormikContext();
  const {value: children} = getFieldProps<ExtendedChildDetails[]>(key);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [childToEdit, setChildToEdit] = useState<ExtendedChildDetails | undefined>();

  const descriptionId = description ? `${id}-description` : undefined;

  const serverFetchedChildren = children.filter(child => !('__addedManually' in child));
  // If there are no server-fetched children, we can add children manually.
  const canAddChildrenManually = serverFetchedChildren.length === 0;

  const editChild = (child: ExtendedChildDetails | undefined) => {
    setChildToEdit(child ?? EMPTY_CHILD);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setChildToEdit(undefined);
    setIsModalOpen(false);
  };

  return (
    <Fieldset
      header={
        <>
          {label}
          {tooltip && <Tooltip>{tooltip}</Tooltip>}
        </>
      }
      hasTooltip={!!tooltip}
      aria-describedby={descriptionId || undefined}
    >
      <FieldArray name={key} validateOnChange={false}>
        {arrayHelpers => (
          <>
            {children.length > 0 && (
              <ChildrenTable
                name={key}
                values={children}
                enableSelection={enableSelection}
                editChild={editChild}
                removeChild={childIndex => arrayHelpers.remove(childIndex)}
              />
            )}
            {canAddChildrenManually && childToEdit && (
              <ChildModal
                isOpen={isModalOpen}
                closeModal={closeModal}
                data={childToEdit}
                onChange={newChild => {
                  const isNew = newChild.__id === undefined;
                  // Add new child data to form
                  if (isNew) {
                    arrayHelpers.push({
                      ...newChild,
                      __id: crypto.randomUUID(),
                      selected: enableSelection ? false : undefined,
                    });
                    closeModal();
                    return;
                  }

                  // Update existing child data
                  const childIndex = children.findIndex(child => child.__id === newChild.__id);
                  arrayHelpers.replace(childIndex, newChild);

                  closeModal();
                }}
              />
            )}
          </>
        )}
      </FieldArray>

      <HelpText id={descriptionId}>{description}</HelpText>

      {canAddChildrenManually && (
        <SecondaryActionButton type="button" onClick={() => editChild(undefined)}>
          <FormattedMessage
            description="Children component modal: add child button label"
            defaultMessage="Add child"
          />
        </SecondaryActionButton>
      )}
    </Fieldset>
  );
};

const ChildrenFieldComponent: RegistryEntry<ChildrenComponentSchema> = {
  formField: FormioChildrenField,
  getValidationSchema,
  isEmpty,
};

export default ChildrenFieldComponent;
