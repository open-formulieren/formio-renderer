import {clsx} from 'clsx';

import './FormFieldContainer.scss';

export interface FormFieldContainerProps {
  children: React.ReactNode;
  className?: string;
}

const FormFieldContainer: React.FC<FormFieldContainerProps> = ({className, children}) => (
  <div className={clsx('openforms-form-field-container', className)}>{children}</div>
);

export default FormFieldContainer;
