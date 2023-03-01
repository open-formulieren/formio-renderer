import { gettext } from '../i18n'
import { Component, I18N } from '@types'
import { ValidateOptions } from 'formiojs'

/**
 * Runs all frontend validators based on validate.
 * @param {boolean|number|string} value
 * @param {Component} component
 * @param {I18N} i18n
 * @throws {ValidationError[]} As promise rejection if invalid.
 * @return {Promise<boolean>} Promise for true if valid.
 */
export const validate = async (
  value: boolean | number | string,
  component: Component,
  i18n: I18N = {}
): Promise<boolean | void> => {
  const { maxLength, minLength, pattern, required } = component.validate as ValidateOptions
  const errors: ValidationError[] = []

  const c = (e: ValidationError) => errors.push(e)
  const ctx = { ...component.validate, field: gettext(component.label, i18n).toLowerCase() }

  const promises = [
    await validateMaxLength(value, maxLength as number, gettext('maxLength', i18n, ctx)).catch(c),
    await validateMinLength(value, minLength as number, gettext('minLength', i18n, ctx)).catch(c),
    await validatePattern(value, pattern as string, gettext('pattern', i18n, ctx)).catch(c),
    await validateRequired(value, required as boolean, gettext('required', i18n, ctx)).catch(c)
  ]

  return Promise.all(promises).then(() => {
    if (errors.length) {
      return Promise.reject(errors)
    }
    return Promise.resolve(true)
  })
}

/**
 * Get thrown if validation fails.
 */
export class ValidationError extends Error {
  constructor(message = '') {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validates whether stringified value is at most maxLength characters.
 * @param {boolean|number|string} value Value to check.
 * @param {number|string} maxLength Maximum length.
 * @param {string} message Message to show when invalid.
 * @throws {MaxLengthValidationError} As promise rejection if invalid.
 * @return {Promise<boolean>} Promise for true if valid.
 */
export const validateMaxLength = async (
  value: boolean | number | string,
  maxLength: number | string,
  message: string
): Promise<boolean> => {
  const length = String(value).length
  const limit = parseInt(maxLength as string)
  const valid = Boolean(isNaN(limit) || length <= limit)

  if (!valid) {
    throw new MaxLengthValidationError(message)
  }
  return valid
}

export class MaxLengthValidationError extends ValidationError {
  validator = 'maxLength'
}

/**
 * Validates whether stringified value is at least minLength characters.
 * @param {boolean|number|string} value Value to check.
 * @param {number|string} minLength Minimum length.
 * @param {string} message Message to show when invalid.
 * @throws {MinLengthValidationError} As promise rejection if invalid.
 * @return {Promise<boolean>} Promise for true if valid.
 */
export const validateMinLength = async (
  value: boolean | number | string,
  minLength: number | string,
  message: string
): Promise<boolean> => {
  const length = String(value).length
  const limit = parseInt(minLength as string)
  const valid = Boolean(isNaN(limit) || length >= limit)

  if (!valid) {
    throw new MinLengthValidationError(message)
  }
  return valid
}

export class MinLengthValidationError extends ValidationError {
  validator = 'minLength'
}

/**
 * Validates whether stringified value matches a (RegExp) pattern.
 * @param {boolean|number|string} value Value to check.
 * @param {RegExp|string} pattern Regular expression.
 * @param {string} message Message to show when invalid.
 * @throws {PatternValidationError} As promise rejection if invalid.
 * @return {Promise<boolean>} Promise for true if valid.
 */
export const validatePattern = async (
  value: boolean | number | string,
  pattern: RegExp | string,
  message: string
): Promise<boolean> => {
  const valid = Boolean(!pattern || String(value).match(pattern))
  if (!valid) {
    throw new PatternValidationError(message)
  }
  return valid
}

export class PatternValidationError extends ValidationError {
  validator = 'pattern'
}

/**
 * Validates whether value is truthy and required is true.
 * @param {boolean|number|string} value Value to check.
 * @param {boolean} required
 * @param {string} message Message to show when invalid.
 * @throws {RequiredValidationError} As promise rejection if invalid.
 * @return {Promise<boolean>} Promise for true if valid.
 */
export const validateRequired = async (
  value: boolean | number | string,
  required: boolean,
  message: string
): Promise<boolean> => {
  const valid = Boolean(!required || value)
  if (!valid) {
    throw new RequiredValidationError(message)
  }
  return valid
}

export class RequiredValidationError extends ValidationError {
  validator = 'required'
}
