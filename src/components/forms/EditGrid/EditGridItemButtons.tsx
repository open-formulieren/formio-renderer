import {useFormikContext} from 'formik';
import {FormattedMessage} from 'react-intl';

import {PrimaryActionButton} from '@/components/Button';

import EditGridButtonGroup from './EditGridButtonGroup';

export interface SaveButtonProps {
  label?: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  // accessibility
  ['aria-describedby']: string | undefined;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  label,
  onClick,
  ['aria-describedby']: ariaDescribedBy,
}) => (
  <PrimaryActionButton type="button" onClick={onClick} aria-describedby={ariaDescribedBy}>
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
  // accessibility
  ['aria-describedby']: string | undefined;
}

const RemoveButton: React.FC<RemoveButtonProps> = ({
  label,
  onClick,
  ['aria-describedby']: ariaDescribedBy,
}) => (
  <PrimaryActionButton hint="danger" onClick={onClick} aria-describedby={ariaDescribedBy}>
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
  // Cancelling
  cancelLabel?: React.ReactNode;
  onCancel: (e: React.MouseEvent<HTMLButtonElement>) => void;
  // accessibility
  ['aria-describedby']: string | undefined;
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
  cancelLabel,
  onCancel,
  ['aria-describedby']: ariaDescribedBy,
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
        aria-describedby={ariaDescribedBy}
      />

      <PrimaryActionButton hint="danger" onClick={onCancel} aria-describedby={ariaDescribedBy}>
        {cancelLabel || (
          <FormattedMessage
            // yes, this description looks off, but that's actually the formio.js meaning
            // even though the actual behaviour is 'cancel' and not remove (unless it's
            // a freshly added item)
            description="Edit grid item default remove button label"
            defaultMessage="Cancel"
          />
        )}
      </PrimaryActionButton>
    </EditGridButtonGroup>
  );
};

export {SaveButton, RemoveButton, IsolationModeButtons};
