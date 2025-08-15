import {clsx} from 'clsx';

import type {RendererIcon} from './types';

/**
 * Mapping of semantic icon names to the font-awesome icon name.
 */
const FA_MAP: Record<RendererIcon, string> = {
  add: 'plus',
  edit: 'edit',
  remove: 'trash-can',
  tooltip: 'question-circle',
  close: 'xmark',
  warning: 'exclamation-triangle',
  calendar: 'calendar-days',
  refresh: 'refresh',
  error: 'exclamation-circle',
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
  onClick?: () => void;
}

const FontAwesomeSolidIcon: React.FC<FontAwesomeSolidIconProps> = ({
  className: extraClassName,
  ['aria-hidden']: ariaHidden = true,
  ['aria-label']: ariaLabel,
  ['aria-describedby']: ariaDescribedBy,
  icon,
  onClick,
  ...props
}) => {
  const iconName = FA_MAP[icon] ?? icon;
  const className = clsx('fa-solid', `fa-${iconName}`, extraClassName);
  const interactionProps: React.ComponentProps<'i'> | undefined = onClick
    ? {
        onClick,
        role: 'button',
        tabIndex: 0,
        onKeyDown: event => {
          if (event.key === 'Enter') onClick();
        },
      }
    : undefined;
  return (
    <i
      className={className}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel || undefined}
      aria-describedby={ariaDescribedBy || undefined}
      {...interactionProps}
      {...props}
    />
  );
};

export {FontAwesomeSolidIcon};
