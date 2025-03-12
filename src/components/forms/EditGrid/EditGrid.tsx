import {ButtonGroup, PrimaryActionButton} from '@utrecht/component-library-react';
import {FieldArray} from 'formik';
import {FormattedMessage} from 'react-intl';

import Icon from '@/components/icons';
import type {JSONObject} from '@/types';

import EditGridItem from './EditGridItem';

/**
 * A single item to display inside the EditGridItem container. It's the actual data
 * contained in the editgrid value.
 */
export interface Item {
  children: React.ReactNode;
  heading?: React.ReactNode;
  canEdit?: boolean;
  canRemove?: boolean;
}

export interface EditGridProps<T> {
  /**
   * Name of 'form field' in the Formio form data structure.
   */
  name: string;
  /**
   * Individual items, corresponding to the data in the array pointed to via `name`.
   */
  items: Item[];
  /**
   * Empty instance, will be added when the 'add another' button is clicked. If none is
   * provided, adding items is not enabled.
   */
  emptyItem?: T | null;
  /**
   * Custom label for the 'add another' button.
   */
  addButtonLabel?: string;
}

function EditGrid<T extends JSONObject = JSONObject>({
  name,
  items,
  emptyItem = null,
  addButtonLabel = '',
}: EditGridProps<T>) {
  return (
    <FieldArray name={name} validateOnChange={false}>
      {arrayHelpers => (
        <div className="openforms-editgrid">
          {/* Render each item wrapped in an EditGridItem */}
          <div>
            {items.map(({children: content, heading, canEdit, canRemove}, index) => (
              <EditGridItem<T>
                key={index}
                heading={heading}
                canEdit={canEdit}
                canRemove={canRemove}
                onRemove={() => arrayHelpers.remove(index)}
                onReplace={(newValue: T) => arrayHelpers.replace(index, newValue)}
              >
                {content}
              </EditGridItem>
            ))}
          </div>

          {emptyItem && (
            <ButtonGroup>
              <PrimaryActionButton type="button" onClick={() => arrayHelpers.push(emptyItem)}>
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
      )}
    </FieldArray>
  );
}

export default EditGrid;
