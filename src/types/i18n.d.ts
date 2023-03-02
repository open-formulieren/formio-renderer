/**
 * Translations object, entries map locales to objects matching keys to translations.
 *
 * Example:
 *
 * ```js
 * {
 *   "nl": {
 *     "{{ count }} characters": "{{ count }} karakters"
 *   }
 * }
 * ```
 */
export interface I18N {
  [index: string]: { [index: string]: string }
}
