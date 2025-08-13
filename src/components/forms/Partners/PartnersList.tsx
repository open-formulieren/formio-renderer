import type {PartnerDetails} from '@open-formulieren/types';
import {DataList, DataListItem, DataListKey, DataListValue} from '@utrecht/component-library-react';
import {FormattedMessage} from 'react-intl';

import PARTNER_COMPONENTS from './definition';

interface PartnersListProps {
  partners: PartnerDetails[];
}

const PartnersList: React.FC<PartnersListProps> = ({partners}) => {
  const partnerFields = PARTNER_COMPONENTS.map(({key, label}) => ({
    name: key,
    label: label,
  }));

  return (
    <>
      {partners.map((partner, index) => (
        <>
          {/* Divider between partners */}
          {index > 0 && <hr />}

          <DataList key={index}>
            {partnerFields.map(({name, label}) => (
              <DataListItem key={name}>
                <DataListKey>
                  <FormattedMessage {...label} />
                </DataListKey>
                <DataListValue>
                  {partner[name] || (
                    <i>
                      <FormattedMessage
                        description="Emtpy field message"
                        defaultMessage="No information provided"
                      />
                    </i>
                  )}
                </DataListValue>
              </DataListItem>
            ))}
          </DataList>
        </>
      ))}
    </>
  );
};

export default PartnersList;
