import {Fieldset, FieldsetLegend} from '@utrecht/component-library-react';
import {clsx} from 'clsx';
import type {FormikErrors} from 'formik';
import {Formik, getIn, setIn, setNestedObjectValues} from 'formik';
import {useContext, useId} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {PrimaryActionButton, SecondaryActionButton} from '@/components/Button';
import ValidationErrors from '@/components/forms/ValidationErrors';
import Icon from '@/components/icons';
import {FieldConfigContext} from '@/context';
import type {JSONObject, JSONValue} from '@/types';

import EditGridButtonGroup from './EditGridButtonGroup';
import {IsolationModeButtons} from './EditGridItemButtons';
import {ITEM_ADDED_MARKER, ITEM_EXPANDED_MARKER} from './constants';
import type {MarkedEditGridItem} from './types';

interface EditGridItemBaseProps {
  index: number;
  /**
   * Heading for the item, will be rendered as a fieldset legend unless a falsy value is
   * provided.
   */
  heading: React.ReactNode;

  /**
   * If true, remove button(s) are rendered.
   */
  canRemove: boolean;
  /**
   * Custom label for the remove button.
   */
  removeLabel: string;
  /**
   * Callback invoked when deleting the item.
   */
  onRemove: () => void;
  /**
   * Any item-level validation error.
   */
  itemError?: string;
}

interface WithoutIsolation {
  enableIsolation?: false;
  /**
   * Callback to render the main content of a single item. Gets passed options representing
   * the current UI state.
   */
  getBody: (opts: {expanded: false}) => React.ReactNode;
  data?: never;
  canEdit?: never;
  saveLabel?: never;
  onChange?: never;
  validate?: never;
  errors?: never;
}

interface WithIsolation<T> {
  /**
   * In isolation mode, fields of an item can be edited without them affecting the
   * entire form state. Only when the edits are saved/confirmed, is the parent form
   * state updated.
   */
  enableIsolation: true;
  /**
   * Existing item data, passed to the underlying Formik component as initial state.
   * Note that this is only accepted as *initial* data and changes in props do not change
   * the form field values.
   */
  data: MarkedEditGridItem<T>;
  /**
   * Callback to render the main content of a single item. Gets passed options representing
   * the current UI state.
   */
  getBody: (opts: {expanded: boolean}) => React.ReactNode;
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
  onChange: (newValue: T) => void;
  /**
   * Validate hook to pass to Formik's `validationSchema` prop. It must validate the
   * shape of a single item.
   *
   * Must throw zod-formik-adapter's `ValidationError` for invalid data.
   */
  validate?: (obj: JSONObject) => Promise<void>;
  errors?: FormikErrors<T>;
}

export type EditGridItemProps<T> = EditGridItemBaseProps & (WithoutIsolation | WithIsolation<T>);

function EditGridItem<T extends {[K in keyof T]: JSONValue} = JSONObject>({
  index,
  heading,
  canRemove,
  removeLabel,
  onRemove,
  itemError,
  ...props
}: EditGridItemProps<T>) {
  const intl = useIntl();
  const {namePrefix} = useContext(FieldConfigContext);
  const id = useId();
  const headingId = `${id}-heading`;
  const itemErrorId = itemError ? `${id}-item-error` : undefined;

  const accessibleRemoveButtonLabel = intl.formatMessage(
    {
      description: 'Accessible remove icon/button label for item inside edit grid',
      defaultMessage: 'Remove item {index}',
    },
    {index: index + 1}
  );

  const expandedPropertyPath = namePrefix
    ? `${namePrefix}.${ITEM_EXPANDED_MARKER}`
    : ITEM_EXPANDED_MARKER;
  const newItemPropertyPath = namePrefix ? `${namePrefix}.${ITEM_ADDED_MARKER}` : ITEM_ADDED_MARKER;
  const isExpanded =
    !!(props.enableIsolation && props.canEdit && getIn(props.data, expandedPropertyPath)) ||
    // if there are errors but the state is not expanded, ensure that it is expanded so
    // that errors are displayed. Updates to the values result in those errors being
    // cleared via `props.onChange`.
    !!props.errors;

  return (
    <li
      className={clsx('openforms-editgrid__item', itemError && 'openforms-editgrid__item--invalid')}
    >
      <Fieldset>
        {heading && (
          <FieldsetLegend
            className="openforms-editgrid__item-heading"
            id={headingId}
            aria-describedby={itemErrorId}
          >
            {heading}
          </FieldsetLegend>
        )}

        {/*
        In isolation mode, set up a separate Formik context that requires user interaction
        before it's committed to the parent state. In non-isolation mode, the caller needs
        to provide the form fields with their deeply nested field names so the state is
        updated directly, so then we render as-is.
      */}

        {props.enableIsolation && props.canEdit ? (
          // We apply the same Formik rendering philosophy as in FormioForm.tsx w/r to initial
          // values, errors, touched state and the validation behaviour (validate individual fields, on blur)
          <Formik<MarkedEditGridItem<T>>
            initialValues={props.data}
            initialErrors={props.errors}
            initialTouched={props.errors ? setNestedObjectValues(props.errors, true) : undefined}
            // when removing items, the order changes, so we must re-render to display the
            // correct data
            enableReinitialize
            validateOnChange={false}
            validateOnBlur={false}
            validationSchema={props.validate ? {validate: props.validate} : undefined}
            onSubmit={async values => {
              // remove markers on submit
              if (getIn(values, expandedPropertyPath)) {
                values = setIn(values, expandedPropertyPath, undefined);
              }
              if (getIn(values, newItemPropertyPath)) {
                values = setIn(values, newItemPropertyPath, undefined);
              }
              if (props.canEdit) props.onChange(values);
            }}
          >
            <>
              {props.getBody({expanded: isExpanded})}

              {itemError && itemErrorId && (
                // wrapper div to workaround `order` CSS from utrecht-form-field
                <div>
                  <ValidationErrors error={itemError} id={itemErrorId} />
                </div>
              )}

              {isExpanded ? (
                <IsolationModeButtons
                  saveLabel={props.saveLabel}
                  onCancel={() => {
                    const values = props.data;
                    // if it's a newly added item, remove it again
                    if (getIn(values, newItemPropertyPath)) {
                      onRemove();
                    } else {
                      // otherwise, revert the changes
                      const newValues = setIn(values, expandedPropertyPath, undefined);
                      props.onChange(newValues);
                    }
                  }}
                  // looks wrong, it isn't... these are badly named properties in the
                  // formio edit grid component
                  cancelLabel={removeLabel}
                  aria-describedby={heading ? headingId : undefined}
                />
              ) : (
                <EditGridButtonGroup>
                  <SecondaryActionButton
                    type="button"
                    onClick={() => {
                      // add a marker to the item indicating that it's expanded, so that
                      // this marker can be detected during validation.
                      // The initial approach was to use a Symbol for this, but those
                      // get stripped out by Zod during validation, even with
                      // z.object().passthrough() :(
                      // we use setIn to keep the rest of the object data references stable
                      const markedItem: MarkedEditGridItem<T> = setIn(
                        props.data,
                        expandedPropertyPath,
                        true
                      );
                      props.onChange(markedItem);
                    }}
                    aria-label={intl.formatMessage(
                      {
                        description: 'Accessible edit icon/button label for item inside edit grid',
                        defaultMessage: 'Edit item {index}',
                      },
                      {index: index + 1}
                    )}
                    aria-describedby={heading ? headingId : undefined}
                  >
                    <Icon icon="edit" />
                  </SecondaryActionButton>

                  {canRemove && (
                    <PrimaryActionButton
                      hint="danger"
                      onClick={onRemove}
                      aria-label={accessibleRemoveButtonLabel}
                      aria-describedby={heading ? headingId : undefined}
                    >
                      <Icon icon="remove" />
                    </PrimaryActionButton>
                  )}
                </EditGridButtonGroup>
              )}
            </>
          </Formik>
        ) : (
          <>
            {props.getBody({expanded: false})}
            {canRemove && (
              <EditGridButtonGroup>
                <PrimaryActionButton
                  hint="danger"
                  onClick={onRemove}
                  aria-describedby={heading ? headingId : undefined}
                >
                  {removeLabel || (
                    <FormattedMessage
                      description="Edit grid item default remove button label"
                      defaultMessage="Remove"
                    />
                  )}
                </PrimaryActionButton>
              </EditGridButtonGroup>
            )}
          </>
        )}
      </Fieldset>
    </li>
  );
}

export default EditGridItem;
