import {DEFAULT_RENDER_CONFIGURATION, RenderForm} from '@lib/renderer';
import {DEFAULT_VALIDATORS, Validator} from '@lib/validation';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import {IComponentProps} from '@types';
import React from 'react';

const meta: Meta<typeof RenderForm> = {
  title: 'Usage / Configuration / Custom Components',
  component: RenderForm,
  decorators: [],
  parameters: {},
};
export default meta;

const VALIDATORS = DEFAULT_VALIDATORS.map(([fn, mssg], index): Validator => {
  if (index === 3) {
    return [fn, 'Vul het verplichte veld in'];
  }
  return [fn, mssg];
});

const BootstrapInput: React.FC<IComponentProps> = ({callbacks, component, errors, value}) => (
  <>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ"
      crossOrigin="anonymous"
    />
    <label className="form-label" htmlFor="firstName">
      {component.label}
    </label>
    <div className={`input-group${errors.length ? ' has-validation' : ''}`}>
      <input
        id="firstName"
        type="text"
        className={`form-control${errors.length ? ' is-invalid' : ''}`}
        name={component.key}
        value={String(value || '')}
        {...callbacks}
      />

      {errors.map((error, i) => (
        <div key={i} className="invalid-feedback">
          {error.message}
        </div>
      ))}
    </div>
  </>
);

export const renderFormWithCustomComponent: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
renderFormWithCustomComponent.args = {
  configuration: {
    ...DEFAULT_RENDER_CONFIGURATION,
    components: {
      textfield: BootstrapInput,
    },
    validators: VALIDATORS,
  },
  form: {
    display: 'form',
    components: [
      {
        type: 'textfield',
        key: 'firstName',
        label: 'First name',
        validate: {
          required: true,
        },
      },
    ],
  },
};
renderFormWithCustomComponent.play = async ({canvasElement}) => {
  // Context.
  const canvas = within(canvasElement);
  const input = canvas.getByLabelText('First name');

  // Assert rendered component is configured (Bootstrap) component.
  expect(input.classList).toContain('form-control');

  // Assert rendered component shows no error when invalid and pristine.
  await userEvent.clear(input);
  expect(await canvas.queryByText('Vul het verplichte veld in')).toBeNull();

  // Assert rendered component shows no error when valid.
  await userEvent.type(input, 'John', {delay: 30});
  expect(await canvas.queryByText('Vul het verplichte veld in')).toBeNull();

  // Assert rendered component shows error when invalid.
  await userEvent.clear(input);
  expect(await canvas.findByText('Vul het verplichte veld in')).toBeVisible();

  // Assert rendered component removes error when valid.
  await userEvent.type(input, 'John', {delay: 30});
  expect(await canvas.queryByText('Vul het verplichte veld in')).toBeNull();
};
