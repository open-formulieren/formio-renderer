import {
  SubtleButton,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Checkbox as UtrechtCheckbox,
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
  enableSelection?: boolean;
  editChild: (child: ExtendedChildDetails | undefined) => void;
  removeChild: (childIndex: number) => void;
  selectChild: (childIndex: number, child: ExtendedChildDetails) => void;
}

const ChildrenTable: React.FC<ChildrenTableProps> = ({
  values,
  enableSelection,
  editChild,
  removeChild,
  selectChild,
}) => {
  const intl = useIntl();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {enableSelection && <TableHeaderCell scope="col" />}
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
            {enableSelection && (
              <TableCell>
                <UtrechtCheckbox
                  name="selected"
                  aria-label={intl.formatMessage(
                    {
                      description: "Children component: child 'selected' aria label",
                      defaultMessage: '{firstname} should be included in the form submission',
                    },
                    {
                      firstname: child.firstNames,
                    }
                  )}
                  checked={child.selected}
                  onClick={() => selectChild(index, child)}
                />
              </TableCell>
            )}

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
