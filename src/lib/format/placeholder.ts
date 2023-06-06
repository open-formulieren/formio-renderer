/**
 * Substitutes {{ placeholder }} with context[placeholder} in template string.
 * TODO: This might need refactoring to suit translations.
 */
export const substitute = (template: string, context: {[index: string]: any}) => {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_: string, key: string) => context[key] || '');
};
