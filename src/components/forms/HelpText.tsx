import {FormFieldDescription} from '@utrecht/form-field-description-react';

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
    <FormFieldDescription className="utrecht-form-field-description--openforms-helptext" {...props}>
      {children}
    </FormFieldDescription>
  );
};

HelpText.displayName = 'HelpText';

export default HelpText;
