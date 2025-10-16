import {useIntl} from 'react-intl';

import type {FormioComponentProps} from '@/components/FormioComponent';
import Modal from '@/components/modal';
import type {GetRegistryEntry} from '@/registry/types';

import PartnerForm from './PartnerForm';
import type {ManuallyAddedPartnerDetails} from './types';

export interface PartnerModalProps {
  partnerToEdit: ManuallyAddedPartnerDetails;
  isOpen: boolean;
  onSave: (partner: ManuallyAddedPartnerDetails) => void;
  onClose: () => void;
  renderNested: React.FC<FormioComponentProps>;
  getRegistryEntry: GetRegistryEntry;
}

const PartnerModal: React.FC<PartnerModalProps> = ({
  partnerToEdit,
  onSave,
  onClose,
  isOpen,
  renderNested,
  getRegistryEntry,
}) => {
  const intl = useIntl();
  return (
    <Modal
      closeModal={onClose}
      isOpen={isOpen}
      title={
        partnerToEdit?.bsn
          ? intl.formatMessage({
              description: 'Partner modal: title text editing partner data',
              defaultMessage: 'Edit partner details',
            })
          : intl.formatMessage({
              description: 'Partner modal: title text adding new partner data',
              defaultMessage: 'Add partner details',
            })
      }
    >
      <PartnerForm
        partner={partnerToEdit}
        onSave={onSave}
        renderNested={renderNested}
        getRegistryEntry={getRegistryEntry}
      />
    </Modal>
  );
};

export default PartnerModal;
