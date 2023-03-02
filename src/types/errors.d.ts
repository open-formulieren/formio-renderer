/**
 * Form errors object, entries map component key to string[] containing error messages.
 *
 * Example:
 *
 * ```js
 * {
 *   "textField1": [
 *     "De opgegeven waarde voldoet niet aan het formaat: banaan",
 *     "Het verplichte veld tekstveld is niet ingevuld."
 *   ]
 * }
 * ```
 */ export interface FormErrors {
  [index: string]: string[]
}

export type ComponentErrors = string[]
