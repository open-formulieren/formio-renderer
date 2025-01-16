import type {RadioComponentSchema} from '@open-formulieren/types';

// in the renderer, all backend configuration options are resolved so we can narrow
// the component schema to what is the equivalent of the manual source. Due to the
// generic typing nature we can't really work with narrowed schemas, so instead we
// leverage assertions for type narrowing.
export type ManualRadioValuesSchema = Extract<
  RadioComponentSchema,
  {openForms: {dataSrc: 'manual'}}
>;

export function assertManualValues(
  componentDefinition: RadioComponentSchema
): asserts componentDefinition is ManualRadioValuesSchema {
  if (!('values' in componentDefinition)) {
    throw new TypeError('Radio component has no (resolved) values!');
  }
}
