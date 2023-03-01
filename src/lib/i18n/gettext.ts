import { I18N } from '@types'

/**
 * Returns translation for key based on locale in i18n.
 * @param {string} [key]
 * @param {I18N} [i18n]
 * @param {{[index: string]: any}} context {{ placeholder }} replacements.
 * @param {string} [locale] If omitted: an attempt is made to resolve a local from the browser.
 */
export const gettext = (
  key: string = '',
  i18n: I18N = {},
  context: { [index: string]: any } = {},
  locale: string = ''
): string => {
  const navigateLocales = navigator?.languages.map((locale) => locale.split('-')[0]) || []
  const locales = [locale, ...navigateLocales, Object.keys(i18n)[0] || '']
  const resolvedLocale = Object.keys(i18n).find((key) => locales.indexOf(key) > -1)
  const dictionary = i18n[resolvedLocale as string] || {}
  const translation = dictionary[key] || key

  // Apply context.
  return Object.entries(context).reduce(
    (compiledTranslation, [key, value]) =>
      compiledTranslation.replace(new RegExp(`{{\\s*?${key}\\s*?}}`, 'g'), String(value)),
    translation
  )
}
