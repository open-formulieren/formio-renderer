import {clsx} from 'clsx';

import './Fieldset.scss';

export interface FieldsetProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  hasTooltip?: boolean;
  isInvalid?: boolean;
  className?: string;
  headerHidden?: boolean;
}

/**
 * Styled fieldset component to wrap/bundle related fields together.
 *
 * @todo See how/if we can merge this with the Fieldset component from the Utrecht
 * component library. There are substantial styling differences though.
 */
const Fieldset: React.FC<FieldsetProps & React.ComponentProps<'fieldset'>> = ({
  header,
  headerHidden,
  hasTooltip,
  isInvalid,
  className,
  'aria-describedby': ariaDescribedBy,
  children,
}) => (
  <fieldset
    className={clsx(
      'openforms-fieldset',
      {
        'openforms-fieldset--invalid': isInvalid,
        'openforms-fieldset--no-header': !header || headerHidden,
      },
      className
    )}
    aria-describedby={ariaDescribedBy}
  >
    {header && (
      <legend
        className={clsx('openforms-fieldset__legend', {
          'openforms-fieldset__legend--tooltip': hasTooltip,
          'sr-only': headerHidden,
        })}
      >
        {header}
      </legend>
    )}
    {children}
  </fieldset>
);

export default Fieldset;
