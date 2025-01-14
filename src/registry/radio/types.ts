import type {RadioComponentSchema as GenericRadioComponentSchema} from '@open-formulieren/types';

// in the renderer, all backend configuration options are resolved so we can narrow
// the component schema to what is the equivalent of the manual source.

type ManualRadioValuesSchema = Extract<
  GenericRadioComponentSchema,
  {openForms: {dataSrc: 'manual'}}
>;

export interface RadioComponentSchema extends Omit<ManualRadioValuesSchema, 'openForms'> {
  openForms?: ManualRadioValuesSchema['openForms'];
}
