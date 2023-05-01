/**
 * Returns a Promise wrapped `setTimeout`, pushing "then" handler on the event loop queue,
 * optionally delayed by `milliseconds`.
 *
 * @example
 * // Execute after current items in event loop queue have been executed.
 * await delay();
 * // (Delayed code)
 *
 * @example
 * // Execute after 300 milliseconds.
 * await delay(300);
 * // (Delayed code)
 */
export const delay = (milliseconds: number = 0): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, milliseconds));
