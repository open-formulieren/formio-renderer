import {FontAwesomeSolidIcon} from './FontAwesome';
import type {RendererIcon} from './types';

// TODO: if/when we support pluggable icon libraries, this probably needs to become
// generic.
export interface IconProps {
  library?: 'font-awesome';
  /**
   * Icon to display.
   */
  icon: RendererIcon;

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
  className,
  ['aria-hidden']: ariaHidden = true,
  ['aria-label']: ariaLabel,
  ['aria-describedby']: ariaDescribedBy,
  icon,
}) => {
  switch (library) {
    case 'font-awesome': {
      return (
        <FontAwesomeSolidIcon
          icon={icon}
          className={className}
          aria-hidden={ariaHidden}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        />
      );
    }
    default: {
      throw new Error(`Unsupported icon library: ${library}.`);
    }
  }
};

export default Icon;
