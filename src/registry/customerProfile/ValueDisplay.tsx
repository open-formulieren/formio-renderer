import type {CustomerProfileComponentSchema, CustomerProfileData} from '@open-formulieren/types';
import {
  DataList,
  DataListItem,
  DataListKey,
  DataListValue,
  UnorderedList,
  UnorderedListItem,
} from '@utrecht/component-library-react';
import {FormattedMessage} from 'react-intl';

import './ValueDisplay.scss';
import {FIELD_LABELS} from './subFields';

export interface ValueDisplayProps {
  componentDefinition: CustomerProfileComponentSchema;
  value: CustomerProfileData | null;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({value}) => {
  if (value == null || !value.length) return '';
  return (
    <UnorderedList>
      {value.map(address => (
        <UnorderedListItem key={address.type}>
          <DataList appearance="rows">
            <DataListItem>
              <DataListKey>
                <FormattedMessage {...FIELD_LABELS[address.type]} />
              </DataListKey>
              <DataListValue>
                {address.address || (
                  <i>
                    <FormattedMessage
                      description="Emtpy field message"
                      defaultMessage="No information provided"
                    />
                  </i>
                )}
                {address.preferenceUpdate === 'isNewPreferred' && (
                  <i>
                    {' '}
                    <FormattedMessage
                      description="Profile digital address value display: address as new preferred"
                      defaultMessage={`(Will become preferred {digitalAddressType, select,
                        email {email address}
                        phoneNumber {phone number}
                        other {{digitalAddressType}}
                      })`}
                      values={{digitalAddressType: address.type}}
                    />
                  </i>
                )}
              </DataListValue>
            </DataListItem>
          </DataList>
        </UnorderedListItem>
      ))}
    </UnorderedList>
  );
};

export default ValueDisplay;
