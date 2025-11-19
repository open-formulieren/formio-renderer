import type {PreferenceUpdateOptions} from '@open-formulieren/types';
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
import {useFormSettings} from '@/hooks';

interface DigitalAddressPreferencesModalProps extends Pick<ModalProps, 'closeModal' | 'isOpen'> {
  onSubmit: (preference: PreferenceUpdateOptions) => void;
}

type FormValues = {preference: PreferenceUpdateOptions};
type PreferenceRadioOption = RadioOption & {value: PreferenceUpdateOptions};

const DigitalAddressPreferencesModal: React.FC<DigitalAddressPreferencesModalProps> = ({
  closeModal,
  isOpen,
  onSubmit,
}) => {
  const id = useId();
  const titleId = `${id}-title`;
  const formSettings = useFormSettings();
  if (!formSettings?.componentParameters?.customerProfile) {
    throw new Error('Customer profile component parameters not configured');
  }

  const {portalUrl} = formSettings.componentParameters.customerProfile;

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
                        defaultMessage={`Save my data for the future forms.
                          You can edit your preferences in the online <a>portal</a>.`}
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
