import {Fieldset, FieldsetLegend} from '@utrecht/component-library-react';
import {PrimaryActionButton} from '@utrecht/component-library-react';
import {Formik, setNestedObjectValues} from 'formik';
import {FormattedMessage} from 'react-intl';
import {toFormikValidationSchema} from 'zod-formik-adapter';

import type {JSONObject} from '@/types';

import EditGridButtonGroup from './EditGridButtonGroup';
import {IsolationModeButtons} from './EditGridItemButtons';

interface EditGridItemBaseProps {
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

interface WithoutIsolation {
  enableIsolation?: false;
  data?: never;
  canEdit?: never;
  saveLabel?: never;
  onReplace?: never;
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
}

export type EditGridItemProps<T> = EditGridItemBaseProps & (WithoutIsolation | WithIsolation<T>);

// TODO: track open/collapsed state and adapt the buttons accordingly

function EditGridItem<T extends JSONObject = JSONObject>({
  children,
  heading,
  canRemove,
  removeLabel,
  onRemove,
  ...props
}: EditGridItemProps<T>) {
  return (
    <Fieldset className="openforms-editgrid__item">
      {heading && (
        <FieldsetLegend className="openforms-editgrid__item-heading">{heading}</FieldsetLegend>
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
          validateOnChange={false}
          validateOnBlur={false}
          validationSchema={false ? toFormikValidationSchema(zodSchema) : undefined}
          // TODO: trigger submit from primary button - perhaps Formik should wrap the entire thing?
          onSubmit={async values => {
            if (props.canEdit) props.onReplace(values);
          }}
        >
          <>
            {children}
            <IsolationModeButtons
              saveLabel={props.saveLabel}
              canRemove={Boolean(canRemove)}
              onRemove={onRemove}
              removeLabel={removeLabel}
            />
          </>
        </Formik>
      ) : (
        <>
          {children}
          {canRemove && (
            <EditGridButtonGroup>
              <PrimaryActionButton hint="danger" onClick={onRemove}>
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
  );
}

export default EditGridItem;
