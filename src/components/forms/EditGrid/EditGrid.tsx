import {ButtonGroup, PrimaryActionButton} from '@utrecht/component-library-react';
import {FieldArray, useFormikContext} from 'formik';
import {FormattedMessage} from 'react-intl';

import Icon from '@/components/icons';
import type {JSONObject, JSONValue} from '@/types';

import EditGridItem from './EditGridItem';

interface EditGridBaseProps<T> {
  /**
   * Name of 'form field' in the Formio form data structure. The rendered edit grid items
   * are based off the value of this field.
   */
  name: string;
  /**
   * Callback to return the heading for a single item. Gets passed the item values and
   * index in the array of values.
   */
  getItemHeading?: (values: T, index: number) => React.ReactNode;
  /**
   * Callback to render the main content of a single item. Gets passed the item values and
   * index in the array of values.
   */
  getItemBody: (values: T, index: number) => React.ReactNode;
  /**
   * Callback to check if a particular item can be removed. This allows decisions on a
   * per-item basis. If not provided, item removal is enabled by default.
   */
  canRemoveItem?: (values: T, index: number) => boolean;
  /**
   * Empty instance, will be added when the 'add another' button is clicked. If `null` is
   * provided, adding items is disabled.
   */
  emptyItem?: T | null;
  /**
   * Custom label for the 'add another' button.
   */
  addButtonLabel?: string;
}

interface WithoutIsolation {
  enableIsolation?: false;
  canEditItem?: never;
}

interface WithIsolation<T> {
  enableIsolation: true;
  /**
   * Callback to check if a particular item can be edited. This allows decisions on a
   * per-item basis. If not provided, item editing is enabled by default.
   */
  canEditItem?: (values: T, index: number) => boolean;
}

export type EditGridProps<T> = EditGridBaseProps<T> & (WithoutIsolation | WithIsolation<T>);

function EditGrid<T extends {[K in keyof T]: JSONValue} = JSONObject>({
  name,
  getItemHeading,
  getItemBody,
  canRemoveItem,
  emptyItem = null,
  addButtonLabel = '',
  ...props
}: EditGridProps<T>) {
  const {getFieldProps} = useFormikContext();
  const {value: formikItems} = getFieldProps<T[]>(name);

  console.log(formikItems);

  return (
    <FieldArray name={name} validateOnChange={false}>
      {arrayHelpers => (
        <div className="openforms-editgrid">
          {/* Render each item wrapped in an EditGridItem */}
          <div>
            {formikItems.map((values, index) =>
              props.enableIsolation ? (
                <EditGridItem<T>
                  key={index}
                  index={index}
                  heading={getItemHeading?.(values, index)}
                  enableIsolation
                  data={values}
                  canEdit={props.canEditItem?.(values, index) ?? true}
                  onReplace={(newValue: T) => arrayHelpers.replace(index, newValue)}
                  canRemove={canRemoveItem?.(values, index) ?? true}
                  onRemove={() => arrayHelpers.remove(index)}
                >
                  {getItemBody(values, index)}
                </EditGridItem>
              ) : (
                <EditGridItem<T>
                  key={index}
                  index={index}
                  heading={getItemHeading?.(values, index)}
                  canRemove={canRemoveItem?.(values, index) ?? true}
                  onRemove={() => arrayHelpers.remove(index)}
                >
                  {getItemBody(values, index)}
                </EditGridItem>
              )
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

export default EditGrid;
