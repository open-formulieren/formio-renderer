import type {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';
import {useFormikContext} from 'formik';
import {FormattedMessage} from 'react-intl';

import {PrimaryActionButton, SecondaryActionButton} from '@/components/Button';
import FormFieldContainer from '@/components/FormFieldContainer';
import Fieldset from '@/components/forms/Fieldset';
import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import type {RegistryEntry} from '@/registry/types';

import PartnersPreview from './PartnersPreview';
import ValueDisplay from './ValueDisplay';
import {EMPTY_PARTNER} from './constants';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import {Affixes, BSN, DateOfBirth, Initials, LastName} from './subFields';
import type {ManuallyAddedPartnerDetails} from './types';
import getValidationSchema from './validationSchema';

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
      // Because `_OF_INTERNAL_addedManually` is only specified on `ManuallyAddedPartnerDetails`,
      // we need to validate it explicitly as a boolean value to make the linter happy
      '_OF_INTERNAL_addedManually' in partner && !!partner?._OF_INTERNAL_addedManually
  );
  const canAddPartner = partners.length === 0;
  const canEditPartner = manuallyAddedPartner !== undefined;
  const showPartnersList = partners.length > 0 && !canEditPartner;

  // Conform the business rules, if there is a manually added partner,
  // it must be the first and only partner.
  const subFieldNamePrefix = `${key}.0`;

  return (
    <Fieldset
      hasTooltip={!!tooltip}
      header={
        <>
          {label}
          {tooltip && <Tooltip>{tooltip}</Tooltip>}
        </>
      }
    >
      {showPartnersList && <PartnersPreview partners={partners} />}
      {canEditPartner && (
        <FormFieldContainer>
          <BSN namePrefix={subFieldNamePrefix} />
          <Initials namePrefix={subFieldNamePrefix} />
          <Affixes namePrefix={subFieldNamePrefix} />
          <LastName namePrefix={subFieldNamePrefix} />
          <DateOfBirth namePrefix={subFieldNamePrefix} />

          <div>
            <PrimaryActionButton hint="danger" onClick={() => setFieldValue(key, [])}>
              <FormattedMessage
                description="Partners component: 'remove partner' button label"
                defaultMessage="Remove partner details"
              />
            </PrimaryActionButton>
          </div>
        </FormFieldContainer>
      )}

      {canAddPartner && (
        <SecondaryActionButton onClick={() => setFieldValue(key, [EMPTY_PARTNER])}>
          <FormattedMessage
            description="Partners component: 'add partner' button label"
            defaultMessage="Add partner details"
          />
        </SecondaryActionButton>
      )}

      <HelpText>{description}</HelpText>
    </Fieldset>
  );
};

const PartnersFieldComponent: RegistryEntry<PartnersComponentSchema> = {
  formField: FormioPartnersField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  isEmpty,
  getValidationSchema,
};

export default PartnersFieldComponent;
