import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@utrecht/component-library-react';
import {FormattedDate, FormattedMessage} from 'react-intl';

import './ChildrenTable.scss';
import type {ExtendedChildDetails} from './types';

export interface ChildrenTableProps {
  values: ExtendedChildDetails[];
}

const ChildrenTable: React.FC<ChildrenTableProps> = ({values}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell scope="col">
            <FormattedMessage
              description="Children component: children table 'bsn' header"
              defaultMessage="BSN"
            />
          </TableHeaderCell>
          <TableHeaderCell scope="col">
            <FormattedMessage
              description="Children component: children table 'firstNames' header"
              defaultMessage="First names"
            />
          </TableHeaderCell>
          <TableHeaderCell scope="col">
            <FormattedMessage
              description="Children component: children table 'dateOfBirth' header"
              defaultMessage="Date of birth"
            />
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {values.map(child => (
          <TableRow key={child.bsn}>
            <TableCell>
              {child.bsn || (
                <i>
                  <FormattedMessage
                    description="Emtpy field message"
                    defaultMessage="No information provided"
                  />
                </i>
              )}
            </TableCell>
            <TableCell>
              {child.firstNames || (
                <i>
                  <FormattedMessage
                    description="Emtpy field message"
                    defaultMessage="No information provided"
                  />
                </i>
              )}
            </TableCell>
            <TableCell>
              {child.dateOfBirth ? (
                <FormattedDate value={child.dateOfBirth} dateStyle="long" />
              ) : (
                <i>
                  <FormattedMessage
                    description="Emtpy field message"
                    defaultMessage="No information provided"
                  />
                </i>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ChildrenTable;
