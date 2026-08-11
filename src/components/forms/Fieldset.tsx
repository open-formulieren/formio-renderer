import {FieldsetLegend, Fieldset as UtrechtFieldSet} from '@utrecht/fieldset-react';
import type {FieldsetProps as UtrechtFieldSetProps} from '@utrecht/fieldset-react';
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
const Fieldset: React.FC<FieldsetProps & UtrechtFieldSetProps> = ({
  header,
  headerHidden,
  hasTooltip,
  isInvalid,
  className,
  'aria-describedby': ariaDescribedBy,
  children,
}) => (
  <UtrechtFieldSet
    invalid={isInvalid}
    aria-describedby={ariaDescribedBy}
    className={clsx('utrecht-form-fieldset--openforms', className)}
  >
    {header && (
      <FieldsetLegend
        className={clsx('utrecht-form-fieldset__legend--with-border', {
          'utrecht-form-fieldset__legend--openforms-tooltip': hasTooltip,
          'sr-only': headerHidden,
        })}
      >
        <span className="openforms-fieldset-legend-content">{header}</span>
      </FieldsetLegend>
    )}
    {children}
  </UtrechtFieldSet>
);

export default Fieldset;
