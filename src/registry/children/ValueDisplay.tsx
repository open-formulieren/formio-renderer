import type {ChildrenComponentSchema} from '@open-formulieren/types';
import {
  DataList,
  DataListItem,
  DataListKey,
  DataListValue,
  OrderedList,
  OrderedListItem,
} from '@utrecht/component-library-react';
import {FormattedDate, FormattedMessage} from 'react-intl';

import './ValueDisplay.scss';
import {FIELD_LABELS} from './subFields';
import type {ExtendedChildDetails} from './types';

export interface ValueDisplayProps {
  componentDefinition: ChildrenComponentSchema;
  value: ExtendedChildDetails[];
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({
  componentDefinition: {enableSelection},
  value,
}) => {
  if (!value || !value.length) return '';
  let children = value;

  // If selection is enabled, only show selected children
  if (enableSelection) {
    children = children.filter(child => child.selected);
  }
  if (!children.length) return '';

  return (
    <OrderedList>
      {children.map((child, index) => (
        <OrderedListItem key={index}>
          <DataList appearance="rows">
            <DataListItem>
              <DataListKey>
                <FormattedMessage {...FIELD_LABELS.bsn} />
              </DataListKey>
              <DataListValue>
                {child.bsn || (
                  <i>
                    <FormattedMessage
                      description="Emtpy field message"
                      defaultMessage="No information provided"
                    />
                  </i>
                )}
              </DataListValue>
            </DataListItem>

            <DataListItem>
              <DataListKey>
                <FormattedMessage {...FIELD_LABELS.firstNames} />
              </DataListKey>
              <DataListValue>
                {child.firstNames || (
                  <i>
                    <FormattedMessage
                      description="Emtpy field message"
                      defaultMessage="No information provided"
                    />
                  </i>
                )}
              </DataListValue>
            </DataListItem>

            <DataListItem>
              <DataListKey>
                <FormattedMessage {...FIELD_LABELS.dateOfBirth} />
              </DataListKey>
              <DataListValue>
                {child.dateOfBirth ? (
                  <FormattedDate
                    value={child.dateOfBirth}
                    year="numeric"
                    day="numeric"
                    month="long"
                  />
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
          </DataList>
        </OrderedListItem>
      ))}
    </OrderedList>
  );
};

export default ValueDisplay;
