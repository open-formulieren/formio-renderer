import {ButtonGroup, PrimaryActionButton} from '@utrecht/component-library-react';
import {FormattedMessage} from 'react-intl';

import Icon from '@/components/icons';

export interface EditGridProps {
  children: React.ReactNode;
  onAddItem: (event: React.MouseEvent<HTMLButtonElement>) => void;
  addButtonLabel?: string;
}

const EditGrid: React.FC<EditGridProps> = ({children, onAddItem, addButtonLabel = ''}) => (
  <div className="openforms-editgrid">
    <div>{children}</div>

    {onAddItem && (
      <ButtonGroup>
        <PrimaryActionButton type="button" onClick={onAddItem}>
          <Icon icon="add" />
          &nbsp;
          {addButtonLabel || (
            <FormattedMessage
              description="Edit grid add button, default label text"
              defaultMessage="Add another"
            />
          )}
        </PrimaryActionButton>
      </ButtonGroup>
    )}
  </div>
);

export default EditGrid;
