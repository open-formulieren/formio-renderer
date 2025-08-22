/**
 * Implements a form field widget that floats in a 'popout'.
 *
 * Focusing the form field opens the widget, while keeping focus on original form
 * field. Keyboard tab navigation focuses the elements inside the popout in order,
 * while any other keyboard input closes the widget (shifting to 'manual input' mode).
 *
 * Clicking the form field/reference (re-)opens the widget. The widget/popout can be
 * dismissed by hitting the [ESC} key, clicking outside of it or tabbing through/out
 * of it.
 *
 * You need both the hook and component for the behaviour.
 *
 * Note that `getReferenceProps` returns event handlers like onKeyDown - if you are
 * overriding these events yourself, make sure you don't accidentally overwrite the
 * floating widget handlers.
 *
 * TODO-82: look into this maybe?
 * We've done an attempt (see https://github.com/open-formulieren/open-forms-sdk/pull/432/files#r1221521810)
 * to make the hook the *only* API by having it return the `FloatingWidget` component (
 * as a closure) so that the additional props like refs/floatingStyles... etc. wouldn't
 * need to be passed. This didn't work with React sort of blowing up because of too
 * many re-renders. I suspect the refs/useRef calls with the closure component might be
 * a problem and possibly useMemo could be a solution to this, but this is entirely
 * guesswork and unvalidated. Making this work is left as an exercise to the reader.
 */
import {
  FloatingArrow,
  FloatingFocusManager,
  type UseFloatingOptions,
  type UseFloatingReturn,
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
import {LegacyRef, useRef, useState} from 'react';

import './FloatingWidget.scss';

type OnOpenChange = NonNullable<UseFloatingOptions['onOpenChange']>;

type ManageOpen = (
  open: Parameters<OnOpenChange>[0],
  event?: Parameters<OnOpenChange>[1],
  reason?: Parameters<OnOpenChange>[2],
  options?: {keepDismissed?: boolean}
) => void;

const useFloatingWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const keepClosed = useRef(false);
  const arrowRef = useRef(null);

  const manageOpen: ManageOpen = (open, _event?, _reason?, options = {}) => {
    const {keepDismissed = false} = options;
    setIsOpen(open);
    if (open && keepClosed.current) {
      keepClosed.current = false;
    }
    if (!open && keepDismissed) {
      keepClosed.current = true;
    }
  };

  const {refs, floatingStyles, context} = useFloating({
    open: isOpen,
    onOpenChange: manageOpen,
    middleware: [offset(10), flip(), shift(), arrow({element: arrowRef})],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context);
  const role = useRole(context);

  const {getReferenceProps, getFloatingProps} = useInteractions([dismiss, role]);
  // TODO-82: how to type hint these reference props?
  const referenceProps = getReferenceProps();

  const onClick = () => {
    const isFocused = context.refs.reference.current === document.activeElement;
    if (isFocused && !isOpen) manageOpen(true);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    // @ts-expect-error referenceProps is not type-hinted yet
    referenceProps?.onKeyDown?.(event);
    if (event.key !== 'Tab') manageOpen(false);
  };

  const onFocus = () => {
    if (!isOpen && !keepClosed.current) manageOpen(true);
    if (keepClosed.current) {
      keepClosed.current = false;
    }
  };

  return {
    refs,
    floatingStyles,
    context,
    getFloatingProps,
    getReferenceProps: () => {
      return {...referenceProps, onClick, onFocus, onKeyDown};
    },
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
  // TODO-82: should properly type this
  getFloatingProps: () => Record<string, unknown>;
  arrowRef?: LegacyRef<SVGSVGElement>;
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
