import {PrimaryActionButton} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';
import {FormattedMessage} from 'react-intl';

import Loader from '@/components/loader';

import {ManuallyAddedPartnerDetails} from './types';

const PartnerSubmitButton: React.FC = () => {
  const {isSubmitting, submitForm} = useFormikContext<ManuallyAddedPartnerDetails>();
  return (
    <PrimaryActionButton
      type="button"
      onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        await submitForm();
      }}
      disabled={isSubmitting}
    >
      <Loader modifiers={['centered', 'only-child', 'small', 'gray']} loading={isSubmitting} />
      {!isSubmitting && (
        <FormattedMessage
          description="Add partner: save partner data button text"
          defaultMessage="Save"
        />
      )}
    </PrimaryActionButton>
  );
};

export default PartnerSubmitButton;
