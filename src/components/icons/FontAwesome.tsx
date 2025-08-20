import clsx from 'clsx';

import type {RendererIcon} from './types';

/**
 * Mapping of semantic icon names to the font-awesome icon name.
 */
const FA_MAP: Record<RendererIcon, string> = {
  add: 'plus',
  edit: 'edit',
  remove: 'trash-can',
  tooltip: 'question-circle',
  warning: 'exclamation-triangle',
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
}

const FontAwesomeSolidIcon: React.FC<FontAwesomeSolidIconProps> = ({
  className: extraClassName,
  ['aria-hidden']: ariaHidden = true,
  ['aria-label']: ariaLabel,
  ['aria-describedby']: ariaDescribedBy,
  icon,
}) => {
  const iconName = FA_MAP[icon] ?? icon;
  const className = clsx('fa-solid', `fa-${iconName}`, extraClassName);
  return (
    <i
      className={className}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel || undefined}
      aria-describedby={ariaDescribedBy || undefined}
    />
  );
};

export {FontAwesomeSolidIcon};
