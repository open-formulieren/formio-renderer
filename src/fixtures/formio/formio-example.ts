export const FORMIO_EXAMPLE = [
  {
    type: 'textfield',
    key: 'firstName',
    label: 'first name',
    placeholder: 'Enter your first name.',
    input: true,
    tooltip: 'Enter your first name',
    description: 'Enter your first name'
  },
  {
    type: 'textfield',
    key: 'lastName',
    label: 'last name',
    placeholder: 'Enter your last name',
    input: true,
    tooltip: 'Enter your last name',
    description: 'Enter your last name'
  },
  {
    type: 'select',
    label: 'Favorite Things',
    key: 'favoriteThings',
    placeholder: 'These are a few of your favorite things...',
    data: {
      values: [
        {
          value: 'raindropsOnRoses',
          label: 'Raindrops on roses'
        },
        {
          value: 'whiskersOnKittens',
          label: 'Whiskers on Kittens'
        },
        {
          value: 'brightCopperKettles',
          label: 'Bright Copper Kettles'
        },
        {
          value: 'warmWoolenMittens',
          label: 'Warm Woolen Mittens'
        }
      ]
    },
    dataSrc: 'values',
    template: '<span>{{ item.label }}</span>',
    multiple: true,
    input: true
  },
  {
    type: 'button',
    action: 'submit',
    label: 'Submit',
    theme: 'primary'
  }
]
