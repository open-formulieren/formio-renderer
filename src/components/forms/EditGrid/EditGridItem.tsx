import {Fieldset, FieldsetLegend} from '@utrecht/component-library-react';
import {PrimaryActionButton} from '@utrecht/component-library-react';
import {FormattedMessage} from 'react-intl';

import type {JSONObject} from '@/types';

import EditGridButtonGroup from './EditGridButtonGroup';

export interface EditGridItemProps<T> {
  /**
   * Body of the item, such as the form fields to edit or the read-only preview of the
   * item.
   */
  children: React.ReactNode;
  /**
   * Heading for the item, will be rendered as a fieldset legend unless no value is
   * provided.
   */
  heading?: React.ReactNode;

  /**
   * If true, edit control button(s) are rendered.
   */
  canEdit?: boolean;
  /**
   * Custom label for the save/confirm button.
   */
  saveLabel?: string;
  /**
   * Callback invoked when confirming the item changes.
   */
  onReplace: (newValue: T) => void;

  /**
   * If true, remove button(s) are rendered.
   */
  canRemove?: boolean;
  /**
   * Custom label for the remove button.
   */
  removeLabel?: string;
  /**
   * Callback invoked when deleting the item.
   */
  onRemove: () => void;
}

// TODO: track open/collapsed state and adapt the buttons accordingly

function EditGridItem<T extends JSONObject = JSONObject>({
  children,
  heading,
  canEdit,
  saveLabel,
  onReplace,
  canRemove,
  removeLabel,
  onRemove,
}: EditGridItemProps<T>) {
  return (
    <Fieldset className="openforms-editgrid__item">
      {heading && (
        <FieldsetLegend className="openforms-editgrid__item-heading">{heading}</FieldsetLegend>
      )}

      {children}

      {(canEdit || canRemove) && (
        <EditGridButtonGroup>
          {canEdit && (
            <PrimaryActionButton type="button" onClick={() => onReplace('TODO')}>
              {saveLabel || (
                <FormattedMessage
                  description="Edit grid item default save button label"
                  defaultMessage="Save"
                />
              )}
            </PrimaryActionButton>
          )}
          {canRemove && (
            <PrimaryActionButton hint="danger" onClick={onRemove}>
              {removeLabel || (
                <FormattedMessage
                  description="Edit grid item default remove button label"
                  defaultMessage="Remove"
                />
              )}
            </PrimaryActionButton>
          )}
        </EditGridButtonGroup>
      )}
    </Fieldset>
  );
}

export default EditGridItem;
