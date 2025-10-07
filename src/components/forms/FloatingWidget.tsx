/**
 * Implements a form field widget that floats in a 'popout'.
 *
 * Focusing the form field opens the widget, while keeping focus on original form
 * field. Keyboard tab navigation focuses the elements inside the popout in order,
 * while any other keyboard input closes the widget (shifting to 'manual input' mode).
 *
 * Clicking the form field/reference (re-)opens the widget. The widget/popout can be
 * dismissed by hitting the [ESC] key, clicking outside of it or tabbing through/out
 * of it.
 *
 * You need both the hook and component for the behaviour.
 *
 * Note that `getReferenceProps` returns event handlers like onKeyDown - if you are
 * overriding these events yourself, make sure you don't accidentally overwrite the
 * floating widget handlers.
 *
 * We've done an attempt (see https://github.com/open-formulieren/open-forms-sdk/pull/432/files#r1221521810)
 * to make the hook the *only* API by having it return the `FloatingWidget` component (
 * as a closure) so that the additional props like refs/floatingStyles... etc. wouldn't
 * need to be passed. This didn't work with React sort of blowing up because of too
 * many re-renders. Defining components inside another component is actually an
 * antipattern for this exact reason.
 */
import {
  FloatingArrow,
  FloatingFocusManager,
  type UseFloatingOptions,
  type UseFloatingReturn,
  type UseInteractionsReturn,
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import {useRef, useState} from 'react';

import './FloatingWidget.scss';

type ManageOpen = (open: boolean, options?: {keepDismissed?: boolean}) => void;

interface UseFloatingWidget {
  refs: UseFloatingReturn['refs'];
  floatingStyles: UseFloatingReturn['floatingStyles'];
  context: UseFloatingReturn['context'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  isOpen: boolean;
  setIsOpen: ManageOpen;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
}

const useFloatingWidget = (): UseFloatingWidget => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const keepClosed = useRef<boolean>(false);
  const arrowRef = useRef<SVGSVGElement | null>(null);

  const onOpenChange: UseFloatingOptions['onOpenChange'] = (open: boolean) => {
    setIsOpen(open);
    if (open && keepClosed.current) {
      keepClosed.current = false;
    }
  };

  const manageOpen: ManageOpen = (open, options = {}) => {
    onOpenChange(open);
    const {keepDismissed = false} = options;
    if (!open && keepDismissed) {
      keepClosed.current = true;
    }
  };

  const {refs, floatingStyles, context} = useFloating({
    open: isOpen,
    onOpenChange: onOpenChange,
    middleware: [offset(10), flip(), shift(), arrow({element: arrowRef})],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context);
  const role = useRole(context);

  const {getReferenceProps, getFloatingProps} = useInteractions([dismiss, role]);

  const onClick = () => {
    const isFocused = context.refs.reference.current === document.activeElement;
    if (isFocused && !isOpen) manageOpen(true);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') manageOpen(false);
  };

  const onFocus = () => {
    if (!isOpen && !keepClosed.current) manageOpen(true);
    if (keepClosed.current) {
      keepClosed.current = false;
    }
  };

  // From the docs (https://floating-ui.com/docs/useinteractions):
  // All event handlers you pass in should be done so through the prop getter, [...]
  // This is because your handler may be either overwritten or overwrite one of the
  // Hooks’ handlers
  const referenceProps = getReferenceProps({onClick, onKeyDown, onFocus});

  return {
    refs,
    floatingStyles,
    context,
    getFloatingProps,
    getReferenceProps: () => referenceProps,
    isOpen,
    setIsOpen: manageOpen,
    arrowRef,
  };
};

export interface FloatingWidgetProps {
  isOpen: boolean;
  context: UseFloatingReturn['context'];
  setFloating: UseFloatingReturn['refs']['setFloating'];
  floatingStyles: UseFloatingReturn['floatingStyles'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  children: React.ReactNode;
}

const FloatingWidget: React.FC<FloatingWidgetProps> = ({
  isOpen,
  context,
  setFloating,
  floatingStyles,
  getFloatingProps,
  arrowRef,
  children,
  ...restProps
}) => {
  return (
    isOpen && (
      <FloatingFocusManager
        context={context}
        modal={false}
        order={['reference', 'content']}
        returnFocus
        visuallyHiddenDismiss
      >
        <div
          ref={setFloating}
          className="openforms-floating-widget"
          // checked with CSP - these inline styles appear to be using the CSSOM correctly
          // and would not result in CSP violations where unsafe-inline is blocked.
          // Ref: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model
          style={floatingStyles}
          {...getFloatingProps()}
          {...restProps}
        >
          <FloatingArrow
            ref={arrowRef}
            context={context}
            className="openforms-floating-widget__arrow"
            stroke="transparent"
            strokeWidth={1}
          />
          {children}
        </div>
      </FloatingFocusManager>
    )
  );
};

export {useFloatingWidget, FloatingWidget};
