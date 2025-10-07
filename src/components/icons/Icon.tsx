import {FontAwesomeSolidIcon} from './FontAwesome';
import type {RendererIcon} from './types';

interface VisibleIconProps {
  /**
   * Specify whether the icon should be hidden from screenreaders or not. Hidden by default.
   */
  'aria-hidden': false | 'false';
  onClick: () => void;
}

interface HiddenIconProps {
  /**
   * Specify whether the icon should be hidden from screenreaders or not. Hidden by default.
   */
  'aria-hidden'?: true | 'true';
  onClick?: () => void;
}

// TODO: if/when we support pluggable icon libraries, this probably needs to become
// generic.
interface BaseIconProps {
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
   * Accessible icon label in case the icon is not hidden to screen readers.
   */
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export type IconProps = BaseIconProps & (HiddenIconProps | VisibleIconProps);

const Icon: React.FC<IconProps> = ({
  library = 'font-awesome',
  className,
  ['aria-hidden']: ariaHidden = true,
  ['aria-label']: ariaLabel,
  ['aria-describedby']: ariaDescribedBy,
  icon,
  onClick,
  ...props
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
          onClick={onClick}
          {...props}
        />
      );
    }
    default: {
      throw new Error(`Unsupported icon library: ${library}.`);
    }
  }
};

export default Icon;
