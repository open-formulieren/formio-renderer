import type {AddressData, AddressNLComponentSchema} from '@open-formulieren/types';

import './ValueDisplay.scss';

export interface ValueDisplayProps {
  componentDefinition: AddressNLComponentSchema;
  value: AddressData | undefined;
}

/**
 * Format a Dutch address.
 *
 * Formatting guidelines: https://www.adresseninfo.nl/hoe-schrijf-je-adres/
 */
const ValueDisplay: React.FC<ValueDisplayProps> = ({
  componentDefinition: {deriveAddress = false},
  value,
}) => {
  if (!value) return null;
  const displayStreetAndCity = deriveAddress;

  const {
    postcode = '',
    houseNumber = '',
    houseLetter = '',
    houseNumberAddition = '',
    city = '',
    streetName = '',
  } = value;

  const normalizedPostcode =
    postcode.length === 6 ? `${postcode.substring(0, 4)} ${postcode.substring(4, 6)}` : postcode;
  // there are no official formatting rules - commonly used are / or - before the house number
  // addition. No spaces anywhere, and never a separator between house number and house letter
  // seem to be commonly used guidelines.
  const fullHouseNumber = `${houseNumber}${houseLetter}${houseNumberAddition ? '-' : ''}${houseNumberAddition}`;
  const addressBody: React.ReactNode = displayStreetAndCity ? (
    <>
      {streetName}&nbsp;{fullHouseNumber}
      <br />
      {normalizedPostcode}&nbsp;&nbsp;{city}
    </>
  ) : (
    // simple format without city or street name
    `${normalizedPostcode} ${fullHouseNumber}`
  );

  return (
    <address className="openforms-addressnl-display" dir="ltr">
      {addressBody}
    </address>
  );
};

export default ValueDisplay;
