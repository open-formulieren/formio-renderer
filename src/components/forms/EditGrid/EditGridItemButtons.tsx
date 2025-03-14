import {PrimaryActionButton} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';
import {FormattedMessage} from 'react-intl';

import EditGridButtonGroup from './EditGridButtonGroup';

export interface SaveButtonProps {
  label?: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({label, onClick}) => (
  <PrimaryActionButton type="button" onClick={onClick}>
    {label || (
      <FormattedMessage
        description="Edit grid item default save button label"
        defaultMessage="Save"
      />
    )}
  </PrimaryActionButton>
);

export interface RemoveButtonProps {
  label?: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const RemoveButton: React.FC<RemoveButtonProps> = ({label, onClick}) => (
  <PrimaryActionButton hint="danger" onClick={onClick}>
    {label || (
      <FormattedMessage
        description="Edit grid item default remove button label"
        defaultMessage="Remove"
      />
    )}
  </PrimaryActionButton>
);

export interface IsolationModeButtonsProps {
  // Saving
  saveLabel?: React.ReactNode;
  // Removing
  canRemove: boolean;
  removeLabel?: React.ReactNode;
  onRemove: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Button row rendered when an edit grid item is in isolation & editing mode.
 *
 * Isolation mode guarantees us that a formik context is available _for the inner item_.
 * Likely there's also a Formik context for the entire form as a whole, but that's the
 * wrong one.
 *
 * The `canEdit` is not relevant here anymore - this component shouldn't be rendered
 * in the first place if editing is not enable (as it doesn't allow toggling) into
 * edit state.
 */
const IsolationModeButtons: React.FC<IsolationModeButtonsProps> = ({
  saveLabel,
  canRemove,
  removeLabel,
  onRemove,
}) => {
  const {submitForm} = useFormikContext<unknown>();
  return (
    <EditGridButtonGroup>
      <SaveButton
        label={saveLabel}
        onClick={async e => {
          e.preventDefault();
          await submitForm();
        }}
      />
      {canRemove && <RemoveButton label={removeLabel} onClick={onRemove} />}
    </EditGridButtonGroup>
  );
};

export {SaveButton, RemoveButton, IsolationModeButtons};
