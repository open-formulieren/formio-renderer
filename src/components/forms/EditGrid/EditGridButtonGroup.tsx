import {ButtonGroup} from '@utrecht/button-group-react';

export interface EditGridButtonGroupProps {
  children: React.ReactNode;
}

const EditGridButtonGroup: React.FC<EditGridButtonGroupProps> = ({children}) => (
  <ButtonGroup className="utrecht-button-group--openforms-editgrid">{children}</ButtonGroup>
);

export default EditGridButtonGroup;
