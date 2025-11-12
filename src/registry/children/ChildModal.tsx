import {PrimaryActionButton} from '@utrecht/component-library-react';
import {Formik, useFormikContext} from 'formik';
import {FormattedMessage, useIntl} from 'react-intl';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import FormFieldContainer from '@/components/FormFieldContainer';
import Modal from '@/components/modal';

import {BSNField, DateOfBirthField, FirstNamesField} from './subFields';
import type {ExtendedChildDetails} from './types';
import {buildChildSchema} from './validationSchema';

const ChildModalSaveButton = () => {
  const {submitForm} = useFormikContext<unknown>();
  return (
    <PrimaryActionButton
      type="button"
      onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        await submitForm();
      }}
    >
      <FormattedMessage
        description="Children component modal: save button label"
        defaultMessage="Save"
      />
    </PrimaryActionButton>
  );
};

interface ChildModalProps {
  isOpen: boolean;
  closeModal: () => void;
  data: ExtendedChildDetails;
  onChange: (data: ExtendedChildDetails) => void;
}

const ChildModal: React.FC<ChildModalProps> = ({isOpen, closeModal, data, onChange}) => {
  const intl = useIntl();
  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      title={
        data.__id == undefined ? (
          <FormattedMessage
            description="Children component modal: add child title"
            defaultMessage="Add child"
          />
        ) : (
          <FormattedMessage
            description="Children component modal: edit child title"
            defaultMessage="Edit child"
          />
        )
      }
    >
      <Formik<ExtendedChildDetails>
        initialValues={data}
        enableReinitialize
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={toFormikValidationSchema(buildChildSchema(intl))}
        onSubmit={values => onChange(values)}
      >
        <FormFieldContainer>
          <BSNField />
          <FirstNamesField />
          <DateOfBirthField />

          <ChildModalSaveButton />
        </FormFieldContainer>
      </Formik>
    </Modal>
  );
};

export default ChildModal;
