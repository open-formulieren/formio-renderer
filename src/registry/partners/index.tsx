import type {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';
import {PrimaryActionButton} from '@utrecht/component-library-react';
import {clsx} from 'clsx';
import {useFormikContext} from 'formik';
import {FormattedMessage} from 'react-intl';

import FormFieldContainer from '@/components/FormFieldContainer';
import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import type {RegistryEntry} from '@/registry/types';

import PartnersPreview from './PartnersPreview';
import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import './index.scss';
import getInitialValues from './initialValues';
import {Affixes, BSN, DateOfBirth, Initials, LastName} from './subFields';
import type {ManuallyAddedPartnerDetails} from './types';

export interface FormioPartnersFieldProps {
  componentDefinition: PartnersComponentSchema;
}

export const FormioPartnersField: React.FC<FormioPartnersFieldProps> = ({
  componentDefinition: {key, label, description, tooltip},
}) => {
  const {setFieldValue, getFieldProps} = useFormikContext();
  const {value: partners} = getFieldProps<ManuallyAddedPartnerDetails[] | PartnerDetails[]>(key);

  const manuallyAddedPartner = partners.find(
    (partner): partner is ManuallyAddedPartnerDetails =>
      // Because `__addedManually` is only specified on `ManuallyAddedPartnerDetails`,
      // we need to validate it explicitly as a boolean value to make the linter happy
      '__addedManually' in partner && !!partner?.__addedManually
  );
  const canAddPartner = partners.length === 0;
  const canEditPartner = manuallyAddedPartner !== undefined;
  const showPartnersList = partners.length > 0 && !canEditPartner;

  // Conform the business rules, if there is a manually added partner,
  // it must be the first and only partner.
  const subFieldNamePrefix = `${key}.0`;

  const addPartner = () => {
    setFieldValue(key, [
      {
        bsn: '',
        initials: '',
        affixes: '',
        lastName: '',
        dateOfBirth: '',
        __addedManually: true,
      } satisfies ManuallyAddedPartnerDetails,
    ]);
  };

  return (
    <fieldset className="openforms-fieldset">
      <legend
        className={clsx('openforms-fieldset__legend', {
          'openforms-fieldset__legend--tooltip': !!tooltip,
        })}
      >
        {label}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </legend>

      {showPartnersList && <PartnersPreview partners={partners} />}
      {canEditPartner && (
        <FormFieldContainer>
          <BSN namePrefix={subFieldNamePrefix} />
          <Initials namePrefix={subFieldNamePrefix} />
          <Affixes namePrefix={subFieldNamePrefix} />
          <LastName namePrefix={subFieldNamePrefix} />
          <DateOfBirth namePrefix={subFieldNamePrefix} />
        </FormFieldContainer>
      )}

      {canAddPartner && (
        <PrimaryActionButton onClick={() => addPartner()}>
          <FormattedMessage
            description="Partners component: 'add partner' button label"
            defaultMessage="Add partner"
          />
        </PrimaryActionButton>
      )}

      <HelpText>{description}</HelpText>
    </fieldset>
  );
};

const PartnersFieldComponent: RegistryEntry<PartnersComponentSchema> = {
  formField: FormioPartnersField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  isEmpty,
};

export default PartnersFieldComponent;
