import {clsx} from 'clsx';
import {forwardRef} from 'react';

import './FontAwesomeSolidIcon.scss';
import type {RendererIcon} from './types';

type FAVariant = 'regular' | 'solid';

/**
 * Mapping of semantic icon names to the font-awesome icon name.
 */
const FA_MAP: Record<RendererIcon, [string, FAVariant]> = {
  add: ['plus', 'regular'],
  'arrow-right': ['arrow-right', 'solid'],
  edit: ['edit', 'regular'],
  remove: ['trash-can', 'regular'],
  tooltip: ['circle-question', 'regular'],
  close: ['xmark', 'solid'],
  warning: ['exclamation-triangle', 'solid'],
  calendar: ['calendar-days', 'regular'],
  refresh: ['refresh', 'solid'],
  error: ['exclamation-circle', 'solid'],
};

interface FontAwesomeSolidIconProps {
  /**
   * Optional extra class name to apply to the icon element.
   */
  className?: string;
  icon: RendererIcon;
  /**
   * Specify whether the icon should be hidden from screenreaders or not. Hidden by default.
   */
  'aria-hidden'?: boolean | 'true' | 'false';
  /**
   * Accessible icon label in case the icon is not hidden to screen readers.
   */
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-disabled'?: boolean | 'true' | 'false';
  onClick?: (event: React.UIEvent<HTMLElement>) => void;
}

const FontAwesomeSolidIcon = forwardRef<HTMLElement, FontAwesomeSolidIconProps>(
  (
    {
      className: extraClassName,
      ['aria-hidden']: ariaHidden = true,
      ['aria-label']: ariaLabel,
      ['aria-describedby']: ariaDescribedBy,
      ['aria-disabled']: ariaDisabled = false,
      icon,
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = [true, 'true'].includes(ariaDisabled);
    const [iconName, variant] = FA_MAP[icon] ?? icon;
    const className = clsx(
      `fa-${variant}`,
      `fa-${iconName}`,
      isDisabled && 'icon-disabled',
      extraClassName
    );
    const interactionProps: React.ComponentProps<'i'> | undefined = onClick
      ? {
          onClick,
          role: 'button',
          tabIndex: isDisabled ? -1 : 0,
          onKeyDown: event => {
            if (event.key === 'Enter') onClick(event);
          },
        }
      : undefined;
    return (
      <i
        ref={ref}
        className={className}
        aria-hidden={ariaHidden}
        aria-label={ariaLabel || undefined}
        aria-describedby={ariaDescribedBy || undefined}
        aria-disabled={ariaDisabled || undefined}
        {...interactionProps}
        {...props}
      />
    );
  }
);

FontAwesomeSolidIcon.displayName = 'FontAwesomeSolidIcon';

export {FontAwesomeSolidIcon};
