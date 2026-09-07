import {Alert, Icon as UtrechtIcon} from '@utrecht/component-library-react';
import {useState} from 'react';
import {FormattedMessage} from 'react-intl';

import FieldConfigProvider from '@/components/FieldConfigProvider';
import Icon from '@/components/icons';
import Modal from '@/components/modal';
import {useFormSettings} from '@/hooks';

import VerificationForm from './VerificationForm';

export interface VerificationModalProps {
  /**
   * Modal open/closed state.
   */
  isOpen: boolean;
  /**
   * Callback function to close the modal
   *
   * Invoked on ESC keypress or clicking the "X" to close the modal.
   */
  closeModal: React.ComponentProps<typeof Modal>['closeModal'];
  /**
   * Key of the component that has the email value.
   *
   * @todo This should probably use the *prefixed* key instead of just the component key
   * for backend validation purposes -> check this and create a bug issue if it doesn't
   * work in edit grids. Currently the formio.js variant just grabs `this.component.key`,
   * so this is likely broken for edit grids in production right now.
   */
  componentKey: string;
  /**
   * Email address to verify.
   */
  emailAddress: string;
  /**
   * Callback to invoke when the email was successfully verified.
   */
  onVerified: () => void;
}

/**
 * Modal for the email verification interaction flow.
 *
 * The user gets prompted to request a verification code, which must be entered
 * to complete the verification.
 *
 * @todo The UX/flow may be redesigned: https://github.com/open-formulieren/open-forms/issues/5744
 */
const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  closeModal,
  componentKey,
  emailAddress,
  onVerified,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const {componentParameters} = useFormSettings();
  if (!componentParameters?.email) {
    throw new Error(
      `The 'email verification' feature can only be used if verification parameters
      are provided. Check that the componentParameters are passed correctly in the
      FormioForm call.`
    );
  }
  const {requestVerificationCode, verifyCode} = componentParameters.email;
  return (
    <Modal
      title={
        <FormattedMessage
          description="Email verification modal title"
          defaultMessage="Email address verification"
        />
      }
      isOpen={isOpen}
      closeModal={() => {
        setErrorMessage('');
        closeModal();
      }}
    >
      {errorMessage ? (
        <Alert
          type="error"
          icon={
            <UtrechtIcon>
              <Icon icon="error" />
            </UtrechtIcon>
          }
        >
          {errorMessage}
        </Alert>
      ) : (
        // This form/modal may be a child of an edit grid item, which sets a name prefix.
        // Because we're in an isolated modal, these prefixes do not apply to the
        // verification form.
        <FieldConfigProvider namePrefix="">
          <VerificationForm
            componentKey={componentKey}
            emailAddress={emailAddress}
            onRequestVerificationCode={async (componentKey: string, email: string) =>
              await requestVerificationCode(componentKey, email)
            }
            onVerifyCode={async (componentKey: string, email: string, code: string) =>
              await verifyCode(componentKey, email, code)
            }
            onVerified={onVerified}
            onErrorMessage={setErrorMessage}
          />
        </FieldConfigProvider>
      )}
    </Modal>
  );
};

VerificationModal.displayName = 'VerificationModal';

export default VerificationModal;
