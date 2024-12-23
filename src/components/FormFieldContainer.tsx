import './FormFieldContainer.scss';

export interface FormFieldContainerProps {
  children: React.ReactNode;
}

const FormFieldContainer: React.FC<FormFieldContainerProps> = ({children}) => (
  <div className="openforms-form-field-container">{children}</div>
);

export default FormFieldContainer;
