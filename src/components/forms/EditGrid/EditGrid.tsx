import {ButtonGroup, PrimaryActionButton} from '@utrecht/component-library-react';
import {ArrayHelpers, FieldArray, useFormikContext} from 'formik';
import {FormattedMessage} from 'react-intl';

import Icon from '@/components/icons';
import type {JSONObject, JSONValue} from '@/types';

import EditGridItem from './EditGridItem';

/**
 * A single item to display inside the EditGridItem container. It's the actual data
 * contained in the editgrid value.
 */
export interface Item {
  children: React.ReactNode;
  heading?: React.ReactNode;
  canRemove?: boolean;
}

export interface ItemWithIsolation extends Item {
  canEdit?: boolean;
}

export interface EditGridBaseProps<T> {
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

interface WithoutIsolation {
  enableIsolation?: false;
  items: Item[];
}

interface WithIsolation {
  enableIsolation: true;
  items: ItemWithIsolation[];
}

export type EditGridProps<T> = EditGridBaseProps<T> & (WithoutIsolation | WithIsolation);

function EditGrid<T extends {[K in keyof T]: JSONValue} = JSONObject>({
  name,
  emptyItem = null,
  addButtonLabel = '',
  ...props
}: EditGridProps<T>) {
  return (
    <FieldArray name={name} validateOnChange={false}>
      {arrayHelpers => (
        <div className="openforms-editgrid">
          {/* Render each item wrapped in an EditGridItem */}
          <div>
            {props.enableIsolation ? (
              <IsolationModeItems<T> name={name} items={props.items} arrayHelpers={arrayHelpers} />
            ) : (
              <InlineModeItems<T> items={props.items} arrayHelpers={arrayHelpers} />
            )}
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

type InlineModeItemsProps<T> = Pick<WithoutIsolation, 'items'> & {
  arrayHelpers: ArrayHelpers<T[]>;
};

function InlineModeItems<T extends JSONObject = JSONObject>({
  items,
  arrayHelpers,
}: InlineModeItemsProps<T>) {
  return (
    <>
      {items.map(({children: content, heading, canRemove}, index) => (
        <EditGridItem<T>
          key={index}
          heading={heading}
          canRemove={canRemove}
          onRemove={() => arrayHelpers.remove(index)}
        >
          {content}
        </EditGridItem>
      ))}
    </>
  );
}

type IsolationModeItemsProps<T> = Pick<WithIsolation, 'items'> & {
  /**
   * Name of 'form field' in the Formio form data structure.
   */
  name: string;
  arrayHelpers: ArrayHelpers<T[]>;
};

/**
 * Render the items when isolation mode is enabled.
 */
function IsolationModeItems<T extends JSONObject = JSONObject>({
  name,
  items,
  arrayHelpers,
}: IsolationModeItemsProps<T>) {
  const {getFieldProps} = useFormikContext();
  const {value: formikItems} = getFieldProps<T[]>(name);
  return (
    <>
      {items.map(({children: content, heading, canEdit, canRemove}, index) => (
        <EditGridItem<T>
          key={index}
          heading={heading}
          enableIsolation
          data={formikItems[index]}
          canEdit={canEdit}
          canRemove={canRemove}
          onRemove={() => arrayHelpers.remove(index)}
          onReplace={(newValue: T) => arrayHelpers.replace(index, newValue)}
        >
          {content}
        </EditGridItem>
      ))}
    </>
  );
}

export default EditGrid;
