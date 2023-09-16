import {FormFieldDescription} from '@utrecht/component-library-react';
import {FormFieldDescriptionProps} from '@utrecht/component-library-react/dist/FormFieldDescription';
import clsx from 'clsx';
import {PropsWithChildren} from 'react';

const HelpText: React.FC<PropsWithChildren<FormFieldDescriptionProps>> = ({children, ...props}) => {
  if (!children) return null;
  return (
    <FormFieldDescription
      className={clsx(
        'utrecht-form-field-description--openforms-helptext',
        'utrecht-form-field__description'
      )}
      {...props}
    >
      {children}
    </FormFieldDescription>
  );
};

export default HelpText;
