import {
  // eslint-disable-next-line no-restricted-imports
  Button as UtrechtButton,
  // eslint-disable-next-line no-restricted-imports
  PrimaryActionButton as UtrechtPrimaryActionButton,
  // eslint-disable-next-line no-restricted-imports
  SecondaryActionButton as UtrechtSecondaryActionButton,
  // eslint-disable-next-line no-restricted-imports
  SubtleButton as UtrechtSubtleButton,
} from '@utrecht/component-library-react';
import {clsx} from 'clsx';
import {forwardRef} from 'react';

import './Button.scss';

type ButtonProps = React.ComponentProps<typeof UtrechtButton>;

/**
 * Higher order component factory to prevent disabled buttons from being removed from
 * the accessibility tree.
 *
 * Applies the correct class name for disabled utrecht-button components and disables
 * the click event.
 *
 * @todo This can/should be removed once the fix is available in the upstream component
 * or the `nl-button`.
 */
function withAccessibleDisabledProp(Component: typeof UtrechtButton) {
  return forwardRef<HTMLButtonElement, ButtonProps>(function WrappedComponent(
    {disabled, className, onClick, ...props},
    ref
  ) {
    className = clsx(className, disabled && 'utrecht-button--disabled');
    if (disabled) {
      onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        return;
      };
    }
    return (
      <Component
        className={className}
        onClick={onClick}
        aria-disabled={disabled}
        {...props}
        ref={ref}
      />
    );
  });
}

export const Button = withAccessibleDisabledProp(UtrechtButton);
// the type declarations in the upstream package look off and don't seem to have any
// knowledge about the ButtonProps at all :/
export const PrimaryActionButton = withAccessibleDisabledProp(
  UtrechtPrimaryActionButton as typeof UtrechtButton
);
export const SecondaryActionButton = withAccessibleDisabledProp(
  UtrechtSecondaryActionButton as typeof UtrechtButton
);
export const SubtleButton = withAccessibleDisabledProp(UtrechtSubtleButton as typeof UtrechtButton);
