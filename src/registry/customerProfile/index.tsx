import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import type {DigitalAddress} from '@open-formulieren/types/dist/components/customerProfile';
import {clsx} from 'clsx';
import type {FormikErrors} from 'formik';
import {getIn, useFormikContext} from 'formik';
import {useId} from 'react';

import FormFieldContainer from '@/components/FormFieldContainer';
import LoadingIndicator from '@/components/LoadingIndicator';
import {ValidationErrors} from '@/components/forms';
import FAQItems from '@/components/forms/FAQItems';
import Fieldset from '@/components/forms/Fieldset';
import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import {LabelSettingsContext} from '@/context';
import {useFieldConfig, useFormSettings} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

import './CustomerProfile.scss';
import ValueDisplay from './ValueDisplay';
import {DIGITAL_ADDRESS_FIELD_NAMES} from './constants';
import isEmpty from './empty';
import {useDigitalAddresses} from './hooks';
import getInitialValues from './initialValues';
import {DigitalAddressFields} from './subFields';
import type {CustomerProfileData, FormValues} from './types';
import getValidationSchema from './validationSchema';

export interface FormioCustomerProfileProps {
  componentDefinition: CustomerProfileComponentSchema;
}

export const FormioCustomerProfile: React.FC<FormioCustomerProfileProps> = ({
  componentDefinition: {
    key: name,
    label,
    tooltip,
    description,
    validate,
    digitalAddressTypes,
    faqItems = [],
  },
}) => {
  const {requiredFieldsWithAsterisk} = useFormSettings();
  const {getFieldMeta} = useFormikContext<FormValues>();
  const id = useId();
  name = useFieldConfig(name);
  const {value, error: formikError} = getFieldMeta<CustomerProfileData>(name);
  const {digitalAddresses, loading} = useDigitalAddresses(name, digitalAddressTypes);

  const touched = value?.some((_, index) =>
    DIGITAL_ADDRESS_FIELD_NAMES.some(subFieldName => {
      const nestedFieldName = `${name}.${index}.${subFieldName}`;
      const {touched} = getFieldMeta<boolean>(nestedFieldName);
      return touched;
    })
  );

  const error = formikError as unknown as
    | undefined
    | string
    | (string | FormikErrors<DigitalAddress>)[];

  const fieldError = typeof error === 'string' && error;
  const subfieldErrors = Array.isArray(error);

  const invalid = touched && !!fieldError;
  const isRequired = validate?.required;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;

  const markLegendRequired = isRequired && digitalAddressTypes.length > 1;

  return (
    <Fieldset
      header={
        <span
          className={clsx('openforms-fieldset-legend-content', {
            'openforms-customer-profile-required-marker':
              requiredFieldsWithAsterisk && markLegendRequired,
          })}
        >
          {label}
          {tooltip && <Tooltip>{tooltip}</Tooltip>}
        </span>
      }
      isInvalid={invalid}
      hasTooltip={!!tooltip}
      aria-describedby={[descriptionId, errorMessageId].filter(Boolean).join(' ')}
    >
      {loading ? (
        <LoadingIndicator />
      ) : (
        <LabelSettingsContext.Provider value={{showOptionalSuffix: !requiredFieldsWithAsterisk}}>
          <FormFieldContainer>
            {digitalAddressTypes.map((digitalAddressType, index) => {
              const Component = DigitalAddressFields[digitalAddressType];
              const digitalAddress = digitalAddresses?.find(
                address => address.type === digitalAddressType
              );

              const anyOtherFieldFilledOut = value
                .filter(({type}) => type !== digitalAddressType)
                .some(({address}) => address.length > 0);

              // when asterisks are not used to mark fields required, optional fields
              // instead (normally) get the suffix that the field is not required. In
              // asterisks-mode, we can simply display it on the fieldset legend and
              // never visually mark the subfields as required (unless there's only a
              // single address type, see below), however, without asterisks, we need to
              // be carefully to not create the impression that all subfields are
              // optional - but, we also want to hint that as soon as one subfield is
              // filled out in a required customer profile component, that the *other*
              // subfields are now effectively optional.
              // So, we want to prevent the 'not required' suffix to be shown when:
              // * no asterisks are used (when they are, we don't mark the subfields as
              //   required but instead the fieldset as a whole)
              // * the field is required - if it's optional, all subfields are always
              //   optional
              // * no other values have been filled out yet - the one value that has been
              //   filled out is treated as 'required'. Filling out additional fields
              //   will allow clearing 'this' subfield in the UI.
              const preventNotRequiredSuffix =
                !requiredFieldsWithAsterisk && isRequired && !anyOtherFieldFilledOut;
              // if there's only a single sub field, we can be more explicit and apply
              // regular required asterisks/optional suffix semantics
              const isSubfieldRequired =
                (isRequired && digitalAddressTypes.length === 1) || preventNotRequiredSuffix;

              return (
                <Component
                  key={digitalAddressType}
                  profileFieldName={name}
                  namePrefix={`${name}.${index}`}
                  isRequired={isSubfieldRequired}
                  digitalAddressGroup={digitalAddress}
                  errors={subfieldErrors ? getIn(error, `${index}`) : undefined}
                />
              );
            })}
          </FormFieldContainer>
        </LabelSettingsContext.Provider>
      )}
      <HelpText id={descriptionId}>{description}</HelpText>
      {fieldError && errorMessageId && <ValidationErrors id={errorMessageId} error={fieldError} />}
      <FAQItems items={faqItems} />
    </Fieldset>
  );
};

const CustomerProfileComponent: RegistryEntry<CustomerProfileComponentSchema> = {
  formField: FormioCustomerProfile,
  getValidationSchema,
  isEmpty,
  valueDisplay: ValueDisplay,
  getInitialValues,
};

export default CustomerProfileComponent;
