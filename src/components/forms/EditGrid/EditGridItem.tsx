import {Fieldset, FieldsetLegend, SecondaryActionButton} from '@utrecht/component-library-react';
import {PrimaryActionButton} from '@utrecht/component-library-react';
import {Formik, FormikErrors, setNestedObjectValues} from 'formik';
import {useId, useState} from 'react';
import {useIntl} from 'react-intl';

import Icon from '@/components/icons';
import type {JSONObject, JSONValue} from '@/types';

import EditGridButtonGroup from './EditGridButtonGroup';
import {IsolationModeButtons, RemoveButton} from './EditGridItemButtons';

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
  initiallyExpanded?: false;
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
  data: T;
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
   * Set to `true` for newly added items so that the user can start editing directly.
   */
  initiallyExpanded?: boolean;
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
  initiallyExpanded = false,
  ...props
}: EditGridItemProps<T>) {
  const intl = useIntl();
  const [expanded, setExpanded] = useState<boolean>(initiallyExpanded);
  const headingId = useId();

  const accessibleRemoveButtonLabel = intl.formatMessage(
    {
      description: 'Accessible remove icon/button label for item inside edit grid',
      defaultMessage: 'Remove item {index}',
    },
    {index: index + 1}
  );

  // if there are errors but the state is not expanded, ensure that it is expanded so
  // that errors are displayed. Updates to the values result in those errors being
  // cleared via `props.onChange`.
  if (props.errors && !expanded) {
    setExpanded(true);
  }

  return (
    <li className="openforms-editgrid__item">
      <Fieldset>
        {heading && (
          <FieldsetLegend className="openforms-editgrid__item-heading" id={headingId}>
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
          <Formik<T>
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
              if (props.canEdit) props.onChange(values);
              setExpanded(false);
            }}
          >
            <>
              {props.getBody({expanded})}

              {expanded ? (
                <IsolationModeButtons
                  saveLabel={props.saveLabel}
                  canRemove={Boolean(canRemove)}
                  onRemove={onRemove}
                  removeLabel={removeLabel}
                  aria-describedby={heading ? headingId : undefined}
                />
              ) : (
                <EditGridButtonGroup>
                  <SecondaryActionButton
                    type="button"
                    onClick={() => setExpanded(true)}
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
                <RemoveButton
                  label={removeLabel}
                  onClick={onRemove}
                  aria-describedby={heading ? headingId : undefined}
                />
              </EditGridButtonGroup>
            )}
          </>
        )}
      </Fieldset>
    </li>
  );
}

export default EditGridItem;
