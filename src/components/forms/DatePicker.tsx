import type {FloatingRootContext} from '@floating-ui/react';
import {
  FloatingArrow,
  FloatingFocusManager,
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingRootContext,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import {createContext, useContext, useRef, useState} from 'react';
import {useIntl} from 'react-intl';

import DatePickerCalendar from '@/components/forms/DatePickerCalendar';
import Icon from '@/components/icons';

import './FloatingWidget.scss';

/**
 * Props returned by composing interactions through useInteractions, which unfortunately
 * doesn't compose the type of the return props but returns a `Record<string, unknown>`
 * instead.
 *
 * This type definition is tightly coupled with the "configuration" in `useDatePicker`.
 */
type ReferenceProps = {
  onClick: (event: React.UIEvent<HTMLElement>) => void;
  onKeyDown: (event: React.UIEvent<HTMLElement>) => void;
  onKeyUp: (event: React.UIEvent<HTMLElement>) => void;
  onMouseDown: (event: React.UIEvent<HTMLElement>) => void;
  onPointerDown: (event: React.UIEvent<HTMLElement>) => void;
  // remaining props are assumed to be string
  [key: string]: unknown;
};

const useDatePicker = () => {
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const rootContext = useContext(DatePickerContext);
  // invariant - this should never trigger
  if (!rootContext) {
    throw new Error('DatepickerTrigger must be a child of the DatePickerRoot component');
  }

  const {floatingStyles, context} = useFloating({
    rootContext,
    middleware: [offset(10), flip(), shift(), arrow({element: arrowRef})],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context);
  const role = useRole(context);
  const click = useClick(context);
  const {getReferenceProps, getFloatingProps} = useInteractions([click, role, dismiss]);

  return {
    isOpen: rootContext.open,
    context,
    setTrigger: rootContext.setTrigger,
    setFloating: rootContext.setFloating,
    arrowRef,
    floatingStyles,
    // upstream reference props type is `Record<string, unknown>`, which we can't work
    // with
    getReferenceProps: (userProps?: React.HTMLProps<HTMLElement>): ReferenceProps =>
      // @ts-expect-error upstream's Record<string, unknown> is not specific enough
      getReferenceProps(userProps),
    getFloatingProps,
  };
};

export interface DatePickerProps extends React.ComponentProps<typeof DatePickerCalendar> {
  children?: React.ReactNode;
}

/**
 * A datepicker widget, exposing a calendar to select a date and possible additional
 * child elements after it, suitable for date and datetime inputs.
 *
 * The reference element controls the open/closed state, while the date picker itself
 * ensures it's rendered correctly in a dialog/popout element.
 *
 */
export const DatePicker: React.FC<DatePickerProps> = ({children, ...props}) => {
  const {isOpen, context, arrowRef, setFloating, floatingStyles, getFloatingProps} =
    useDatePicker();
  if (!isOpen) return null;
  return (
    <FloatingFocusManager
      context={context}
      modal={false}
      order={['floating', 'content']}
      returnFocus={false}
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
      >
        <FloatingArrow
          ref={arrowRef}
          context={context}
          className="openforms-floating-widget__arrow"
          stroke="transparent"
          strokeWidth={1}
        />
        <DatePickerCalendar {...props} />
        {children}
      </div>
    </FloatingFocusManager>
  );
};

export interface DatePickerTriggerProps {
  className?: string;
}

/**
 * Interactive element to trigger opening/closing the date picker dialog.
 */
export const DatePickerTrigger: React.FC<DatePickerTriggerProps> = ({className}) => {
  const intl = useIntl();
  const {setTrigger, getReferenceProps} = useDatePicker();
  const label = intl.formatMessage({
    description: 'Datepicker: accessible calendar toggle label',
    defaultMessage: 'Toggle calendar',
  });
  return (
    <Icon
      ref={setTrigger}
      icon="calendar"
      className={className}
      aria-label={label}
      aria-hidden="false"
      {...getReferenceProps()}
      title={label}
    />
  );
};

interface DatePickerContextType extends FloatingRootContext {
  setTrigger: (element: HTMLElement | null) => void;
  setFloating: (element: HTMLElement | null) => void;
}

const DatePickerContext = createContext<DatePickerContextType | null>(null);
DatePickerContext.displayName = 'DatePickerContext';

interface RenderFuncArgs {
  refs: FloatingRootContext['refs'];
}

export interface DatePickerRootProps {
  children: (args: RenderFuncArgs) => React.ReactNode;
}

/**
 * Root for the datepicker that manages the open/closed state and exposes the event
 * handlers.
 */
export const DatePickerRoot: React.FC<DatePickerRootProps> = ({children: renderFunc}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [floating, setFloating] = useState<HTMLElement | null>(null);

  const context = useFloatingRootContext({
    open: isOpen,
    onOpenChange: setIsOpen,
    elements: {
      reference: trigger,
      floating: floating,
    },
  });

  return (
    <DatePickerContext.Provider value={{...context, setTrigger, setFloating}}>
      {renderFunc({refs: context.refs})}
    </DatePickerContext.Provider>
  );
};
