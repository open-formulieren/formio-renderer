import {useIntl} from 'react-intl';

import type {FormioComponentProps} from '@/components/FormioComponent';
import Modal from '@/components/Modal';
import type {GetRegistryEntry} from '@/registry/types';

import PartnerForm from './PartnerForm';
import {ManuallyAddedPartnerDetails} from './types';

interface PartnerModalProps {
  partnerToEdit: ManuallyAddedPartnerDetails;
  isOpen: boolean;
  onSave: () => void;
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
      title={intl.formatMessage({
        description: 'Partner modal title',
        defaultMessage: 'Add partner',
      })}
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
