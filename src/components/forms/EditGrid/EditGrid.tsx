import {ButtonGroup} from '@utrecht/button-group-react';
import {PrimaryActionButton} from '@utrecht/component-library-react';
import {FormField} from '@utrecht/component-library-react';
import {FieldArray, getIn, useFormikContext} from 'formik';
import {useState} from 'react';
import {FormattedMessage} from 'react-intl';
import type {z} from 'zod';

import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
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
   * The (accessible) label for the field - anything that can be rendered.
   */
  label: React.ReactNode;
  /**
   * Required fields get additional markup/styling to indicate this validation requirement.
   */
  isRequired?: boolean;
  /**
   * Additional description displayed close to the field - use this to document any
   * validation requirements that are crucial to successfully submit the form. More
   * information that is contextual/background typically belongs in a tooltip.
   */
  description?: React.ReactNode;
  /**
   * Callback to return the heading for a single item. Gets passed the item values and
   * index in the array of values.
   */
  getItemHeading?: (values: T, index: number) => React.ReactNode;
  /**
   * Callback to check if a particular item can be removed. This allows decisions on a
   * per-item basis. If not provided, item removal is enabled by default.
   */
  canRemoveItem?: (values: T, index: number) => boolean;
  /**
   * Custom label for the remove button.
   */
  removeItemLabel?: string;
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

interface WithoutIsolation<T> {
  enableIsolation?: false;
  canEditItem?: never;
  saveItemLabel?: never;
  /**
   * Callback to render the main content of a single item. Gets passed the item values and
   * index in the array of values.
   *
   * When editing inline (so *not* in isolation mode), `opts.expanded` will always be `false`.`
   */
  getItemBody: (values: T, index: number, opts: {expanded: false}) => React.ReactNode;
  getItemValidationSchema?: never;
}

interface WithIsolation<T> {
  enableIsolation: true;
  /**
   * Callback to check if a particular item can be edited. This allows decisions on a
   * per-item basis. If not provided, item editing is enabled by default.
   */
  canEditItem?: (values: T, index: number) => boolean;
  /**
   * Custom label for the save/confirm button.
   */
  saveItemLabel?: string;
  /**
   * Callback to render the main content of a single item. Gets passed the item values and
   * index in the array of values.
   *
   * When editing inline (so *not* in isolation mode), `opts.expanded` will always be `false`.`
   */
  getItemBody: (values: T, index: number, opts: {expanded: boolean}) => React.ReactNode;
  /**
   * Callback to obtain a Zod validation schema for client-side validation of the item.
   * Gets passed the item index in the array of values. Return `undefined` to indicate
   * no validation schema should be applied.
   */
  getItemValidationSchema?: (index: number) => z.ZodType<T>;
}

export type EditGridProps<T> = EditGridBaseProps<T> & (WithoutIsolation<T> | WithIsolation<T>);

function EditGrid<T extends {[K in keyof T]: JSONValue} = JSONObject>({
  name,
  label,
  isRequired,
  description,
  getItemHeading,
  canRemoveItem,
  removeItemLabel = '',
  emptyItem = null,
  addButtonLabel = '',
  ...props
}: EditGridProps<T>) {
  const {getFieldProps, errors, getFieldHelpers} = useFormikContext();
  const {value: formikItems} = getFieldProps<T[]>(name);
  const [indexToAutoExpand, setIndexToAutoExpand] = useState<number | null>(null);
  return (
    <FormField type="editgrid" className="utrecht-form-field--openforms">
      {label && <Label isRequired={isRequired}>{label}</Label>}
      <FieldArray name={name} validateOnChange={false}>
        {arrayHelpers => (
          <div className="openforms-editgrid">
            {/* Render each item wrapped in an EditGridItem */}
            <ol className="openforms-editgrid__container">
              {formikItems.map((values, index) =>
                props.enableIsolation ? (
                  <EditGridItem<T>
                    key={index}
                    index={index}
                    heading={getItemHeading?.(values, index)}
                    getBody={opts => props.getItemBody(values, index, opts)}
                    enableIsolation
                    data={values}
                    canEdit={props.canEditItem?.(values, index) ?? true}
                    validationSchema={props.getItemValidationSchema?.(index)}
                    errors={getIn(errors, `${name}.${index}`)}
                    saveLabel={props.saveItemLabel}
                    onChange={(newValue: T) => {
                      arrayHelpers.replace(index, newValue);
                      // clear any (initial) errors for this item - since this callback
                      // is invoked, it implies that the schema validation passed. Any
                      // external (backend) errors will require re-validation of the whole
                      // form by the backend, so we can safely clear those backend errors.
                      const {setError} = getFieldHelpers(`${name}.${index}`);
                      setError(undefined);
                    }}
                    canRemove={canRemoveItem?.(values, index) ?? true}
                    removeLabel={removeItemLabel}
                    onRemove={() => arrayHelpers.remove(index)}
                    initiallyExpanded={indexToAutoExpand === index}
                  />
                ) : (
                  <EditGridItem<T>
                    key={index}
                    index={index}
                    getBody={opts => props.getItemBody(values, index, opts)}
                    heading={getItemHeading?.(values, index)}
                    canRemove={canRemoveItem?.(values, index) ?? true}
                    removeLabel={removeItemLabel}
                    onRemove={() => arrayHelpers.remove(index)}
                  />
                )
              )}
            </ol>

            {emptyItem && (
              <ButtonGroup>
                <PrimaryActionButton
                  type="button"
                  onClick={() => {
                    setIndexToAutoExpand(formikItems.length);
                    arrayHelpers.push(emptyItem);
                  }}
                >
                  <Icon icon="add" />
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
      <HelpText>{description}</HelpText>
    </FormField>
  );
}

export default EditGrid;
