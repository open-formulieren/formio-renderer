import { createRef, RefObject, useEffect } from 'react'

/**
 * The `ref="html"` HTML attribute is required for backwards compatibility but clashes with React
 * in strict mode as it required as string ref. This hook sets the HTML attribute on the current
 * node bypassing the check.
 */
export function useHTMLRef<T>(ref: string): RefObject<T> {
  const elementRef = createRef<T>()

  useEffect(() => {
    const current = elementRef.current as unknown as HTMLElement
    current?.setAttribute('ref', ref)
    return () => current?.removeAttribute('ref')
  }, [elementRef])

  return elementRef
}
