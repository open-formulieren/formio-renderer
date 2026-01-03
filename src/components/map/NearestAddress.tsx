import type {CoordinatePair} from '@open-formulieren/types/dist/components/map';
import type React from 'react';
import {FormattedMessage} from 'react-intl';
import {useAsync} from 'react-use';

import {useFormSettings} from '@/hooks';

import './MapAddress.scss';

interface NearestAddressProps {
  coordinates: CoordinatePair;
}

/**
 * Retrieve and display the nearest address label for the selected coordinates.
 */
const NearestAddress: React.FC<NearestAddressProps> = ({coordinates}) => {
  // XXX: this would benefit from caching, but rather than rolling our own we should
  // probably look into useQuery/tanstack react query
  const formSettings = useFormSettings();
  const mapNearestLookup = formSettings?.componentParameters?.map?.mapNearestLookup;

  const {value: addressLabel, error} = useAsync(async () => {
    if (!mapNearestLookup) return null;

    const [lat, lng] = coordinates;
    const data = await mapNearestLookup(lat, lng);
    return data ? data.label : null;
  }, [coordinates]);
  // silent failure for a non-critical part
  if (error) {
    console.error(error);
    // XXX: see if we can send this to Sentry
    return null;
  }

  if (addressLabel === null) return null;
  return (
    <div className="openforms-map-address">
      {/** can't put address inside a p element */}
      <div className="utrecht-paragraph">
        <FormattedMessage
          description="Reverse geocoded address result display"
          defaultMessage="Nearest address: <address></address>"
          values={{
            address: () => (
              <address className="openforms-map-address__description">{addressLabel}</address>
            ),
          }}
        />
      </div>
    </div>
  );
};

export default NearestAddress;
