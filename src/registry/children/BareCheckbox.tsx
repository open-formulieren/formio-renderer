import {Checkbox as UtrechtCheckbox} from '@utrecht/component-library-react';
import {useField} from 'formik';

import {useFieldConfig} from '@/hooks';

interface BareCheckboxProps {
  name: string;
  'aria-label': string;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const BareCheckbox: React.FC<BareCheckboxProps> = ({name, 'aria-label': ariaLabel, onBlur}) => {
  name = useFieldConfig(name);
  // the value should not be passed down to underlying checkbox
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{value, ...props}] = useField<boolean | undefined>({
    name,
    type: 'checkbox',
  });
  return (
    <UtrechtCheckbox
      className="utrecht-custom-checkbox utrecht-custom-checkbox--html-input utrecht-custom-checkbox--openforms"
      appearance="custom"
      aria-label={ariaLabel}
      {...props}
      onBlur={e => {
        props.onBlur(e);
        onBlur(e);
      }}
    />
  );
};

export default BareCheckbox;
