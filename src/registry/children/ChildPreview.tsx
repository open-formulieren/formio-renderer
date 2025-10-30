import type {ChildDetails} from '@open-formulieren/types';
import {DataList, DataListItem, DataListKey, DataListValue} from '@utrecht/component-library-react';
import {clsx} from 'clsx';
import {FormattedDate, FormattedMessage} from 'react-intl';
import type {MessageDescriptor} from 'react-intl';

import './ChildPreview.scss';
import {FIELD_LABELS} from './subFields';
import type {ExtendedChildDetails} from './types';

const formatChildData = (key: keyof ChildDetails, value: string): React.ReactNode => {
  return key === 'dateOfBirth' ? <FormattedDate value={value} dateStyle="long" /> : value;
};

export interface ChildPreviewProps {
  childData: ExtendedChildDetails;
  inline?: boolean;
}

const ChildPreview: React.FC<ChildPreviewProps> = ({childData, inline = false}) => {
  const childFields = Object.entries(FIELD_LABELS).map(
    ([key, label]: [keyof ChildDetails, MessageDescriptor]) => ({
      name: key,
      label: label,
    })
  );

  return (
    <DataList
      className={clsx('openforms-children-data-list', {
        'openforms-children-data-list--inline': inline,
      })}
      appearance="rows"
    >
      {childFields.map(({name, label}) => (
        <DataListItem key={name}>
          <DataListKey>
            <FormattedMessage {...label} />
          </DataListKey>
          <DataListValue>
            {childData[name] ? (
              formatChildData(name, childData[name])
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

export default ChildPreview;
