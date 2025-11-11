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

import BareCheckbox from './BareCheckbox';
import './ChildrenTable.scss';
import type {ExtendedChildDetails} from './types';

interface ChildEditButtonProps {
  child: ExtendedChildDetails;
  onEditChild: () => void;
}

const ChildEditButton: React.FC<ChildEditButtonProps> = ({child, onEditChild}) => {
  const intl = useIntl();
  return (
    <SubtleButton
      onClick={onEditChild}
      aria-label={intl.formatMessage(
        {
          description: "Children component: children table 'edit child' accessible label",
          defaultMessage: `{hasFirstNames, select,
            true {Edit child with firstname: {firstNames}}
            other {Edit child with BSN: {bsn}}}`,
        },
        {
          hasFirstNames: !!child.firstNames,
          firstNames: child.firstNames,
          bsn: child.bsn,
        }
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
  onRemoveChild: () => void;
}

const ChildDeleteButton: React.FC<ChildDeleteButtonProps> = ({child, onRemoveChild}) => {
  const intl = useIntl();
  return (
    <SubtleButton
      onClick={onRemoveChild}
      hint="danger"
      aria-label={intl.formatMessage(
        {
          description: "Children component: children table 'delete child' accessible label",
          defaultMessage: `{hasFirstNames, select,
            true {Delete child with firstname: {firstNames}}
            other {Delete child with BSN: {bsn}}}`,
        },
        {
          hasFirstNames: !!child.firstNames,
          firstNames: child.firstNames,
          bsn: child.bsn,
        }
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
  name: string;
  values: ExtendedChildDetails[];
  enableSelection?: boolean;
  editChild: (child: ExtendedChildDetails | undefined) => void;
  removeChild: (childIndex: number) => void;
}

const ChildrenTable: React.FC<ChildrenTableProps> = ({
  name,
  values,
  enableSelection,
  editChild,
  removeChild,
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
                <BareCheckbox
                  name={`${name}.${index}.selected`}
                  aria-label={intl.formatMessage(
                    {
                      description: "Children component: child 'selected' aria label",
                      defaultMessage: 'Include {firstname}?',
                    },
                    {
                      firstname: child.firstNames,
                    }
                  )}
                  onChange={() => {}}
                />
              </TableCell>
            )}

            <TableCell>{child.bsn || <EmptyMessage />}</TableCell>
            <TableCell>{child.firstNames || <EmptyMessage />}</TableCell>
            <TableCell>
              {child.dateOfBirth ? (
                <FormattedDate value={child.dateOfBirth} dateStyle="long" />
              ) : (
                <EmptyMessage />
              )}
            </TableCell>

            {Boolean('__addedManually' in child && child['__addedManually']) && (
              <TableCell>
                <ChildEditButton child={child} onEditChild={() => editChild(child)} />
                <ChildDeleteButton child={child} onRemoveChild={() => removeChild(index)} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ChildrenTable;
