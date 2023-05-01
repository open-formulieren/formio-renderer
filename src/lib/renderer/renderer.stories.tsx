import {FORMIO_EXAMPLE, FORMIO_LENGTH, FORMIO_PATTERN, FORMIO_REQUIRED} from '@fixtures';
import {DEFAULT_RENDER_CONFIGURATION, RenderComponent, RenderForm} from '@lib/renderer/renderer';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import {Formik} from 'formik';

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

export const renderForm: ComponentStory<typeof RenderForm> = args => <RenderForm {...args} />;
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
  expect(await canvas.queryByText('Motivation must have at least 20 characters.')).toBeNull();
  expect(await canvas.queryByText('Postcode must have at least 6 characters.')).toBeNull();
  expect(
    await canvas.queryByText('Postcode does not match the pattern ^\\d{4}\\s?[a-zA-Z]{2}$')
  ).toBeNull();
  expect(await canvas.queryByText('Motivation is required')).toBeNull();
  expect(await canvas.queryByText('Postcode is required')).toBeNull();
  expect(await canvas.queryByText('first name is required')).toBeNull();

  // Type invalid values in each field.
  await userEvent.type(canvas.getByLabelText(FORMIO_LENGTH.label), 'Lorem ipsum dolor', {
    delay: 30,
  });
  await canvas.findByText('Motivation must have at least 20 characters.');

  await userEvent.type(canvas.getByLabelText(FORMIO_PATTERN.label), '123A', {delay: 30});
  await canvas.findByText('Postcode does not match the pattern ^\\d{4}\\s?[a-zA-Z]{2}$');

  await userEvent.type(canvas.getByLabelText(FORMIO_REQUIRED.label), 'foo', {delay: 30});
  await userEvent.clear(canvas.getByLabelText(FORMIO_REQUIRED.label));
  await canvas.findByText('first name is required');

  // Clear values.
  await userEvent.clear(canvas.getByLabelText(FORMIO_LENGTH.label));
  await userEvent.clear(canvas.getByLabelText(FORMIO_PATTERN.label));
  await userEvent.clear(canvas.getByLabelText(FORMIO_REQUIRED.label));

  // Unpristine state should show validation errors.
  await canvas.findAllByText('Postcode must have at least 6 characters.');
  await canvas.findByText('Postcode does not match the pattern ^\\d{4}\\s?[a-zA-Z]{2}$');
  await canvas.findAllByText('Postcode is required');

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
  expect(await canvas.queryByText('Motivation must have at least 20 characters.')).toBeNull();
  expect(await canvas.queryByText('Postcode must have at least 6 characters.')).toBeNull();
  expect(
    await canvas.queryByText('Postcode does not match the pattern ^\\d{4}\\s?[a-zA-Z]{2}$')
  ).toBeNull();
  expect(await canvas.queryByText('Motivation is required')).toBeNull();
  expect(await canvas.queryByText('Postcode is required')).toBeNull();
  expect(await canvas.queryByText('first name is required')).toBeNull();
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
  expect(await canvas.queryByText('Nested input must have at least 5 characters.')).toBeNull();
  await userEvent.clear(canvas.getByLabelText('Nested input'));
  await canvas.findByText('Nested input must have at least 5 characters.');
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
    components: [
      // Reference field.
      {
        id: 'favoriteAnimal',
        type: 'textfield',
        label: 'Favorite animal',
        key: 'favoriteAnimal',
      },

      // Case: hide unless "cat"
      {
        conditional: {
          eq: 'cat',
          show: true,
          when: 'favoriteAnimal',
        },
        id: 'motivationCat',
        hidden: true,
        type: 'textfield',
        key: 'motivation',
        label: 'Motivation',
        placeholder: 'I like cats because...',
        description: 'Please motivate why "cat" is your favorite animal...',
      },

      // Case hide unless "dog"
      {
        conditional: {
          eq: 'dog',
          show: true,
          when: 'favoriteAnimal',
        },
        id: 'motivationDog',
        hidden: true,
        type: 'textfield',
        key: 'motivation',
        label: 'Motivation',
        placeholder: 'I like dogs because...',
        description: 'Please motivate why "dog" is your favorite animal...',
      },

      // Case hide unless "" (empty string)
      {
        conditional: {
          eq: '',
          show: true,
          when: 'favoriteAnimal',
        },
        id: 'content1',
        hidden: true,
        type: 'content',
        key: 'content',
        html: 'Please enter you favorite animal.',
      },

      // Case show unless "cat"
      {
        conditional: {
          eq: 'cat',
          show: false,
          when: 'favoriteAnimal',
        },
        id: 'content2',
        hidden: false,
        type: 'content',
        key: 'content',
        html: 'Have you tried "cat"?',
      },

      // Case show unless "dog"
      {
        conditional: {
          eq: 'dog',
          show: false,
          when: 'favoriteAnimal',
        },
        id: 'content3',
        hidden: false,
        type: 'content',
        key: 'content',
        html: 'Have you tried "dog"?',
      },
    ],
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
  const input = canvas.getByLabelText('Favorite animal');
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
  expect(await canvas.queryByText('Text input must have at least 5 characters.')).toBeNull();
  await userEvent.clear(canvas.getByLabelText('Text input'));
  await canvas.findByText('Text input must have at least 5 characters.');
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
  component: FORMIO_EXAMPLE[0],
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
