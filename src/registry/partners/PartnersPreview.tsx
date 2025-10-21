import type {PartnerDetails} from '@open-formulieren/types';
import {DataList, DataListItem, DataListKey, DataListValue} from '@utrecht/component-library-react';
import {FormattedDate, FormattedMessage} from 'react-intl';
import type {MessageDescriptor} from 'react-intl';

import './PartnersPreview.scss';
import {FIELD_LABELS} from './subFields';
import type {ManuallyAddedPartnerDetails} from './types';

const formatPartnerData = (key: keyof PartnerDetails, value: string): React.ReactNode => {
  return key === 'dateOfBirth' ? <FormattedDate value={value} dateStyle="long" /> : value;
};

export interface PartnerPreviewProps {
  partners: ManuallyAddedPartnerDetails[] | PartnerDetails[];
}

const PartnersPreview: React.FC<PartnerPreviewProps> = ({partners}) => {
  const partnerFields = Object.entries(FIELD_LABELS).map(
    ([key, label]: [keyof PartnerDetails, MessageDescriptor]) => ({
      name: key,
      label: label,
    })
  );

  return (
    <div className="openforms-partners-preview">
      {partners.map((partner, index) => (
        <>
          {/* Divider between partners */}
          {index > 0 && <hr />}

          <DataList key={index} appearance="rows">
            {partnerFields.map(({name, label}) => (
              <DataListItem key={`${index}-${name}`}>
                <DataListKey>
                  <FormattedMessage {...label} />
                </DataListKey>
                <DataListValue>
                  {partner[name] ? (
                    formatPartnerData(name, partner[name])
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

export default PartnersPreview;
