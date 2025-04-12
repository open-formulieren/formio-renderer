/**
 * Implements a tooltip using float-ui.
 *
 * Guide from https://floating-ui.com/docs/tooltip.
 *
 * Will at some point be obsoleted by the HTML popover/anchor APIs, but right now not
 * all major browsers support this yet. See:
 * https://www.voorhoede.nl/en/blog/the-popover-api-your-new-best-friend-for-tooltips/
 */
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import {Icon as UtrechtIcon} from '@utrecht/component-library-react';
import clsx from 'clsx';
import {useEffect, useState} from 'react';
import {useIntl} from 'react-intl';

import Icon from '@/components/icons';

import './Tooltip.scss';

export interface TooltipProps {
  children: React.ReactNode;
  id?: string; // recommended to pass and relate with aria-describedby
}

const Tooltip: React.FC<TooltipProps> = ({children, id}) => {
  const [isOpen, setIsOpen] = useState(false);
  const intl = useIntl();

  const {update, refs, elements, floatingStyles, context, placement} = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift()],
    placement: 'right',
  });

  const hover = useHover(context, {
    move: false,
    delay: {
      open: 0,
      close: 100,
    },
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, {role: 'tooltip'});

  const {getReferenceProps, getFloatingProps} = useInteractions([hover, focus, dismiss, role]);

  useEffect(() => {
    if (isOpen && elements.reference && elements.floating) {
      const cleanup = autoUpdate(elements.reference, elements.floating, update);
      return cleanup;
    }
    return;
  }, [isOpen, elements, update]);

  if (!children) return null;

  return (
    <>
      <UtrechtIcon
        ref={refs.setReference}
        // ensure it's keyboard-navigation capable
        tabIndex={0}
        // must show up in the accessible tree
        aria-hidden="false"
        aria-label={intl.formatMessage({
          description: 'Tooltip icon label',
          defaultMessage: 'Show tooltip',
        })}
        {...getReferenceProps()}
      >
        <Icon icon="tooltip" className="openforms-tooltip-icon" />
      </UtrechtIcon>
      {/* The DOM node must always be rendered to support screen readers - handle visibility with CSS */}
      <span
        className={clsx('openforms-tooltip', `openforms-tooltip--${placement}`, {
          'openforms-tooltip--visible': isOpen,
        })}
        id={id}
        style={floatingStyles}
        ref={refs.setFloating}
        {...getFloatingProps()}
      >
        <span className="openforms-tooltip__arrow" />
        <span className="openforms-tooltip__content">{children}</span>
      </span>
    </>
  );
};

export default Tooltip;
