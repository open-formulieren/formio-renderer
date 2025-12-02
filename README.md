# Open Forms Renderer

[![NPM](https://img.shields.io/npm/v/@open-formulieren/formio-renderer.svg)](https://www.npmjs.com/package/@open-formulieren/formio-renderer)
[![Storybook](https://img.shields.io/badge/docs-Storybook-FF4785?style=flat)][Storybook]
[![Coverage](https://codecov.io/github/open-formulieren/formio-renderer/graph/badge.svg?token=446OCQXNUG)](https://codecov.io/github/open-formulieren/formio-renderer)
![Code formatting with Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)

The "renderer" is the React render engine used in Open Forms, responsible for displaying the form
fields for the user to fill out and capturing the input data.

## Usage

See [Storybook][Storybook] for extensive documentation.

A minimal example to render an email input and radio field:

```tsx
import {FormioForm} from '@open-formulieren/formio-renderer';
import '@open-formulieren/formio-renderer/formio-renderer.css';
import {IntlProvider} from 'react-intl';

const FORM_COMPONENTS = [
  {
    id: '123',
    type: 'email',
    key: 'emailAddress',
    label: 'Your email',
    validate: {required: true},
  },
  {
    id: '456',
    type: 'radio',
    key: 'favouriteFramework',
    label: 'Favourite framework',
    values: [
      {value: 'django', label: 'Django'},
      {value: 'react', label: 'React'},
      {value: 'laravel', label: 'Laravel'},
    ],
  },
];

export const App: React.FC = () => (
  // there must be an outer IntlProvider - it's your responsibility to set this up properly
  <IntlProvider messages={{}} locale="en" defaultLocale="en">
    <FormioForm
      components={FORM_COMPONENTS}
      onChange={values => console.log(values)}
      onSubmit={values => console.log(values)}
      id="my-form"
    />
    <button type="submit" form="my-form">
      Submit
    </button>
  </IntlProvider>
);
```

## Features

We support a subset of Formio.js component types, and a subset of features for each component type.
See [@open-formulieren/types](https://github.com/open-formulieren/types) for details. We also extend
the Formio component types in a number of places.

Feature support is limited to what is used in
[Open Forms](https://github.com/open-formulieren/open-forms), including but not limited to:

- conditional field display, including clear-on-hide behaviour
- ability to imperatively set form values and validation errors
- react to form value changes
- display custom validation errors
- multi-language support
- support for NL-specific data, such as BSNs, car license plates, Dutch addresses...

## Relation to Formio.js

We've started out using Formio.js, however our needs for customization have made it difficult to
extend it, fix bugs and integrate it in our toolchain.

We have some compatibility in commonly used components like textfields and features supported by
both Formio.js and Open Forms Renderer should work mostly the same, with minor differences. That
said, we don't recommend using this renderer outside of the context of Open Forms. It is explicitly
not one of our goals.

In practice, you can consider this a hard fork.

We are very grateful to the team behind Formio.js for open sourcing their software, Open Forms would
not have been possible without it.

[Storybook]: https://open-formulieren.github.io/formio-renderer/
