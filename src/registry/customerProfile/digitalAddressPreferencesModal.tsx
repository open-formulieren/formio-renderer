import type {DigitalAddress} from '@open-formulieren/types';
import {ButtonGroup} from '@utrecht/button-group-react';
import {Form, Formik} from 'formik';
import {FormattedMessage} from 'react-intl';

import {PrimaryActionButton} from '@/components/Button';
import FormFieldContainer from '@/components/FormFieldContainer';
import type {ModalProps} from '@/components/modal/Modal';
import Modal from '@/components/modal/Modal';
import {useFormSettings} from '@/hooks';

import BareRadioField from './BareRadioField';

type UserPreference = Pick<DigitalAddress, 'useOnlyOnce' | 'isNewPreferred'>;

interface DigitalAddressPreferencesModalProps extends Pick<ModalProps, 'closeModal' | 'isOpen'> {
  onSubmit: (preference: UserPreference) => void;
}

const DigitalAddressPreferencesModal: React.FC<DigitalAddressPreferencesModalProps> = ({
  closeModal,
  isOpen,
  onSubmit,
}) => {
  const formSettings = useFormSettings();
  if (!formSettings?.componentParameters?.customerProfile) {
    throw new Error('Customer profile component parameters not configured');
  }

  const {portalUrl} = formSettings.componentParameters.customerProfile;

  return (
    <Modal
      title={
        <FormattedMessage
          description="Digital address preferences modal title"
          defaultMessage="Update your preferences"
        />
      }
      isOpen={isOpen}
      closeModal={closeModal}
    >
      <Formik
        // By default, use the 'useOnlyOnce' option
        initialValues={{preference: 'useOnlyOnce'}}
        onSubmit={({preference}) => {
          const newPreference: UserPreference = {
            isNewPreferred: false,
            useOnlyOnce: false,
          };

          // Set the selected preference to true.
          newPreference[preference as keyof UserPreference] = true;
          onSubmit(newPreference);
        }}
      >
        <Form>
          <FormFieldContainer>
            <BareRadioField
              name="preference"
              options={[
                {
                  value: 'isNewPreferred',
                  label: (
                    <FormattedMessage
                      description="Digital address preferences modal 'isNewPreferred' option label"
                      defaultMessage="Save my data for the future forms. You can edit your preferences in the online <a>portal</a>."
                      values={{
                        a: (...chunks) => (
                          <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                            {chunks}
                          </a>
                        ),
                      }}
                    />
                  ),
                },
                {
                  value: 'useOnlyOnce',
                  label: (
                    <FormattedMessage
                      description="Digital address preferences modal 'useOnlyOnce' option label"
                      defaultMessage="Use this email address only for this form."
                    />
                  ),
                },
              ]}
            />

            <ButtonGroup>
              <PrimaryActionButton type="submit">
                <FormattedMessage
                  description="Save preferences button label"
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

export default DigitalAddressPreferencesModal;
