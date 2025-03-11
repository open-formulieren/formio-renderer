import {Fieldset, FieldsetLegend} from '@utrecht/component-library-react';

export interface EditGridItemProps {
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
   * Control buttons for the item, e.g. to remove, edit or save it.
   */
  buttons?: React.ReactNode;
}

const EditGridItem: React.FC<EditGridItemProps> = ({children, heading, buttons}) => (
  <Fieldset className="openforms-editgrid__item">
    {heading && (
      <FieldsetLegend className="openforms-editgrid__item-heading">{heading}</FieldsetLegend>
    )}
    {children}
    {buttons}
  </Fieldset>
);

export default EditGridItem;
