import { Component } from '@types'

/**
 * Finds the components identified by needleKeys in components recursively.
 * @param {string[]} needleKeys
 * @param {{[index: string]: any}[]} haystack
 * @return {Component[]}
 */
export const getComponents = (
  needleKeys: string[],
  haystack: { [index: string]: any }[]
): (Component | null)[] => {
  return needleKeys.map((needleKey: string) => getComponent(needleKey, haystack))
}

/**
 * Finds the component identified by needleKey in haystack recursively.
 * @param {string} needleKey
 * @param {{[index: string]: any}[]} haystack
 * @return {Component|null}
 */
const getComponent = (
  needleKey: string,
  haystack: { [index: string]: any }[] = []
): Component | null => {
  for (const c of haystack) {
    if (c.key === needleKey) {
      return c
    } else if (c.columns) {
      return getComponent(needleKey, c.columns)
    } else if (c.components) {
      return getComponent(needleKey, c.components)
    }
  }
  return null
}
