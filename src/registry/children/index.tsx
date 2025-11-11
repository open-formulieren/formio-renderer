import type {ChildrenComponentSchema} from '@open-formulieren/types';
import {SecondaryActionButton} from '@utrecht/component-library-react';
import type {FormikErrors} from 'formik';
import {FieldArray, useFormikContext} from 'formik';
import {useId, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import Fieldset from '@/components/forms/Fieldset';
import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import {useFieldConfig} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

import ChildModal from './ChildModal';
import ChildrenTable from './ChildrenTable';
import ValueDisplay from './ValueDisplay';
import {EMPTY_CHILD, SUB_FIELD_NAMES} from './constants';
import isEmpty from './empty';
import getInitialValues from './initialValues';
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
  const {getFieldProps, getFieldMeta, setFieldTouched} = useFormikContext();
  const {touched, error: formikError} = getFieldMeta<ExtendedChildDetails[]>(key);
  const {value: children} = getFieldProps<ExtendedChildDetails[]>(key);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [childToEdit, setChildToEdit] = useState<ExtendedChildDetails | undefined>();

  const error = formikError as unknown as
    | undefined
    | string
    | (string | FormikErrors<ExtendedChildDetails>)[];

  // check if there's an error for the field *itself*
  const fieldError = typeof error === 'string' && error;

  const invalid = touched && !!fieldError;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;
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

  const markChildAsTouched = (childIndex: number) => {
    // Mark the subfields of the child as touched
    SUB_FIELD_NAMES.forEach(field => {
      setFieldTouched(`${key}.${childIndex}.${field}`, true);
    });
  };

  return (
    <Fieldset
      header={
        <>
          {label}
          {tooltip && <Tooltip>{tooltip}</Tooltip>}
        </>
      }
      isInvalid={invalid}
      hasTooltip={!!tooltip}
      aria-describedby={[descriptionId, errorMessageId].filter(Boolean).join(' ') || undefined}
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
                  let childIndex;

                  if (isNew) {
                    // The current children.length will be the index of the new child
                    childIndex = children.length;
                    arrayHelpers.push({
                      ...newChild,
                      __id: crypto.randomUUID(),
                      selected: enableSelection ? false : undefined,
                    });
                  } else {
                    childIndex = children.findIndex(child => child.__id === newChild.__id);
                    arrayHelpers.replace(childIndex, newChild);
                  }

                  markChildAsTouched(childIndex);
                  closeModal();
                }}
              />
            )}
          </>
        )}
      </FieldArray>

      <HelpText id={descriptionId}>{description}</HelpText>
      {invalid && errorMessageId && <ValidationErrors error={fieldError} id={errorMessageId} />}

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
  valueDisplay: ValueDisplay,
  getValidationSchema,
  getInitialValues,
  isEmpty,
};

export default ChildrenFieldComponent;
