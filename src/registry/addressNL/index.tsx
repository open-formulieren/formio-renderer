import type {AddressNLComponentSchema} from '@open-formulieren/types';
import {clsx} from 'clsx';
import {getIn, useFormikContext} from 'formik';
import type {FormikErrors} from 'formik';
import {useId} from 'react';

import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import type {RegistryEntry} from '@/registry/types';

import './AddressNL.scss';
import ValueDisplay from './ValueDisplay';
import {SUB_FIELD_NAMES} from './constants';
import {useDeriveAddress} from './deriveAddress';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import {
  City,
  HouseLetter,
  HouseNumberAddition,
  HouseNumberField,
  PostCodeField,
  StreetName,
} from './subFields';
import type {FormValues} from './types';
import getValidationSchema from './validationSchema';

export interface FormioAddressNLProps {
  componentDefinition: AddressNLComponentSchema;
}

export const FormioAddressNL: React.FC<FormioAddressNLProps> = ({
  componentDefinition: {
    key,
    label,
    tooltip,
    description,
    validate,
    layout = 'doubleColumn',
    deriveAddress = false,
  },
}) => {
  const {values, errors, getFieldMeta} = useFormikContext<FormValues>();
  const id = useId();

  const {enableManualEntry} = useDeriveAddress(key, deriveAddress);

  // derive the component touched state from the individual checkboxes that make up the
  // component
  const touched = SUB_FIELD_NAMES.some(subFieldName => {
    const nestedFieldName = `${key}.${subFieldName}`;
    const {touched} = getFieldMeta<boolean>(nestedFieldName);
    return touched;
  });

  const error: FormikErrors<FormValues>[string] | string = getIn(errors, key);

  // check if there's an error for the address field *itself* rather than one of the
  // sub keys
  const addressError: string | undefined = typeof error === 'string' ? error : undefined;

  const invalid = touched && !!addressError;
  const errorMessageId = invalid && addressError ? `${id}-error-message` : undefined;
  const descriptionid = `${id}-description`;

  // An address as a whole is or is not required.
  const isRequired = validate?.required;
  // City and street fields are only displayed (potentially editable, potentially readonly)
  // if the address should be derived from postcode + house number.
  const showCityAndStreetFields = deriveAddress;

  const hasPostcode = !!getIn(values, `${key}.postcode`);
  const hasHouseNumber = !!getIn(values, `${key}.houseNumber`);
  const areCityAndStreetNameRequired =
    showCityAndStreetFields && Boolean(isRequired || hasPostcode || hasHouseNumber);

  return (
    <fieldset
      className={clsx(
        'openforms-fieldset',
        invalid && 'openforms-fieldset--invalid',
        'openforms-addressnl',
        {
          'openforms-addressnl--double-column': layout === 'doubleColumn',
          'openforms-addressnl--single-column': layout === 'singleColumn',
        }
      )}
      aria-describedby={description ? descriptionid : undefined}
    >
      <legend
        className={clsx('openforms-fieldset__legend', {
          'openforms-fieldset__legend--tooltip': !!tooltip,
        })}
      >
        {label}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </legend>

      <div className="openforms-addressnl__form-field-container">
        <PostCodeField namePrefix={key} isRequired={isRequired || hasHouseNumber} />
        <HouseNumberField namePrefix={key} isRequired={isRequired || hasPostcode} />
        <HouseLetter namePrefix={key} />
        <HouseNumberAddition namePrefix={key} />
        {showCityAndStreetFields && (
          <>
            <StreetName
              namePrefix={key}
              isDisabled={!enableManualEntry}
              isRequired={areCityAndStreetNameRequired}
            />
            <City
              namePrefix={key}
              isDisabled={!enableManualEntry}
              isRequired={areCityAndStreetNameRequired}
            />
          </>
        )}
      </div>
      <HelpText id={descriptionid}>{description}</HelpText>
      {touched && errorMessageId && addressError && (
        <ValidationErrors error={addressError} id={errorMessageId} />
      )}
    </fieldset>
  );
};

const AddressNLComponent: RegistryEntry<AddressNLComponentSchema> = {
  formField: FormioAddressNL,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default AddressNLComponent;
