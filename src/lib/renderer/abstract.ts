import { BranchConfiguration, LeafConfiguration, TreeConfiguration } from '@types'

export abstract class Renderer {
  // @ts-ignore
  static renderTree({ form, renderConfiguration, callbacks }: TreeConfiguration): any {}

  // @ts-ignore
  static renderBranch({ components, renderConfiguration, callbacks }: BranchConfiguration): any {}

  // @ts-ignore
  static renderLeaf({
    component,
    components,
    renderConfiguration,
    callbacks
  }: LeafConfiguration): any {}
}
