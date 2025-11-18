import {ButtonGroup} from '@utrecht/button-group-react';
import {Form, Formik} from 'formik';
import {FormattedMessage, useIntl} from 'react-intl';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import {PrimaryActionButton} from '@/components/Button';
import FormFieldContainer from '@/components/FormFieldContainer';
import Modal from '@/components/modal';

import './ChildModal.scss';
import {BSNField, DateOfBirthField, FirstNamesField} from './subFields';
import type {ExtendedChildDetails} from './types';
import {buildChildSchema} from './validationSchema';

interface ChildModalProps {
  isOpen: boolean;
  closeModal: () => void;
  data: ExtendedChildDetails;
  onSubmit: (data: ExtendedChildDetails) => void;
}

const ChildModal: React.FC<ChildModalProps> = ({isOpen, closeModal, data, onSubmit}) => {
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
        onSubmit={values => onSubmit(values)}
      >
        <Form>
          <FormFieldContainer>
            <BSNField />
            <FirstNamesField />
            <DateOfBirthField />

            <ButtonGroup>
              <PrimaryActionButton type="submit">
                <FormattedMessage
                  description="Children component modal: save button label"
                  defaultMessage="Save"
                />
              </PrimaryActionButton>
            </ButtonGroup>
          </FormFieldContainer>
        </Form>
      </Formik>
    </Modal>
  );
};

export default ChildModal;
