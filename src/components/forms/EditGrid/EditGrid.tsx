import {ButtonGroup} from '@utrecht/button-group-react';
import {FormField} from '@utrecht/component-library-react';
import {FieldArray, getIn, setIn, useFormikContext} from 'formik';
import type {FormikErrors} from 'formik';
import {useId, useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import type {ValidationError} from 'zod-formik-adapter';

import {SecondaryActionButton} from '@/components/Button';
import FieldConfigProvider from '@/components/FieldConfigProvider';
import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import Icon from '@/components/icons';
import {useFieldConfig} from '@/hooks';
import type {JSONObject, JSONValue} from '@/types';

import EditGridItem from './EditGridItem';
import {ITEM_ADDED_MARKER, ITEM_EXPANDED_MARKER} from './constants';
import type {MarkedEditGridItem} from './types';

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
   * Optional tooltip to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  tooltip?: React.ReactNode;
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
  validate?: never;
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
  getItemBody: (
    values: MarkedEditGridItem<T>,
    index: number,
    opts: {expanded: boolean}
  ) => React.ReactNode;
  /**
   * Callback to validate a single item. It receives the item index and the item values.
   *
   * Must throw zod-formik-adapter's `ValidationError` for invalid data.
   */
  validate?: (index: number, values: T) => Promise<void>;
}

export type EditGridProps<T> = EditGridBaseProps<T> & (WithoutIsolation<T> | WithIsolation<T>);

function EditGrid<T extends {[K in keyof T]: JSONValue} = JSONObject>({
  name,
  label,
  isRequired,
  description,
  tooltip,
  getItemHeading,
  canRemoveItem,
  removeItemLabel = '',
  emptyItem = null,
  addButtonLabel = '',
  ...props
}: EditGridProps<T>) {
  name = useFieldConfig(name);
  const {getFieldProps, errors, getFieldHelpers} = useFormikContext();
  const {value: formikItems} = getFieldProps<T[] | undefined>(name);
  const id = useId();
  const labelId = label ? `${id}-label` : undefined;

  const error: string | (FormikErrors<T> | undefined)[] = getIn(errors, name);
  const fieldError = typeof error === 'string' && error;
  const hasFieldLevelError = !!fieldError;
  const errorMessageId = hasFieldLevelError ? `${id}-error-message` : undefined;

  return (
    <FormField
      type="editgrid"
      className="utrecht-form-field--openforms"
      invalid={hasFieldLevelError}
    >
      {label && (
        <Label
          labelId={labelId}
          isRequired={isRequired}
          tooltip={tooltip ? <Tooltip>{tooltip}</Tooltip> : undefined}
          noLabelTag
        >
          {label}
        </Label>
      )}

      <FieldArray name={name} validateOnChange={false}>
        {arrayHelpers => (
          <div className="openforms-editgrid">
            {/* Render each item wrapped in an EditGridItem */}
            <ol
              className="openforms-editgrid__container"
              aria-labelledby={labelId}
              aria-describedby={errorMessageId}
            >
              {formikItems?.map((values, index) => {
                if (!props.enableIsolation) {
                  return (
                    <EditGridItem<T>
                      key={index}
                      index={index}
                      getBody={opts => props.getItemBody(values, index, opts)}
                      heading={getItemHeading?.(values, index)}
                      canRemove={canRemoveItem?.(values, index) ?? true}
                      removeLabel={removeItemLabel}
                      onRemove={() => arrayHelpers.remove(index)}
                    />
                  );
                }

                // complex case - if isolation needs to be enabled, set up a proper
                // formik *and* browser namespace by applying prefixes to the data/name
                // attributes.
                return (
                  <IsolatedEditGridItem<T>
                    key={index}
                    name={name}
                    index={index}
                    values={values}
                    errors={hasFieldLevelError ? undefined : getIn(errors, `${name}.${index}`)}
                    getItemHeading={getItemHeading}
                    getItemBody={props.getItemBody}
                    canEditItem={props.canEditItem}
                    saveItemLabel={props.saveItemLabel}
                    onChange={(newValue: T) => {
                      arrayHelpers.replace(index, newValue);
                      // clear any (initial) errors for this item - since this callback
                      // is invoked, it implies that the schema validation passed. Any
                      // external (backend) errors will require re-validation of the whole
                      // form by the backend, so we can safely clear those backend errors.
                      if (!hasFieldLevelError) {
                        const {setError} = getFieldHelpers(`${name}.${index}`);
                        setError(undefined);
                      }
                    }}
                    canRemoveItem={canRemoveItem}
                    removeItemLabel={removeItemLabel}
                    onRemove={() => arrayHelpers.remove(index)}
                    validate={props.validate}
                  />
                );
              })}
            </ol>

            {emptyItem && (
              <ButtonGroup>
                <SecondaryActionButton
                  type="button"
                  onClick={() => {
                    // add the markers to the new item
                    const newItem: MarkedEditGridItem<T> = {
                      ...emptyItem,
                      [ITEM_EXPANDED_MARKER]: true,
                      [ITEM_ADDED_MARKER]: true,
                    };
                    arrayHelpers.push(newItem);
                  }}
                >
                  <Icon icon="add" />
                  {addButtonLabel || (
                    <FormattedMessage
                      description="Edit grid add button, default label text"
                      defaultMessage="Add another"
                    />
                  )}
                </SecondaryActionButton>
              </ButtonGroup>
            )}
          </div>
        )}
      </FieldArray>
      <HelpText>{description}</HelpText>
      {hasFieldLevelError && errorMessageId && (
        <ValidationErrors error={error} id={errorMessageId} />
      )}
    </FormField>
  );
}

const isValidationError = (err: unknown): err is ValidationError => {
  // instanceof ValidationError doesn't work because the prototype chain
  // is not fully copied, may be due to zod-formik-adapter transpilation targets
  if (typeof err !== 'object') return false;
  if (!err || !('name' in err)) return false;
  return err?.name === 'ValidationError';
};

/**
 * The intrinsic item data is of type `T`, but due to name prefixing/data-namespacing,
 * this data actually sits somewhere in an object key-value tree of arbitrary depth.
 *
 * Each level of namespacing increments the depth in the tree. The `WrappedItemData`
 * models this shape.
 */
type WrappedItemData<T extends {[K in keyof T]: JSONValue} = JSONObject> = {
  [k: string]: T | WrappedItemData<T>;
};

type IsolatedEditGridItemProps<T> = {
  /**
   * Name of 'form field' in the Formio form data structure. The rendered edit grid items
   * are based off the value of this field.
   */
  name: string;
  /**
   * Index of the item being edited.
   */
  index: number;
  /**
   * Values of the single item at `index`.
   */
  values: T;
  /**
   * (Initial) errors for the item.
   *
   * There may be:
   * - no errors at all
   * - a string error, which is an error for the item as a whole
   * - a nested object of errors, with errors for the nested fields of the item
   */
  errors: FormikErrors<T> | string | undefined;
  onChange: (newValue: T) => void;
  onRemove: () => void;
} & Pick<EditGridProps<T>, 'getItemHeading' | 'canRemoveItem' | 'removeItemLabel'> &
  Pick<WithIsolation<T>, 'canEditItem' | 'saveItemLabel' | 'getItemBody' | 'validate'>;

function IsolatedEditGridItem<T extends {[K in keyof T]: JSONValue} = JSONObject>({
  name,
  index,
  values,
  errors,
  getItemHeading,
  getItemBody,
  canEditItem,
  saveItemLabel,
  onChange,
  onRemove,
  canRemoveItem,
  removeItemLabel = '',
  validate: validateCallback,
}: IsolatedEditGridItemProps<T>) {
  const isEditable = canEditItem?.(values, index) ?? true;

  // complex case - if isolation needs to be enabled, set up a proper
  // formik *and* browser namespace by applying prefixes to the data/name
  // attributes.
  // Only if the item is editable, we need to use the namePrefix X:Y notation.
  // For non-editable items, we don't render a scoped formik form, so X:Y won't be
  // available. In this case we should use the globally available namePrefix X.Y
  const namePrefix = isEditable ? `${name}:${index}` : `${name}.${index}`;
  const prefixedData: WrappedItemData<T> = useMemo(() => {
    return setIn({}, namePrefix, values);
  }, [namePrefix, values]);

  // don't pass down the entire error state, but extract only the errors
  // for this particular item. it's important that 'undefined' is returned
  // if there are no 'outside' errors.
  const prefixedErrors: FormikErrors<WrappedItemData<T>> | undefined =
    errors && typeof errors === 'object' ? setIn({}, namePrefix, errors) : undefined;

  let validate: ((values: WrappedItemData<T>) => Promise<void>) | undefined = undefined;
  if (validateCallback) {
    validate = async (values: WrappedItemData<T>): Promise<void> => {
      // extract only the item values from the namespaced data and pass it
      // to the validation callback, but make sure to put errors back in their
      // appropriate namespace
      const itemValues: T = getIn(values, namePrefix);

      try {
        await validateCallback(index, itemValues);
      } catch (err: unknown) {
        // only handle errors we know
        if (!isValidationError(err)) throw err;
        err.inner.forEach(problem => {
          problem.path = `${namePrefix}.${problem.path}`;
        });
        throw err;
      }
    };
  }

  return (
    <FieldConfigProvider key={index} namePrefix={namePrefix}>
      <EditGridItem<WrappedItemData<T>>
        index={index}
        heading={getItemHeading?.(values, index)}
        getBody={opts => getItemBody(values, index, opts)}
        enableIsolation
        data={prefixedData}
        canEdit={isEditable}
        validate={validate}
        errors={prefixedErrors}
        itemError={typeof errors === 'string' ? errors : undefined}
        saveLabel={saveItemLabel}
        onChange={(newValue: WrappedItemData<T>) => {
          const itemValue: T = getIn(newValue, namePrefix);
          onChange(itemValue);
        }}
        canRemove={canRemoveItem?.(values, index) ?? true}
        removeLabel={removeItemLabel}
        onRemove={onRemove}
      />
    </FieldConfigProvider>
  );
}

export default EditGrid;
