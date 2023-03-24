export const FORMIO_PATTERN = {
  type: 'textfield',
  key: 'postcode',
  label: 'Postcode',
  placeholder: '1234 AB',
  input: true,
  tooltip: 'Please type a Dutch postcode.',
  description: '',
  validate: {
    maxLength: 7,
    minLength: 6,
    pattern: /^\d{4}\s?[a-zA-Z]{2}$/,
    required: true,
  },
};
