import {ButtonGroup} from '@utrecht/button-group-react';
import {
  Button,
  Fieldset,
  FieldsetLegend,
  PrimaryActionButton,
  Icon as UtrechtIcon,
} from '@utrecht/component-library-react';
import {clsx} from 'clsx';
import {FieldArray, getIn, useFormikContext} from 'formik';
import {useEffect, useId, useRef} from 'react';
import {FormattedMessage} from 'react-intl';

import HelpText from '@/components/forms/HelpText';
import {LabelContent} from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import Icon from '@/components/icons';
import type {JSONObject} from '@/types';

import './MultiField.scss';

/**
 * The intrinsic value data type for a multi field. Used as input for the (homogenous)
 * Array<T> to be managed by the `FieldArray`.
 */
type MultiFieldValue = string | number | null;

export interface RenderFieldProps {
  name: string;
  index: number;
  label: React.ReactNode;
}

export interface MultiFieldProps<T extends MultiFieldValue> {
  /**
   * The name of the form field/input, used to set/track the field value in the form state.
   */
  name: string;
  /**
   * The value to use for a freshly/newly added item.
   */
  newItemValue: T;
  /**
   * Component taking `RenderFieldProps` to render an individual item/field.`
   */
  renderField: React.FC<RenderFieldProps>;
  /**
   * The (accessible) label for the field - anything that can be rendered.
   *
   * You must always provide a label to ensure the field is accessible to users of
   * assistive technologies.
   */
  label: React.ReactNode;
  /**
   * Required fields get additional markup/styling to indicate this validation requirement.
   */
  isRequired?: boolean;
  /**
   * Disabled fields get marked as such in an accessible manner.
   */
  isDisabled?: boolean;
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
   * Optional callback invoked when a new item is added that should receive auto focus.
   *
   * If provided, you receive the Formik field name of the inserted item, e.g. `myField.3`.
   * The return value must be a query selector that can be passed to `document.querySelector`,
   * resolving to an (input) element to focus.
   *
   * You *should* provide a stable reference (with `useCallback`, if needed), but we
   * have taken precautions in case you forget.
   */
  getAutoFocusQuerySelector?: (itemName: string) => string;
}

/**
 * A container for fields that support multiple values, allowing the editing, removing
 * and adding of individual values within a collection. Multifields only support arrays
 * of primitives - for complex objects, use editgrid instead.
 *
 * The outer container renders as a fieldset to indicate the fields inside belong
 * together. The label is used as fieldset legend the describe the collection of fields,
 * and each individual item also gets a (screenreader-only) label with the item index
 * appended as suffix.
 *
 * Adding an item auto-focuses the new item. On first mount/render, if there are no items
 * at all (yet) in the values state, one is added automatically, but the user can remove
 * this item again. This automatic item-insertion does not auto-focus the input.
 *
 * Validation errors (that are item-specific)
 * are displayed close to the item itself, while validation errors for the collection as
 * a whole are positioned all the way at the bottom. Any kind of validation errors styles
 * the fieldset as a whole as being invalid, rather than highlighting only the individual
 * item.
 */
function MultiField<T extends MultiFieldValue>({
  name,
  newItemValue,
  renderField,
  label,
  isRequired,
  isDisabled,
  description,
  tooltip,
  getAutoFocusQuerySelector,
}: MultiFieldProps<T>) {
  const {getFieldProps, setFieldError, getFieldMeta, touched} = useFormikContext<JSONObject>();
  const {value: formikItems} = getFieldProps<T[] | undefined>(name);

  const itemCount = formikItems?.length ?? 0;
  const containerRef = useMultiFieldEffects(
    name,
    itemCount,
    newItemValue,
    getAutoFocusQuerySelector
  );

  const id = useId();
  const descriptionid = `${id}-description`;

  const {error = ''} = getFieldMeta<T[]>(name);
  const hasAnyError =
    // type cast is necessary because Formik types don't account for the string[] type
    typeof error === 'string' ? !!error : (error as string[]).some(itemError => !!itemError);

  const itemsTouched: (boolean | undefined)[] | undefined = getIn(touched, name);
  const anyItemTouched = Object.values(itemsTouched ?? {}).some(t => !!t);
  const hasFieldLevelError = typeof error === 'string' && anyItemTouched && !!error;
  const errorMessageId = hasFieldLevelError ? `${id}-error-message` : undefined;

  return (
    <Fieldset
      className="utrecht-form-fieldset--openforms openforms-multifield-container"
      disabled={isDisabled}
      invalid={hasAnyError}
      aria-describedby={[descriptionid, errorMessageId].filter(Boolean).join(' ')}
      ref={containerRef}
    >
      <FieldsetLegend
        className={clsx({
          'utrecht-form-fieldset__legend--openforms-tooltip': !!tooltip,
        })}
      >
        <LabelContent isDisabled={isDisabled} isRequired={isRequired} noLabelTag>
          {label}
        </LabelContent>
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </FieldsetLegend>

      {/* XXX: aria-live region to announce add/remove operations? */}

      <FieldArray name={name} validateOnChange={false}>
        {arrayHelpers => (
          <>
            <ol className="openforms-multifield">
              {formikItems?.map((_, index) => (
                <li key={index} className="openforms-multifield__field">
                  {renderField({
                    name: `${name}.${index}`,
                    index,
                    label: (
                      <FormattedMessage
                        description="Multi-field individual item label at $index. The index variable here is 1-indexed."
                        defaultMessage="{label} {index}"
                        values={{label, index: index + 1}}
                      />
                    ),
                  })}
                  <span className="openforms-multifield__remove-button">
                    <Button
                      appearance="subtle-button"
                      hint="danger"
                      onClick={() => {
                        arrayHelpers.remove(index);
                        // Reset possible array-level validation error, to work around the mangled
                        // validation errors. This effectively masks the problem described in
                        // https://github.com/jaredpalmer/formik/issues/3352, it does not *solve*
                        // it. A fresh submit attempt will re-run validation.
                        setFieldError(name, undefined);
                      }}
                    >
                      <UtrechtIcon>
                        <Icon icon="remove" />
                      </UtrechtIcon>
                      <span className="sr-only">
                        <FormattedMessage
                          description="Accessible remove icon/button label for item at $index. The index variable here is 1-indexed."
                          defaultMessage="Remove ''{label} {index}'"
                          values={{label, index: index + 1}}
                        />
                      </span>
                    </Button>
                  </span>
                </li>
              ))}
            </ol>
            <ButtonGroup>
              <PrimaryActionButton type="button" onClick={() => arrayHelpers.push(newItemValue)}>
                <Icon icon="add" />
                <FormattedMessage
                  description="Multi-field add button label text"
                  defaultMessage="Add another"
                />
              </PrimaryActionButton>
            </ButtonGroup>
          </>
        )}
      </FieldArray>

      <HelpText id={descriptionid}>{description}</HelpText>
      {anyItemTouched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </Fieldset>
  );
}

MultiField.displayName = 'MultiField';

const defaultGetAutoFocusQuerySelector = (itemName: string): string => `[name="${itemName}"]`;

/**
 * Perform side-effects related to multi fields.
 *
 * - The first effect checks if an item has to be auto-inserted because the value array
 *   is completely empty. Once this is done, a marker is set to ensure this only happens
 *   once, as otherwise the user cannot remove the final item.
 * - The second effect tracks item addition - whenever a new item is added _because the
 *   user clicked the 'add item' button_, we want to autofocus the new input element so
 *   they can immediately start typing. However, we don't want this autofocus behaviour
 *   if an item was added because of the insertion effect that may have run before.
 * - The third effect takes care of the 'only-do-this-once' markers.
 *
 * Unmounting the entire component (e.g. because the field is hidden and then displayed
 * again through logic) restarts this life-cycle.
 *
 * Optionally `getAutoFocusQuerySelector` can be provided to override the query selector
 * to the input that should receive auto focus after adding an item.
 */
const useMultiFieldEffects = (
  name: string,
  itemCount: number,
  newItemValue: MultiFieldValue,
  getAutoFocusQuerySelector: (itemName: string) => string = defaultGetAutoFocusQuerySelector
): React.RefObject<HTMLDivElement> => {
  const {setFieldValue} = useFormikContext<JSONObject>();
  const containerRef = useRef<HTMLDivElement>(null);
  const getAutoFocusQuerySelectorRef = useRef(getAutoFocusQuerySelector);

  const itemCountRef = useRef<number>(itemCount);
  const autoInsert = useRef<{checked: boolean; skipFocus: boolean}>({
    checked: false,
    skipFocus: false,
  });

  // ensure that an empty field starts with at least one field to input, but only on
  // first render
  useEffect(() => {
    if (!autoInsert.current.checked && itemCount === 0) {
      setFieldValue(name, [newItemValue]);
      autoInsert.current.skipFocus = true;
    }
  }, [itemCount, setFieldValue, name, newItemValue]);

  // if a new, non-useCallback'd function is provided, prevent accidental effects from
  // running because the dependency changed even though this shouldn't.
  useEffect(() => {
    getAutoFocusQuerySelectorRef.current = getAutoFocusQuerySelector;
  }, [getAutoFocusQuerySelector]);

  // detect if a new item is added and auto-focus it
  useEffect(() => {
    console.log('effect!');
    const prevItemCount = itemCountRef.current;
    if (itemCount !== prevItemCount) {
      itemCountRef.current = itemCount;

      // if there was an increase of one, an item was added -> auto focus it, unless it
      // was automatically inserted on first mount/render cycle.
      if (itemCount - prevItemCount === 1 && !autoInsert.current.skipFocus) {
        // we expect only a single element
        const getAutoFocusQuerySelector = getAutoFocusQuerySelectorRef.current;
        const selector = getAutoFocusQuerySelector(`${name}.${itemCount - 1}`);
        const inputElement = containerRef.current?.querySelector<HTMLInputElement>(selector);
        inputElement?.focus();
      }
    }
  }, [name, itemCount]);

  useEffect(() => {
    if (!autoInsert.current.checked) {
      autoInsert.current.checked = true;
    } else {
      autoInsert.current.skipFocus = false;
    }
  });

  return containerRef;
};

export default MultiField;
