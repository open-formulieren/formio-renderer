import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {expect, userEvent, within} from 'storybook/test';

import DynamicFormattedMessage from './DynamicFormattedMessage';

export default {
  title: 'Internal API / DynamicFormattedMessage',
  component: DynamicFormattedMessage,
  args: {
    description: 'An internal description of the message',
    defaultMessage: 'The message that we will show the world',
  },
} satisfies Meta<typeof DynamicFormattedMessage>;

type Story = StoryObj<typeof DynamicFormattedMessage>;

export const Default: Story = {
  args: {
    description: 'An internal description of the message',
    defaultMessage: 'The message that we will show the world',
  },
};

export const DynamicMessage: Story = {
  render: args => {
    const [dynamicMessage, setDynamicMessage] = useState<string>(args.defaultMessage as string);
    return (
      <>
        <p>
          <input
            style={{width: '500px'}}
            value={dynamicMessage}
            onChange={event => setDynamicMessage(event.target.value)}
          />
        </p>
        <div data-testid="messageContainer">
          <DynamicFormattedMessage description={args.description} defaultMessage={dynamicMessage} />
        </div>
      </>
    );
  },
  args: {
    description: 'a dynamic message',
    defaultMessage: 'Some boring initial message',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByRole('textbox');
    const messageContainer = canvas.getByTestId('messageContainer');

    expect(messageContainer).toHaveTextContent('Some boring initial message');

    await userEvent.clear(textField);
    await userEvent.type(textField, 'Some awesome dynamic message');

    expect(messageContainer).toHaveTextContent('Some awesome dynamic message');
  },
};

export const RichTextInMessage: Story = {
  args: {
    description: 'message with rich content',
    defaultMessage: '<p>Hello there, <b>general</b> <u>kenobi</u>.</p>',
  },
};

export const ResolvingVariables: Story = {
  render: args => {
    const [dynamicValue, setDynamicValue] = useState('');
    return (
      <>
        <p>
          <input
            style={{width: '500px'}}
            value={dynamicValue}
            onChange={event => setDynamicValue(event.target.value)}
          />
        </p>
        <div data-testid="messageContainer">
          <DynamicFormattedMessage
            description={args.description}
            defaultMessage={args.defaultMessage}
            values={{
              ...args.values,
              dynamicValue,
            }}
          />
        </div>
      </>
    );
  },
  args: {
    description: 'message with variables',
    defaultMessage:
      '<p>Our message can contain both static and dynamic variables, which is pretty cool. Check it out:</p>' +
      '<p>staticVariable1: {staticVariable1}</p>' +
      '<p>staticVariable2: {staticVariable2}</p>' +
      '<p>staticVariable3: {staticVariable3}</p>' +
      '<p>dynamicValue: {dynamicValue}</p>',
    values: {
      staticVariable1: 'awesome variable',
      staticVariable2: 121,
      staticVariable3: ['even ', 'lists ', 'are ', 'allowed'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByRole('textbox');
    const messageContainer = canvas.getByTestId('messageContainer');

    // Check that our static variables are rendered.
    expect(messageContainer).toHaveTextContent('staticVariable1: awesome variable');
    expect(messageContainer).toHaveTextContent('staticVariable2: 121');
    expect(messageContainer).toHaveTextContent('staticVariable3: even lists are allowed');

    const DYNAMIC_MESSAGE_TO_SEARCH = 'I am a dynamic message, cool huh :)';

    // Our dynamic message shouldn't be shown just yet
    expect(messageContainer).not.toHaveTextContent(DYNAMIC_MESSAGE_TO_SEARCH);

    // Dynamically set the dynamic message
    await userEvent.type(textField, DYNAMIC_MESSAGE_TO_SEARCH);

    // Expect the dynamic message to be shown
    expect(messageContainer).toHaveTextContent(DYNAMIC_MESSAGE_TO_SEARCH);
  },
};

const SimpleReactComponent = ({color, message}: {color: string; message: string}) => (
  <p data-testid="simpleReactComponent-message" style={{color}}>
    {message}
  </p>
);

const ReactComponentWithCounter = () => {
  const [counter, setCounter] = useState(0);

  return (
    <>
      <button onClick={() => setCounter(current => current + 1)}>Click me!</button>
      <span data-testid="simpleReactComponent-counter" style={{marginInlineStart: '4px'}}>
        You clicked the button {counter} times!
      </span>
    </>
  );
};

export const RichVariables: Story = {
  args: {
    description: 'message with react variables',
    defaultMessage:
      '<p>Our messages can contain some wicked variables, check it out</p>' +
      '{inlineRichVariable}' +
      '{simpleReactComponent}' +
      '{reactCounterComponent}',
    values: {
      inlineRichVariable: (
        <p data-testid="inlineRichVariable" style={{color: 'rebeccapurple'}}>
          hello, i'm an inline rich variable
        </p>
      ),
      simpleReactComponent: (
        <SimpleReactComponent color="cadetblue" message="I'm a React component!" />
      ),
      reactCounterComponent: <ReactComponentWithCounter />,
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Expect the two messages to have been rendered
    expect(await canvas.getByTestId('inlineRichVariable')).toHaveTextContent(
      "hello, i'm an inline rich variable"
    );
    expect(await canvas.getByTestId('simpleReactComponent-message')).toHaveTextContent(
      "I'm a React component!"
    );

    const button = canvas.getByRole('button', {name: 'Click me!'});
    const counter = canvas.getByTestId('simpleReactComponent-counter');

    // The counter should start at 0
    expect(counter).toHaveTextContent('You clicked the button 0 times!');

    await userEvent.click(button);

    // After clicking the button, the counter should have been updated
    expect(counter).toHaveTextContent('You clicked the button 1 times!');
  },
};
