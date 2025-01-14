import {FormFieldDescription} from '@utrecht/component-library-react';
import clsx from 'clsx';

import './HelpText.scss';

export type HelpTextProps = {
  children: React.ReactNode;
};

const HelpText: React.FC<HelpTextProps & React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => {
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
