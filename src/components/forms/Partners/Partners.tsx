import type {PartnerDetails} from '@open-formulieren/types';
import {FormField, PrimaryActionButton} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';
import {useState} from 'react';
import {FormattedMessage} from 'react-intl';

import type {FormioComponentProps} from '@/components/FormioComponent';
import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import PartnerModal from '@/components/forms/Partners/PartnerModal';
import Tooltip from '@/components/forms/Tooltip';
import type {GetRegistryEntry} from '@/registry/types';

import './Partners.scss';
import PartnersList from './PartnersList';
import type {ManuallyAddedPartnerDetails} from './types';

export interface PartnerProps {
  /**
   * Name of 'form field' in the Formio form data structure. The rendered edit grid items
   * are based off the value of this field.
   */
  name: string;
  /**
   * The (accessible) label for the field - anything that can be rendered.
   */
  label: React.ReactNode;
  /**
   * Additional description displayed close to the field - use this to document any
   * validation requirements that are crucial to successfully submit the form. More
   * information that is contextual/background typically belongs in a tooltip.
   */
  description?: React.ReactNode;
  /**
   * Optional tooltip to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  tooltip?: React.ReactNode;
  /**
   * The generic render component for nested components.
   */
  renderNested: React.FC<FormioComponentProps>;
  /**
   * The registry entrypoint to look up the component-type specific configuration for
   * a given component. Used to render the nested partner components.
   */
  getRegistryEntry: GetRegistryEntry;
}

const EMPTY_PARTNER_DATA: ManuallyAddedPartnerDetails = {
  bsn: '',
  initials: '',
  affixes: '',
  lastName: '',
  dateOfBirth: '',
  __addedManually: true,
};

const Partners: React.FC<PartnerProps> = ({
  name,
  label,
  tooltip,
  description,
  renderNested,
  getRegistryEntry,
}) => {
  const [partnerToEdit, setPartnerToEdit] = useState<ManuallyAddedPartnerDetails | null>(null);
  const {setFieldValue, getFieldProps} = useFormikContext();
  const {value: partners} = getFieldProps<
    (ManuallyAddedPartnerDetails | PartnerDetails)[] | undefined
  >(name);

  const canAddPartner = !partners || partners?.length === 0;

  const manuallyAddedPartner = partners?.find(
    (partner): partner is ManuallyAddedPartnerDetails =>
      '__addedManually' in partner && partner?.__addedManually
  );
  const canEditPartner = manuallyAddedPartner !== undefined;

  const onPartnerSave = async (partner: ManuallyAddedPartnerDetails) => {
    await setFieldValue(name, [partner]);
    setPartnerToEdit(null);
  };

  const onModalClose = () => {
    setPartnerToEdit(null);
  };

  const openPartnerModal = (partner: ManuallyAddedPartnerDetails) => {
    setPartnerToEdit(partner);
  };

  return (
    <FormField className="utrecht-form-field--openforms">
      <Label tooltip={tooltip ? <Tooltip>{tooltip}</Tooltip> : undefined}>{label}</Label>
      {partners?.length ? <PartnersList partners={partners} /> : null}

      {partnerToEdit && (
        <PartnerModal
          isOpen
          partnerToEdit={partnerToEdit}
          onSave={onPartnerSave}
          onClose={onModalClose}
          renderNested={renderNested}
          getRegistryEntry={getRegistryEntry}
        />
      )}

      {canAddPartner && (
        <PrimaryActionButton onClick={() => openPartnerModal(EMPTY_PARTNER_DATA)}>
          <FormattedMessage
            description="Partner component: 'add partner' button label"
            defaultMessage="Add partner"
          />
        </PrimaryActionButton>
      )}
      {canEditPartner && (
        <PrimaryActionButton onClick={() => openPartnerModal(manuallyAddedPartner)}>
          <FormattedMessage
            description="Partner component: 'edit partner' button label"
            defaultMessage="Edit partner details"
          />
        </PrimaryActionButton>
      )}

      <HelpText>{description}</HelpText>
    </FormField>
  );
};

export default Partners;
