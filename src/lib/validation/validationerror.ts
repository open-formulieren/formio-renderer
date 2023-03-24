/**
 * Get thrown if validation fails.
 * @abstract This Error may be extended for each validator, populating the validator property.
 */
export class ValidationError extends Error {
  constructor(message = '') {
    super(message)
    this.name = 'ValidationError'
  }
}
