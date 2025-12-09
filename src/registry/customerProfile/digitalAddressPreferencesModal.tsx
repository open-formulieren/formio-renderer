import type {DigitalAddressType, PreferenceUpdateOptions} from '@open-formulieren/types';
import {ButtonGroup} from '@utrecht/button-group-react';
import {Form, Formik} from 'formik';
import {useId} from 'react';
import {FormattedMessage} from 'react-intl';

import {PrimaryActionButton} from '@/components/Button';
import FormFieldContainer from '@/components/FormFieldContainer';
import RadioField from '@/components/forms/RadioField';
import type {RadioOption} from '@/components/forms/RadioField/RadioField';
import type {ModalProps} from '@/components/modal/Modal';
import Modal from '@/components/modal/Modal';

import PortalUrl from './PortalUrl';
import {useCustomerProfileComponentParameters} from './hooks';

interface DigitalAddressPreferencesModalProps extends Pick<ModalProps, 'closeModal' | 'isOpen'> {
  onSubmit: (preference: PreferenceUpdateOptions) => void;
  digitalAddressType: DigitalAddressType;
}

type FormValues = {preference: PreferenceUpdateOptions};
type PreferenceRadioOption = RadioOption & {value: PreferenceUpdateOptions};

const DigitalAddressPreferencesModal: React.FC<DigitalAddressPreferencesModalProps> = ({
  closeModal,
  isOpen,
  onSubmit,
  digitalAddressType,
}) => {
  const id = useId();
  const {portalUrl} = useCustomerProfileComponentParameters();
  const titleId = `${id}-title`;
  return (
    <Modal
      titleId={titleId}
      title={
        <FormattedMessage
          description="Digital address preferences modal title"
          defaultMessage="Update your preferences"
        />
      }
      isOpen={isOpen}
      closeModal={closeModal}
    >
      <Formik<FormValues>
        // By default, use the 'useOnlyOnce' option
        initialValues={{preference: 'useOnlyOnce'}}
        onSubmit={({preference}) => onSubmit(preference)}
      >
        <Form>
          <FormFieldContainer>
            <RadioField
              name="preference"
              options={
                [
                  {
                    value: 'isNewPreferred',
                    label: (
                      <FormattedMessage
                        description="Profile digital address preferences modal preferenceUpdate 'isNewPreferred' option label"
                        defaultMessage={`Save my preferences for the next time.
                          {hasPortalUrl, select,
                            true {You can always change them again later in the <a>portal</a>.}
                            other {}
                          }
                        `}
                        values={{
                          hasPortalUrl: portalUrl !== '',
                          a: chunks => <PortalUrl>{chunks}</PortalUrl>,
                        }}
                      />
                    ),
                  },
                  {
                    value: 'useOnlyOnce',
                    label: (
                      <FormattedMessage
                        description="Profile digital address preferences modal 'useOnlyOnce' option label"
                        defaultMessage={`Use this {digitalAddressType, select,
                          email {email address}
                          phoneNumber {phone number}
                          other {{digitalAddressType}}
                        } only for this form.`}
                        values={{digitalAddressType}}
                      />
                    ),
                  },
                ] satisfies PreferenceRadioOption[]
              }
              aria-describedby={titleId}
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
