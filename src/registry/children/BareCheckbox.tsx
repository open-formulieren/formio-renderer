import {Checkbox as UtrechtCheckbox} from '@utrecht/component-library-react';
import {useField} from 'formik';

import {useFieldConfig} from '@/hooks';

interface BareCheckboxProps {
  name: string;
  'aria-label': string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const BareCheckbox: React.FC<BareCheckboxProps> = ({name, 'aria-label': ariaLabel, onChange}) => {
  name = useFieldConfig(name);
  // the value should not be passed down to underlying checkbox
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{value, ...props}] = useField<boolean | undefined>({
    name,
    type: 'checkbox',
  });
  return (
    <UtrechtCheckbox
      className="utrecht-form-field__input utrecht-custom-checkbox utrecht-custom-checkbox--html-input utrecht-custom-checkbox--openforms"
      appearance="custom"
      aria-label={ariaLabel}
      // Without a default value, formik thinks the field behind the checkbox is actually
      // a list and will set an array value when checked.
      defaultValue="false"
      {...props}
      onChange={e => {
        props.onChange(e);
        onChange(e);
      }}
    />
  );
};

export default BareCheckbox;
