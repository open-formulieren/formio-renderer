import {
  FORMIO_CONDITIONAL,
  FORMIO_EXAMPLE,
  FORMIO_LENGTH,
  FORMIO_PATTERN,
  FORMIO_REQUIRED,
} from '@fixtures';
import {
  DEFAULT_RENDER_CONFIGURATION,
  IRendererComponent,
  RenderComponent,
  RenderForm,
} from '@lib/renderer/renderer';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import {Formik} from 'formik';
import React from 'react';

const meta: Meta<typeof RenderForm> = {
  title: 'Usage / Renderer',
  component: RenderForm,
  decorators: [],
  parameters: {},
};
export default meta;

//
// renderForm
//

export const renderForm: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args}>
    <button type="submit">Submit</button>
  </RenderForm>
);
renderForm.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: FORMIO_EXAMPLE,
  },
  initialValues: {
    [FORMIO_EXAMPLE[0].key as string]: 'foo',
  },
};
renderForm.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.clear(canvas.getByLabelText(FORMIO_EXAMPLE[0].label));
  await userEvent.type(canvas.getByLabelText(FORMIO_EXAMPLE[0].label), 'John', {delay: 30});
  await userEvent.type(canvas.getByLabelText(FORMIO_EXAMPLE[1].label), 'Doe', {delay: 30});
  await userEvent.click(canvas.getByText('Submit'));
};
export const renderFormWithValidation: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args}>
    <button type="submit">Submit</button>
  </RenderForm>
);

renderFormWithValidation.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    // @ts-ignore
    components: [FORMIO_LENGTH, FORMIO_PATTERN, FORMIO_REQUIRED],
  },
};
renderFormWithValidation.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);

  // Pristine state should not show validation errors.
  expect(await canvas.queryByText('Er zijn te weinig karakters opgegeven.')).toBeNull();
  expect(await canvas.queryByText('Er zijn teveel karakters opgegeven.')).toBeNull();
  expect(await canvas.queryByText('De opgegeven waarde voldoet niet aan het formaat.')).toBeNull();
  expect(await canvas.queryByText('Het verplichte veld is niet ingevuld.')).toBeNull();

  // Type invalid values in each field.
  await userEvent.type(canvas.getByLabelText(FORMIO_LENGTH.label), 'Lorem ipsum dolor', {
    delay: 30,
  });
  await canvas.findByText('Er zijn te weinig karakters opgegeven.');

  await userEvent.type(canvas.getByLabelText(FORMIO_PATTERN.label), '123A', {delay: 30});
  await canvas.findByText('De opgegeven waarde voldoet niet aan het formaat.');

  await userEvent.type(canvas.getByLabelText(FORMIO_REQUIRED.label), 'foo', {delay: 30});
  await userEvent.clear(canvas.getByLabelText(FORMIO_REQUIRED.label));
  await canvas.findByText('Het verplichte veld is niet ingevuld.');

  // Clear values.
  await userEvent.clear(canvas.getByLabelText(FORMIO_LENGTH.label));
  await userEvent.clear(canvas.getByLabelText(FORMIO_PATTERN.label));
  await userEvent.clear(canvas.getByLabelText(FORMIO_REQUIRED.label));

  // Unpristine state should show validation errors.
  await canvas.findAllByText('Er zijn te weinig karakters opgegeven.');
  await canvas.findByText('De opgegeven waarde voldoet niet aan het formaat.');
  await canvas.findAllByText('Het verplichte veld is niet ingevuld.');

  // Type valid values in each field.
  await userEvent.type(
    canvas.getByLabelText(FORMIO_LENGTH.label),
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
  );
  // Maxlength on input should prevent excessive input.
  expect(await canvas.getByLabelText(FORMIO_LENGTH.label)).toHaveValue(
    'Lorem ipsum dolor sit amet, consectetur adipiscing'
  );
  await userEvent.type(canvas.getByLabelText(FORMIO_PATTERN.label), '1234AB', {delay: 30});
  await userEvent.type(canvas.getByLabelText(FORMIO_REQUIRED.label), 'foo', {delay: 30});

  // Valid values show not show validation errors.
  expect(
    await canvas.queryByText('Er zijn te weinig karakters opgegeven.')
  ).not.toBeInTheDocument();
  expect(await canvas.queryByText('Er zijn teveel karakters opgegeven.')).not.toBeInTheDocument();
  expect(
    await canvas.queryByText('De opgegeven waarde voldoet niet aan het formaat.')
  ).not.toBeInTheDocument();
  expect(await canvas.queryByText('Het verplichte veld is niet ingevuld.')).not.toBeInTheDocument();
};
renderFormWithValidation.decorators = [
  Story => (
    <Formik
      initialValues={{
        [FORMIO_LENGTH.key]: '',
        [FORMIO_PATTERN.key]: '',
        [FORMIO_REQUIRED.key]: '',
      }}
      onSubmit={() => {}}
    >
      {Story()}
    </Formik>
  ),
];

export const renderFormWithNestedKeyValidation: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args}>
    <button type="submit">Submit</button>
  </RenderForm>
);
renderFormWithNestedKeyValidation.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: [
      {type: 'textfield', key: 'nested.textfield', label: 'Nested input', validate: {minLength: 5}},
    ],
  },
  initialValues: {
    nested: {
      textfield: 'foobar',
    },
  },
};
renderFormWithNestedKeyValidation.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);

  // Pristine state should not show validation errors.
  expect(await canvas.queryByText('Er zijn te weinig karakters opgegeven.')).toBeNull();
  await userEvent.clear(canvas.getByLabelText('Nested input'));
  await canvas.findByText('Er zijn te weinig karakters opgegeven.');
};

export const renderFormWithConditionalLogic: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args}>
    <button type="submit">Submit</button>
  </RenderForm>
);
renderFormWithConditionalLogic.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: FORMIO_CONDITIONAL,
  },
  initialValues: {
    favoriteAnimal: '',
    motivationCat: '',
    motivationDog: '',
    content: '',
  },
};
renderFormWithConditionalLogic.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = canvas.getByLabelText('Favorite animal', {
    selector: 'input',
  });
  expect(
    await canvas.queryByText('Please motivate why "cat" is your favorite animal...')
  ).toBeNull();
  expect(
    await canvas.queryByText('Please motivate why "dog" is your favorite animal...')
  ).toBeNull();
  await canvas.findByText('Please enter you favorite animal.');
  await canvas.findByText('Have you tried "cat"?');
  await canvas.findByText('Have you tried "dog"?');
  await userEvent.type(input, 'horse', {delay: 30});
  expect(
    await canvas.queryByText('Please motivate why "cat" is your favorite animal...')
  ).toBeNull();
  expect(
    await canvas.queryByText('Please motivate why "dog" is your favorite animal...')
  ).toBeNull();
  expect(await canvas.queryByText('Please enter you favorite animal.')).toBeNull();
  await canvas.findByText('Have you tried "cat"?');
  await canvas.findByText('Have you tried "dog"?');
  await userEvent.clear(input);
  await userEvent.type(input, 'cat', {delay: 30});
  await canvas.findByText('Please motivate why "cat" is your favorite animal...');
  expect(
    await canvas.queryByText('Please motivate why "dog" is your favorite animal...')
  ).toBeNull();
  expect(await canvas.queryByText('Please enter you favorite animal.')).toBeNull();
  expect(await canvas.queryByText('Have you tried "cat"?')).toBeNull();
  await canvas.findByText('Have you tried "dog"?');
  await userEvent.clear(input);
  await userEvent.type(input, 'dog', {delay: 30});
  expect(
    await canvas.queryByText('Please motivate why "cat" is your favorite animal...')
  ).toBeNull();
  await canvas.findByText('Please motivate why "dog" is your favorite animal...');
  expect(await canvas.queryByText('Please enter you favorite animal.')).toBeNull();
  await canvas.findByText('Have you tried "cat"?');
  expect(await canvas.queryByText('Have you tried "dog"?')).toBeNull();
  await userEvent.clear(input);
  expect(
    await canvas.queryByText('Please motivate why "cat" is your favorite animal...')
  ).toBeNull();
  expect(
    await canvas.queryByText('Please motivate why "dog" is your favorite animal...')
  ).toBeNull();
  await canvas.findByText('Please enter you favorite animal.');
  await canvas.findByText('Have you tried "cat"?');
  await canvas.findByText('Have you tried "dog"?');
};

export const formValidationWithLayoutComponent: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args}>
    <button type="submit">Submit</button>
  </RenderForm>
);
formValidationWithLayoutComponent.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: [
      {
        type: 'fieldset',
        key: 'fieldset',
        label: 'Fieldset',
        components: [
          {
            type: 'textfield',
            key: 'textfield',
            label: 'Text input',
            validate: {minLength: 5},
          },
        ],
      },
    ],
  },
  initialValues: {
    textfield: 'foobar',
  },
};
formValidationWithLayoutComponent.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);

  // Pristine state should not show validation errors.
  expect(await canvas.queryByText('Er zijn te weinig karakters opgegeven.')).toBeNull();
  await userEvent.clear(canvas.getByLabelText('Text input'));
  await canvas.findByText('Er zijn te weinig karakters opgegeven.');
};

//
// renderComponent
//

export const renderComponent: ComponentStory<typeof RenderComponent> = args => (
  <RenderComponent {...args}>
    <button type="submit">Submit</button>
  </RenderComponent>
);
renderComponent.args = {
  component: FORMIO_EXAMPLE[0] as IRendererComponent,
  form: {
    display: 'form',
    components: FORMIO_EXAMPLE,
  },
};
renderComponent.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.clear(canvas.getByLabelText(FORMIO_EXAMPLE[0].label));
  await userEvent.type(canvas.getByLabelText(FORMIO_EXAMPLE[0].label), 'John');
};
renderComponent.decorators = [
  Story => (
    <Formik
      initialValues={{
        [FORMIO_EXAMPLE[0].key as string]: '',
      }}
      onSubmit={() => {}}
    >
      {Story()}
    </Formik>
  ),
];
