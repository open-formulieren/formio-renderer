import {PrimaryActionButton} from '@utrecht/component-library-react';
import {Formik, useFormikContext} from 'formik';
import {FormattedMessage} from 'react-intl';

import FormFieldContainer from '@/components/FormFieldContainer';
import Modal from '@/components/modal';

import './ChildModal.scss';
import {BSNField, DateOfBirthField, FirstNamesField} from './subFields';
import type {ExtendedChildDetails} from './types';

const ChildModalSaveButton = () => {
  const {submitForm} = useFormikContext<unknown>();
  return (
    <PrimaryActionButton
      type="button"
      className="openforms-children-modal__save-button"
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
  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      className="openforms-children-modal"
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
        // @TODO
        // validationSchema={undefined}
        onSubmit={async values => {
          onChange(values);
        }}
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
