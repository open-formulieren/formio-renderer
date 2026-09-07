import {Alert, Paragraph, Icon as UtrechtIcon} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';
import {useId, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {PrimaryActionButton} from '@/components/Button';
import Icon from '@/components/icons';

import VerificationModal from './VerificationModal';
import './VerificationStatus.scss';
import {useVerificationStatus} from './hooks';

export interface VerificationStatusProps {
  /**
   * The component key to check the status for, prefixed with any top-level namespaces
   * (e.g. when used within an edit grid).
   */
  prefixedComponentKey: string;
  /**
   * Name of the form field to look up the current value from the Formik state.
   */
  name: string;
}

/**
 * Display the verification status and interaction elements to start email verification.
 */
const VerificationStatus: React.FC<VerificationStatusProps> = ({prefixedComponentKey, name}) => {
  const {getFieldProps, setStatus, status} = useFormikContext();
  const verificationStatus = useVerificationStatus();
  const [modalOpen, setIsModalOpen] = useState<boolean>(false);
  const id = useId();

  const {value: email = ''} = getFieldProps<string | undefined>(name);
  const isVerified = verificationStatus?.[prefixedComponentKey]?.[email];

  if (isVerified) {
    return (
      <Paragraph className="openforms-email-verification-status openforms-email-verification-status--confirmation">
        <FormattedMessage
          description="Email verification: verification status confirmation message."
          defaultMessage="The email address ''{email}' is verified."
          values={{email}}
        />
      </Paragraph>
    );
  }

  // no email address entered yet -> there's nothing to verify
  if (!email) return null;

  return (
    <>
      <div className="openforms-email-verification-status">
        <Alert
          id={id}
          type="warning"
          icon={
            <UtrechtIcon>
              <Icon icon="warning" />
            </UtrechtIcon>
          }
        >
          <FormattedMessage
            description="Email verification warning for unverified emails."
            defaultMessage="You must verify this email address to continue."
          />
        </Alert>
        <PrimaryActionButton
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={!email}
          aria-disabled={!email}
          aria-describedby={id}
        >
          <FormattedMessage
            description="Email verification button label."
            defaultMessage="Verify"
          />
        </PrimaryActionButton>
      </div>
      <VerificationModal
        isOpen={modalOpen}
        closeModal={() => setIsModalOpen(false)}
        // TODO - update the backend to handle prefixes correctly
        componentKey={prefixedComponentKey}
        emailAddress={email}
        onVerified={() => {
          const newVerificationStatus = {...verificationStatus};
          if (!newVerificationStatus[prefixedComponentKey])
            newVerificationStatus[prefixedComponentKey] = {} satisfies Partial<
              Record<string, boolean>
            >;
          newVerificationStatus[prefixedComponentKey][email] = true;
          const newStatus = {...status, emailVerification: newVerificationStatus};
          setStatus(newStatus);
          setIsModalOpen(false);
        }}
      />
    </>
  );
};

export default VerificationStatus;
