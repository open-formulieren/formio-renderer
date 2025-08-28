import type {SelectComponentSchema} from '@open-formulieren/types';

// in the renderer, all backend configuration options are resolved so we can narrow
// the component schema to what is the equivalent of the manual source. Due to the
// generic typing nature we can't really work with narrowed schemas, so instead we
// leverage assertions for type narrowing.
export type ManualSelectValuesSchema = Extract<
  SelectComponentSchema,
  {openForms: {dataSrc: 'manual'}}
>;

export function assertManualValues(
  componentDefinition: SelectComponentSchema
): asserts componentDefinition is ManualSelectValuesSchema {
  if (!('data' in componentDefinition) || !('values' in componentDefinition.data)) {
    throw new TypeError('Selectboxes component has no (resolved) values!');
  }
}
