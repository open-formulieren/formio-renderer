import {FormLabel} from '@utrecht/form-label-react';
import type {FormLabelProps} from '@utrecht/form-label-react';
import {clsx} from 'clsx';

const InputGroupItemLabel: React.FC<FormLabelProps> = ({className, ...props}) => (
  <FormLabel className={clsx('openforms-input-group__item-label', className)} {...props} />
);

export default InputGroupItemLabel;
