import type {PartnerDetails} from '@open-formulieren/types';
import {DataList, DataListItem, DataListKey, DataListValue} from '@utrecht/component-library-react';
import {FormattedDate, FormattedMessage} from 'react-intl';
import type {MessageDescriptor} from 'react-intl';

import './PartnerPreview.scss';
import {FIELD_LABELS} from './subFields';
import type {ManuallyAddedPartnerDetails} from './types';

const formatPartnerData = (key: keyof PartnerDetails, value: string): React.ReactNode => {
  return key === 'dateOfBirth' ? <FormattedDate value={value} dateStyle="long" /> : value;
};

export interface PartnerPreviewProps {
  partner: ManuallyAddedPartnerDetails | PartnerDetails;
}

const PartnerPreview: React.FC<PartnerPreviewProps> = ({partner}) => {
  const partnerFields = Object.entries(FIELD_LABELS).map(
    ([key, label]: [keyof PartnerDetails, MessageDescriptor]) => ({
      name: key,
      label: label,
    })
  );

  return (
    <DataList appearance="rows">
      {partnerFields.map(({name, label}) => (
        <DataListItem key={name}>
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
  );
};

export default PartnerPreview;
