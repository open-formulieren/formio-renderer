import type {CurrencyComponentSchema} from '@open-formulieren/types';
import {useIntl} from 'react-intl';

import NumberField from '@/components/forms/NumberField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export const getCurrencySymbol = (currency: string, locale: string): string => {
  const numberFormat = new Intl.NumberFormat(locale, {style: 'currency', currency});

  // We get the currency symbol by formatting an arbitrary number and extracting it from the parts
  const parts = numberFormat.formatToParts(1.0);

  // All the part values before the 1 are combined to include (possible) spaces.
  // Note that this assumes that the currency symbol is in front of the value, which is true
  // for the locales that we currently support (Dutch and English).
  const stopIndex = parts.findIndex(part => part.value === '1');
  return parts
    .slice(0, stopIndex)
    .map(part => part.value)
    .join('');
};

export interface FormioCurrencyFieldProps {
  componentDefinition: CurrencyComponentSchema;
}

export const FormioCurrencyField: React.FC<FormioCurrencyFieldProps> = ({
  componentDefinition: {
    key,
    label,
    description,
    tooltip,
    validate,
    currency,
    decimalLimit = 2,
    allowNegative,
    disabled: isReadOnly,
  },
}) => {
  const {locale} = useIntl();

  const currencySymbol = getCurrencySymbol(currency, locale);

  return (
    <NumberField
      name={key}
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
      decimalLimit={decimalLimit}
      allowNegative={allowNegative}
      isReadOnly={isReadOnly}
      valuePrefix={currencySymbol}
      useThousandSeparator
      fixedDecimalScale
    />
  );
};

const CurrencyFieldComponent: RegistryEntry<CurrencyComponentSchema> = {
  formField: FormioCurrencyField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default CurrencyFieldComponent;
