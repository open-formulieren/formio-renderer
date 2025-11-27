import type {GeoJsonGeometry, MapComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import type {FormSettings} from '@/context';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';
import MockProvider, {withMapLayout} from '@/tests/map';

import {FormioMap} from '.';
import {renderComponentInForm} from '../storybook-helpers';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / custom / map',
  component: FormioMap,
  decorators: [withMapLayout, withFormSettingsProvider, withFormik],
} satisfies Meta<typeof FormioMap>;

type Story = StoryObj<typeof FormioMap>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          map: null,
        },
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
      tooltip: 'Tooltip placeholder',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        map: null,
      },
    },
  },
};

export const WithPoint: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
      interactions: {
        marker: true,
        polygon: false,
        polyline: false,
      },
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          map: {
            type: 'Point',
            coordinates: [5.291266, 52.1326332],
          },
        },
      },
    },
  },
};

export const WithPolygon: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          map: {
            type: 'Polygon',
            coordinates: [
              [
                [5.291266, 52.1326332],
                [5.091266, 52.128332],
                [5.591266, 52.48332],
              ],
            ],
          },
        },
      },
    },
  },
};

export const WithLine: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          map: {
            type: 'LineString',
            coordinates: [
              [4.7493255, 52.6405471],
              [4.6493255, 52.4405471],
              [4.5493255, 52.2405471],
            ],
          },
        },
      },
    },
  },
};

export const WithAllInteractions: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
      interactions: {
        marker: true,
        polygon: true,
        polyline: true,
      },
    },
  },
  parameters: {
    formik: {
      initialValues: null,
    },
  },
};

export const DeleteButton: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      interactions: {
        marker: false,
        polygon: true,
        polyline: false,
      },
      label: 'A map',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          map: {
            type: 'Point',
            coordinates: [5.291266, 52.1326332],
          },
        },
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    expect(await within(map).findByRole('button', {name: 'Marker'})).toBeVisible();

    // The delete button is shown in the map, and is enabled.
    const deleteButton = await within(map).findByRole('link', {name: 'Remove shapes'});
    expect(deleteButton).toBeVisible();
    expect(deleteButton).toBeEnabled();

    await step('delete marker', async () => {
      // Automatically resolve the confirmation message
      window.confirm = () => true;
      await userEvent.click(deleteButton);
    });

    await step('Check that no marker is visible and delete button is disabled', async () => {
      // Expect marker to no-longer be visible.
      await waitFor(async () => {
        const marker = within(map).queryByRole('button', {name: 'Marker'});
        expect(marker).toBeNull();
      });

      expect(deleteButton).toHaveAttribute('title', 'No shapes to remove');
      expect(deleteButton).toHaveClass('leaflet-disabled');
    });
  },
};

const searchProvider = new MockProvider();

export const WithAddressLookup: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
      interactions: {
        marker: true,
        polygon: false,
        polyline: false,
      },
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          map: {
            type: 'Point',
            coordinates: [5.291266, 52.1326332],
          },
        },
      },
    },
    formSettings: {
      componentParameters: {
        map: {
          mapNearestLookup: async () => ({
            label: 'Right here',
          }),
          searchProvider,
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
};

export const WithSearch: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
      interactions: {
        marker: true,
        polygon: false,
        polyline: false,
      },
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          map: null,
        },
      },
    },
    formSettings: {
      componentParameters: {
        map: {
          mapNearestLookup: async () => ({
            label: 'Right here',
          }),
          searchProvider,
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');
    searchProvider.mockResults = [
      {
        label: 'Utrecht, Utrecht, Utrecht',
        latLng: {
          lat: 52.0886922,
          lng: 5.09520363,
        },
        rd: {
          x: 134987.52,
          y: 455643.648,
        },
      },
    ];

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    await step('None of the interactions are shown', async () => {
      const pin = canvas.queryByTitle('Marker');
      const polygon = canvas.queryByTitle('Shape (polygon)');
      const line = canvas.queryByTitle('Line');

      expect(pin).not.toBeInTheDocument();
      expect(polygon).not.toBeInTheDocument();
      expect(line).not.toBeInTheDocument();
    });

    await step('Use the search input', async () => {
      await waitFor(async () => {
        const button = await canvas.findByLabelText('Map component search button');
        await userEvent.click(button);
        expect(await canvas.findByPlaceholderText('Enter address, please')).toBeVisible();
      });

      const searchField = await canvas.findByPlaceholderText('Enter address, please');
      const searchBox = within(searchField.parentElement!);
      await userEvent.type(searchField, 'Gemeente Utrecht');
      const searchResult = await searchBox.findByText('Utrecht, Utrecht, Utrecht');

      await userEvent.click(searchResult);

      const buttons = await canvas.findAllByRole('button', {name: 'Marker'});
      // The interactive marker, seen while hovering over the map
      expect(buttons[0]).toBeVisible();
      // The pinned marker, indicating the current value
      expect(buttons[1]).toBeVisible();
    });
  },
};

export const WithAerialPhotoBackground: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
      interactions: {
        marker: true,
        polygon: false,
        polyline: false,
      },
      tileLayerUrl:
        'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/EPSG:28992/{z}/{x}/{y}.png',
    },
  },
};

export const WithOverlays: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'Map',
      interactions: {
        marker: false,
        polygon: true,
        polyline: false,
      },
      overlays: [
        {
          uuid: 'f20448c3-a8cb-471c-bfcc-78a6c22d0ae6',
          url: 'https://service.pdok.nl/bzk/bro-grondwaterspiegeldiepte/wms/v2_0?request=getCapabilities&service=WMS',
          label: 'Grondwaterspiegeldiepte layer',
          type: 'wms',
          layers: ['bro-grondwaterspiegeldieptemetingen-GHG'],
        },
        {
          uuid: '931f18f0-cedc-453b-a2d5-a2c1ff9df523',
          url: 'https://service.pdok.nl/lv/bag/wms/v2_0?request=getCapabilities&service=WMS',
          label: 'BAG Pand and Verblijfsobject layer',
          type: 'wms',
          layers: ['pand', 'verblijfsobject'],
        },
        {
          uuid: '4a76c09a-2ae3-4c17-8b40-ade45cb86a0e',
          url: 'https://service.pdok.nl/lv/bag/wfs/v2_0?request=getCapabilities&service=WFS',
          label: 'Unsupported WFS layer',
          type: 'wfs',
          layers: ['pand'],
        },
      ],
    },
  },
};

export const InitialError: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
      validate: {required: true},
    } satisfies MapComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          map: 'foobar',
        },
      },
      initialErrors: {
        my: {
          map: 'Incorrect value',
        },
      },
      initialTouched: {
        my: {
          map: true,
        },
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    expect(await canvas.findByText('Incorrect value')).toBeVisible();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: MapComponentSchema;
  value: undefined | GeoJsonGeometry;
}

type ValueDisplayStory = StoryObj<ValueDisplayStoryArgs>;

export const PointDisplay: ValueDisplayStory = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
    } satisfies MapComponentSchema,
    value: {
      type: 'Point',
      coordinates: [5.291266, 52.1326332],
    },
  },
  render: args => <ValueDisplay {...args} />,
};

export const PolygonDisplay: ValueDisplayStory = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
    } satisfies MapComponentSchema,
    value: {
      type: 'Polygon',
      coordinates: [
        [
          [5.291266, 52.1326332],
          [5.091266, 52.128332],
          [5.591266, 52.48332],
        ],
      ],
    },
  },
  render: args => <ValueDisplay {...args} />,
};

export const LineDisplay: ValueDisplayStory = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
    } satisfies MapComponentSchema,
    value: {
      type: 'LineString',
      coordinates: [
        [4.7493255, 52.6405471],
        [4.6493255, 52.4405471],
        [4.5493255, 52.2405471],
      ],
    },
  },
  render: args => <ValueDisplay {...args} />,
};

interface ValidationStoryArgs {
  componentDefinition: MapComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: ValidationStory = {
  render: renderComponentInForm,
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const ValidateNotRequired: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
      validate: {required: false},
    } satisfies MapComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(canvas.queryByTitle('Invalid input')).not.toBeInTheDocument();
  },
};

export const ValidateRequiredWithoutCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
      validate: {required: true},
    } satisfies MapComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidateRequiredWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
      validate: {required: true},
      errors: {required: 'Custom errom message for required'},
    } satisfies MapComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom errom message for required')).toBeVisible();
  },
};

export const ValidateOnBlur: ValidationStory = {
  ...BaseValidationStory,
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
      validate: {required: true},
      interactions: {
        marker: true,
        polygon: false,
        polyline: false,
      },
    } satisfies MapComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    map.blur();

    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidateOnChange: Story = {
  args: {
    componentDefinition: {
      id: 'map',
      type: 'map',
      key: 'my.map',
      label: 'A map',
      validate: {required: true},
      interactions: {
        marker: true,
        polygon: false,
        polyline: false,
      },
    } satisfies MapComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          map: 'foobar',
        },
      },
      initialErrors: {
        my: {
          map: 'Incorrect value',
        },
      },
      initialTouched: {
        my: {
          map: true,
        },
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const map = await canvas.findByTestId('leaflet-map');

    await waitFor(() => {
      expect(map).not.toBeNull();
      expect(map).toBeVisible();
    });

    expect(await canvas.findByText('Incorrect value')).toBeVisible();

    await step('Draw a marker', async () => {
      // @ts-expect-error the x/y coordinates don't seem to be defined in testing-library
      await userEvent.click(map, {x: 100, y: 100});

      // This 'button' is the placed marker on the map
      expect(await canvas.findByRole('button', {name: 'Marker'})).toBeVisible();

      // Having a valid value should pass validation and therefore remove the error message
      expect(canvas.queryByTitle('Incorrect value')).not.toBeInTheDocument();
    });
  },
};
