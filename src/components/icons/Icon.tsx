import clsx from 'clsx';

// Map 'semantic' icons to their font-awesome icon name. This is a layer of indirection
// allowing strong typing for the supported icons & future support for alternative icon
// libraries.
export const FA_MAP = {
  add: 'plus',
  edit: 'edit',
  remove: 'trash-can',
};

// TODO: if/when we support pluggable icon libraries, this probably needs to become
// generic.
export interface IconProps {
  library?: 'font-awesome';
  /**
   * Icon to display.
   */
  icon: keyof typeof FA_MAP;

  // These options should probably be shared irrelevant the icon library used.

  /**
   * Optional extra class name to apply to the icon element.
   */
  className?: string;
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

const Icon: React.FC<IconProps> = ({
  library = 'font-awesome',
  className: extraClassName,
  ['aria-hidden']: ariaHidden = true,
  ['aria-label']: ariaLabel,
  ['aria-describedby']: ariaDescribedBy,
  icon,
}) => {
  if (library !== 'font-awesome') {
    throw new Error(`Unsupported icon library: ${library}.`);
  }

  const iconName = FA_MAP[icon] ?? icon;
  const className = clsx('fa', 'fas', 'fa-icon', `fa-${iconName}`, extraClassName);
  return (
    <i
      className={className}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel || undefined}
      aria-describedby={ariaDescribedBy || undefined}
    />
  );
};

export default Icon;
