import {useFormikContext} from 'formik';
import {FormattedMessage} from 'react-intl';

import {PrimaryActionButton} from '@/components/Button';
import LoadingIndicator from '@/components/LoadingIndicator';

/**
 * Submit button to perform the email verification against the backend.
 */
const EnterCodeButton: React.FC = () => {
  const {isSubmitting} = useFormikContext();
  return (
    <PrimaryActionButton type="submit" disabled={isSubmitting}>
      {isSubmitting ? (
        <LoadingIndicator position="center" size="small" color="muted" />
      ) : (
        <FormattedMessage
          description="Email verification: verify code button text"
          defaultMessage="Verify"
        />
      )}
    </PrimaryActionButton>
  );
};

export default EnterCodeButton;
