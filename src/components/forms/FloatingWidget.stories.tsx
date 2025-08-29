import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, waitFor, within} from 'storybook/test';

import {FloatingWidget, useFloatingWidget} from './FloatingWidget';

export default {
  render: () => <FloatingWidgetExample />,
  title: 'Internal API / Forms / FloatingWidget',
  component: FloatingWidget,
  parameters: {
    controls: {hideNoControlsWarning: true},
  },
} satisfies Meta<typeof FloatingWidget>;

type Story = StoryObj<typeof FloatingWidget>;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const waitForFocus = async (element: Element) => {
  await waitFor(() => expect(element).toHaveFocus());
};

const FloatingWidgetExample = () => {
  const {
    refs,
    floatingStyles,
    context,
    getFloatingProps,
    getReferenceProps,
    isOpen,
    setIsOpen,
    arrowRef,
  } = useFloatingWidget();
  return (
    <>
      <div>
        <label htmlFor="reference">Reference</label>
        <input
          name="reference"
          type="text"
          id="reference"
          defaultValue=""
          ref={refs.setReference}
          data-testid="reference"
          {...getReferenceProps()}
        />
        <FloatingWidget
          isOpen={isOpen}
          context={context}
          setFloating={refs.setFloating}
          floatingStyles={floatingStyles}
          getFloatingProps={getFloatingProps}
          arrowRef={arrowRef}
          data-testid="floating-widget"
        >
          <div style={{padding: '1em'}}>
            <p>Floating widget content</p>
            <p>
              <input name="widgetInput" defaultValue="" data-testid="widget-input" />
              <button onClick={() => setIsOpen(false, {keepDismissed: true})}>close</button>
            </p>
          </div>
        </FloatingWidget>
      </div>
      <div>
        <label htmlFor="other-input">Other input</label>
        <input
          name="otherInput"
          type="text"
          id="other-input"
          defaultValue=""
          data-testid="other-input"
        />
      </div>
    </>
  );
};

export const Default: Story = {};

export const FocusReferenceInput: Story = {
  name: 'Focus reference input',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    expect(await canvas.queryByRole('dialog')).toBeNull();
    await userEvent.click(canvas.getByText('Reference'));
    const reference = canvas.getByTestId('reference');
    await waitForFocus(reference);
    expect(canvas.getByRole('dialog')).toBeVisible();
  },
};

export const TypingClosesWidget: Story = {
  name: 'Type in reference input closes widget',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    expect(await canvas.queryByRole('dialog')).toBeNull();
    const reference = canvas.getByTestId('reference');
    await reference.focus();
    expect(canvas.getByRole('dialog')).toBeVisible();
    await userEvent.type(reference, 'Some input');
    expect(await canvas.queryByRole('dialog')).toBeNull();
  },
};

export const DismissAndReopenWithClick: Story = {
  name: 'Dismiss widget and re-open with click',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const reference = canvas.getByTestId('reference');
    await userEvent.click(reference);
    await waitForFocus(reference);
    expect(canvas.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('[Escape]');
    expect(canvas.queryByRole('dialog')).toBeNull();
    await waitForFocus(reference);
    await userEvent.click(reference);
    await waitForFocus(reference);
    expect(canvas.getByRole('dialog')).toBeVisible();
  },
};

export const TabNavigateToNestedInput: Story = {
  name: 'Tab navigate to widget input',
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    await step('open widget', async () => {
      const reference = canvas.getByTestId('reference');
      await userEvent.click(reference);
      expect(canvas.getByRole('dialog')).toBeVisible();

      const widgetInput = await canvas.findByTestId('widget-input');
      expect(widgetInput).toBeVisible();
      // reference still needs to have focus after the widget is opened
      expect(reference).toHaveFocus();
    });

    // tests are flaky on CI... :(
    await sleep(50);

    await step('focus input inside widget', async () => {
      await userEvent.tab();
      // widget still open and input (still) visible
      expect(canvas.getByRole('dialog')).toBeVisible();
      const widgetInput = await canvas.findByTestId('widget-input');
      expect(widgetInput).toBeVisible();
      // tabbing should have moved the focus from reference to content
      expect(widgetInput).toHaveFocus();
    });
  },
};

export const SubmitWidgetClosesWidget: Story = {
  name: 'Submit widget and close widget',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const reference = canvas.getByTestId('reference');
    await userEvent.click(reference);
    expect(canvas.getByRole('dialog')).toBeVisible();
    const button = canvas.getByRole('button', {name: 'close'});
    expect(button).toBeVisible();
    await userEvent.click(button);
    expect(canvas.queryByRole('dialog')).toBeNull();
    await waitForFocus(reference);
  },
};

export const FocusOtherInputClosesWidget: Story = {
  name: 'Focus other input closes widget',
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    await step('open widget', async () => {
      const reference = canvas.getByTestId('reference');
      await userEvent.click(reference);
      expect(canvas.getByRole('dialog')).toBeVisible();
      expect(reference).toHaveFocus(); // because it was clicked
    });

    // tests are flaky on CI... :(
    await sleep(50);

    await step('focus widget input', async () => {
      const widgetInput = await canvas.findByTestId('widget-input');
      expect(widgetInput).toBeVisible();
      await userEvent.tab();
      expect(widgetInput).toHaveFocus();
    });

    // tests are flaky on CI... :(
    await sleep(50);

    await step('focus button', async () => {
      const button = await canvas.findByRole('button');
      expect(button).toBeVisible();
      await userEvent.tab();
      expect(button).toHaveFocus();
    });

    // tests are flaky on CI... :(
    await sleep(50);

    await step('Focus input outside widget', async () => {
      await userEvent.tab();
      await waitFor(() => {
        expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    // tests are flaky on CI... :(
    await sleep(50);

    expect(canvas.getByTestId('other-input')).toHaveFocus();
  },
};
