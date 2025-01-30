export interface InputGroupItemProps {
  /**
   * Provided children are displayed with flexbox (row), and their spacing is applied
   * with CSS and design tokens.
   */
  children: React.ReactNode;
}

const InputGroupItem: React.FC<InputGroupItemProps> = ({children}) => (
  <span className="openforms-input-group__item">{children}</span>
);
export default InputGroupItem;
