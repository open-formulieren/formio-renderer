import {Alert} from '@utrecht/component-library-react';

import {useRef, useEffect} from 'react';

const ALERT_MODIFIERS = ['info', 'warning', 'error', 'ok'] as const;

type ErrorMessageLevel = (typeof ALERT_MODIFIERS)[number];

const ICONS: Record<ErrorMessageLevel, React.ReactElement> = {
  error: <i className="fa fas fa-exclamation-circle" />,
  info: <i className="fa fas fa-info-circle" />,
  warning: <i className="fa fas fa-exclamation-triangle" />,
  ok: <i className="fa fas fa-check-circle" />,
};

const ARIA_TAGS: Record<
  ErrorMessageLevel,
  React.AriaAttributes & Pick<React.HTMLAttributes<HTMLDivElement>, 'role'>
> = {
  error: {role: 'alert'},
  warning: {role: 'alert'},
  info: {role: 'status', 'aria-live': 'polite'},
  ok: {role: 'status', 'aria-live': 'polite'},
};

const useScrollIntoView = <T extends HTMLElement = HTMLElement>(
  options: ScrollIntoViewOptions = {behavior: 'smooth'}
): React.MutableRefObject<T | null> => {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    // scrollIntoView is not available in jest-dom, and this can cause to crashing/infinitely
    // loading (integration) tests because ErrorMessage uses this hook, which is used
    // in the usual ErrorBoundary component... So, be very conservative here with the
    // scrollIntoView behaviour/expectations!
    ref.current.scrollIntoView?.(options);
  }, [ref, options]);
  return ref;
};

export interface ErrorMessageProps {
  children?: React.ReactNode;
  level?: ErrorMessageLevel;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({children, level = 'error'}) => {
  const errorRef = useScrollIntoView<HTMLDivElement>();
  if (!children) return null;
  return (
    <Alert type={level} icon={ICONS[level]} ref={errorRef} {...ARIA_TAGS[level]}>
      {children}
    </Alert>
  );
};

export {ALERT_MODIFIERS};
export default ErrorMessage;
