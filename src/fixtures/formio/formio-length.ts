export const FORMIO_LENGTH = {
  type: 'textfield',
  key: 'motivation',
  label: 'Motivation',
  placeholder: '',
  input: true,
  tooltip: 'Type something between 20 and 50 characters.',
  description: '',
  validate: {
    maxLength: 50,
    minLength: 20,
    pattern: '',
    required: true,
  },
};
