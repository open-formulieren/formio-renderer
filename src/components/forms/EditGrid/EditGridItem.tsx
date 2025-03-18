import {Fieldset, FieldsetLegend, SecondaryActionButton} from '@utrecht/component-library-react';
import {PrimaryActionButton} from '@utrecht/component-library-react';
import {Formik, setNestedObjectValues} from 'formik';
import {useId, useState} from 'react';
import {useIntl} from 'react-intl';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import Icon from '@/components/icons';
import type {JSONObject} from '@/types';

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
}

export type EditGridItemProps<T> = EditGridItemBaseProps & (WithoutIsolation | WithIsolation<T>);

function EditGridItem<T extends JSONObject = JSONObject>({
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

  // TODO
  const errors: any = {};
  const zodSchema: any = null;
  return (
    <Fieldset className="openforms-editgrid__item">
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
          initialErrors={{}}
          initialTouched={false ? setNestedObjectValues(errors, true) : undefined}
          // when removing items, the order changes, so we must re-render to display the
          // correct data
          enableReinitialize
          validateOnChange={false}
          validateOnBlur={false}
          validationSchema={false ? toFormikValidationSchema(zodSchema) : undefined}
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
  );
}

export default EditGridItem;
