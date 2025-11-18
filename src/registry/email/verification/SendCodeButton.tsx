import {useFormikContext} from 'formik';
import {useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {PrimaryActionButton} from '@/components/Button';
import LoadingIndicator from '@/components/LoadingIndicator';

import type {Values} from './VerificationForm';
import type {Mode, RequestVerificationCode} from './types';

interface SendCodeButtonProps {
  componentKey: string;
  emailAddress: string;
  onRequestVerificationCode: RequestVerificationCode;
  onError: (error: string) => void;
}

/**
 * Button to request a verification code to be sent.
 *
 * On click, the button will initiate the request for the backend to send a verification
 * code to the provided email address. Any errors returned from that call bubble up to
 * the calling component.
 *
 * If the send code request was successful, the pending state is reset and the
 * verification flow automatically proceeds to the 'enter verification code' step.
 */
const SendCodeButton: React.FC<SendCodeButtonProps> = ({
  componentKey,
  emailAddress,
  onRequestVerificationCode,
  onError,
}) => {
  const [isPending, setIsPending] = useState(false);
  const {getFieldHelpers} = useFormikContext<Values>();
  const {setValue: setMode} = getFieldHelpers<Mode>('mode');

  if (!emailAddress) throw new Error('Empty email address is not allowed.');
  return (
    <PrimaryActionButton
      type="button"
      onClick={async () => {
        setIsPending(true);
        const result = await onRequestVerificationCode(componentKey, emailAddress);
        if (result.success) {
          setIsPending(false);
          setMode('enterCode');
          return;
        } else {
          setIsPending(false);
          onError(result.errorMessage);
        }
      }}
      disabled={isPending}
    >
      {isPending ? (
        <LoadingIndicator position="center" size="small" color="muted" />
      ) : (
        <FormattedMessage
          description="Email verification: send code button text"
          defaultMessage="Send code"
        />
      )}
    </PrimaryActionButton>
  );
};

export default SendCodeButton;
