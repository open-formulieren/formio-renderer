import { BranchConfiguration, LeafConfiguration, TreeConfiguration } from '@types'

export abstract class Renderer {
  // @ts-ignore
  static renderTree({ callbacks, form, renderConfiguration, formErrors }: TreeConfiguration): any {}

  // @ts-ignore
  static renderBranch({
    callbacks,
    components,
    renderConfiguration,
    formErrors
  }: BranchConfiguration): any {}

  // @ts-ignore
  static renderLeaf({
    callbacks,
    component,
    components,
    formErrors,
    renderConfiguration
  }: LeafConfiguration): any {}
}
