import type {PartnerDetails} from '@open-formulieren/types';
import {DataList, DataListItem, DataListKey, DataListValue} from '@utrecht/component-library-react';
import {FormattedDate, FormattedMessage} from 'react-intl';

import PARTNER_COMPONENTS from './subFieldDefinitions';
import type {PartnerComponentsKeys} from './types';

const formatPartnerData = (
  value: string,
  partnerComponentKey: PartnerComponentsKeys
): React.ReactNode => {
  if (partnerComponentKey === 'dateOfBirth') {
    return <FormattedDate value={value} dateStyle="long" />;
  }

  return value;
};

interface PartnersListProps {
  partners: PartnerDetails[];
}

const PartnersList: React.FC<PartnersListProps> = ({partners}) => {
  const partnerFields = PARTNER_COMPONENTS.map(({key, label}) => ({
    name: key,
    label: label,
  }));

  return (
    <div className="openforms-partners-list">
      {partners.map((partner, index) => (
        <>
          {/* Divider between partners */}
          {index > 0 && <hr />}

          <DataList key={index}>
            {partnerFields.map(({name, label}) => (
              <DataListItem key={`${index}-${name}`}>
                <DataListKey>
                  <FormattedMessage {...label} />
                </DataListKey>
                <DataListValue>
                  {partner[name] ? (
                    formatPartnerData(partner[name], name)
                  ) : (
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
    </div>
  );
};

export default PartnersList;
