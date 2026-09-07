import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';

import Tooltip from './Tooltip';

export default {
  title: 'Internal API / Forms / Tooltip',
  component: Tooltip,
  args: {
    children: 'Escaped text inside the <strong>tooltip</strong>',
  },
} satisfies Meta<typeof Tooltip>;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {};

export const DefaultPlacement: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.keyboard('[Tab]');
    expect(
      await canvas.findByText('Escaped text inside the <strong>tooltip</strong>')
    ).toBeVisible();
  },
};

export const PlacementRight: Story = {
  ...DefaultPlacement,
  decorators: [
    Story => (
      <div style={{display: 'flex', justifyContent: 'end'}}>
        <Story />
      </div>
    ),
  ],
};

export const LongTooltipContent: Story = {
  args: {
    children: `Danish sesame snaps soufflé candy cake. Wafer bonbon pudding liquorice
      cake cake jujubes. Dessert fruitcake dessert caramels muffin lemon drops croissant
      macaroon. Candy marzipan muffin cake jujubes tootsie roll lollipop. Cookie biscuit
      cake donut bonbon. Marshmallow sugar plum apple pie lemon drops lemon drops. Pie
      donut pie pastry chocolate biscuit wafer icing wafer. Biscuit shortbread tiramisu
      tiramisu gummies sweet sesame snaps. Fruitcake tart muffin dessert lollipop
      lollipop. Cupcake pie pie pie donut topping muffin jujubes. Pudding apple pie
      shortbread danish candy canes gummies. Caramels brownie lemon drops jelly beans
      powder danish candy canes. Sweet roll gingerbread croissant tiramisu cupcake.`,
  },
  // The interaction only triggers the tooltip so we can make chromatic snapshots.
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.keyboard('[Tab]');
    expect(
      await canvas.findByText('Danish sesame snaps soufflé candy cake.', {exact: false})
    ).toBeVisible();
  },
};

export const LongUnbrokenTooltipContent: Story = {
  args: {
    children:
      'DanishsesamesnapssoufflécandycakeWaferbonbonpuddingliquoricecakecakejujubesDessertfruitcakedessertcaramelsmuffinlemondropscroissantmacaroonCandymarzipanmuffincakejujubestootsierolllollipopCookiebiscuitcakedonutbonbonMarshmallowsugarplumapplepielemondropslemondropsPiedonutpiepastrychocolatebiscuitwafericingwaferBiscuitshortbreadtiramisutiramisugummiessweetsesamesnapsFruitcaketartmuffindessertlollipoplollipopCupcakepiepiepiedonuttoppingmuffinjujubesPuddingapplepieshortbreaddanishcandycanesgummiesCaramelsbrownielemondropsjellybeanspowderdanishcandycanesSweetrollgingerbreadcroissanttiramisucupcakecake',
  },
  // The interaction only triggers the tooltip so we can make chromatic snapshots.
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.keyboard('[Tab]');
    expect(
      await canvas.findByText('Danishsesamesnapssoufflécandycake', {exact: false})
    ).toBeVisible();
  },
};
