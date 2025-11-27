import type {AnyComponentSchema} from '@open-formulieren/types';
import type {StoryContext} from '@storybook/react-vite';
import {userEvent, within} from 'storybook/test';

import {PrimaryActionButton} from '@/components/Button';
import type {FormioFormProps} from '@/components/FormioForm';
import FormioForm from '@/components/FormioForm';
import type {JSONObject} from '@/types';

export interface RenderArgs {
  componentDefinition: AnyComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
  values?: JSONObject;
}

export const renderComponentInForm = (args: RenderArgs, context?: StoryContext<unknown>) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      rowGap: '20px',
    }}
  >
    <FormioForm
      onSubmit={args.onSubmit}
      components={[args.componentDefinition]}
      values={args.values}
      id="formio-form"
      requiredFieldsWithAsterisk
      componentParameters={context?.parameters?.formSettings?.componentParameters}
      validatePluginCallback={context?.parameters?.formSettings?.validatePluginCallback}
    />
    <PrimaryActionButton type="submit" form="formio-form" style={{alignSelf: 'flex-start'}}>
      Submit
    </PrimaryActionButton>
  </div>
);

/**
 * Wrapper to retrieve the selected value of a react-select component
 *
 * @param input - The input element associated with the react-select component.
 */
export const rsValue = (input: HTMLElement): string => {
  return input.closest('.openforms-rs')?.querySelector('.rs-value')?.textContent ?? '';
};

/**
 * Wrapper to select an option in a react-select component
 *
 * @param input - The input element associated with the react-select component.
 * @param option - The option to select.
 */
export const rsSelect = async (input: HTMLElement, option: string): Promise<void> => {
  const rsContainer = input.closest('.openforms-rs') as HTMLElement;
  // Open the dropdown menu
  await userEvent.click(input);
  const dropdownMenu = within(await within(rsContainer).findByRole('listbox'));
  // Click the dropdown option
  await userEvent.click(await dropdownMenu.findByRole('option', {name: option}));
};
