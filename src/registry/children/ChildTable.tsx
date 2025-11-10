import {
  SubtleButton,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Icon as UtrechtIcon,
} from '@utrecht/component-library-react';
import {FormattedDate, FormattedMessage, useIntl} from 'react-intl';

import Icon from '@/components/icons';

import './ChildTable.scss';
import type {ExtendedChildDetails} from './types';

interface ChildEditButtonProps {
  child: ExtendedChildDetails;
  editChild: () => void;
}

const ChildEditButton: React.FC<ChildEditButtonProps> = ({child, editChild}) => {
  const intl = useIntl();
  return (
    <SubtleButton
      onClick={editChild}
      aria-label={intl.formatMessage(
        {
          description: "Children component: children table 'edit child' accessible label",
          defaultMessage: 'Edit child with BSN: {bsn}',
        },
        {bsn: child.bsn}
      )}
    >
      <UtrechtIcon>
        <Icon icon="edit" />
      </UtrechtIcon>
    </SubtleButton>
  );
};

interface ChildDeleteButtonProps {
  child: ExtendedChildDetails;
  removeChild: () => void;
}

const ChildDeleteButton: React.FC<ChildDeleteButtonProps> = ({child, removeChild}) => {
  const intl = useIntl();
  return (
    <SubtleButton
      onClick={removeChild}
      hint="danger"
      aria-label={intl.formatMessage(
        {
          description: "Children component: children table 'delete child' accessible label",
          defaultMessage: 'Delete child with BSN: {bsn}',
        },
        {bsn: child.bsn}
      )}
    >
      <UtrechtIcon>
        <Icon icon="remove" />
      </UtrechtIcon>
    </SubtleButton>
  );
};

const EmptyMessage: React.FC = () => (
  <i>
    <FormattedMessage description="Emtpy field message" defaultMessage="No information provided" />
  </i>
);

export interface ChildrenTableProps {
  values: ExtendedChildDetails[];
  editChild: (child: ExtendedChildDetails | undefined) => void;
  removeChild: (childIndex: number) => void;
}

const ChildrenTable: React.FC<ChildrenTableProps> = ({values, editChild, removeChild}) => {
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
        {values.map((child, index) => (
          <TableRow key={child.__id || index}>
            <TableCell>{child.bsn || <EmptyMessage />}</TableCell>
            <TableCell>{child.firstNames || <EmptyMessage />}</TableCell>
            <TableCell>
              {child.dateOfBirth ? (
                <FormattedDate
                  value={child.dateOfBirth}
                  year="numeric"
                  day="numeric"
                  month="long"
                />
              ) : (
                <EmptyMessage />
              )}
            </TableCell>

            {Boolean('__addedManually' in child && child['__addedManually']) && (
              <TableCell>
                <ChildEditButton child={child} editChild={() => editChild(child)} />
                <ChildDeleteButton child={child} removeChild={() => removeChild(index)} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ChildrenTable;
