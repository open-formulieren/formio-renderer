# Open Forms' Form.io renderer

> Alternative Form.io renderer made for Open Forms.

This renderer only supports the subset of components as offered by Open Forms in its
form designer/builder, with a focus on performance, user and developer experience.

**Disclaimer**

This project is NOT a drop in replacement for Form.io's own renderer, but specifically
geared towards the Open Forms software component. See the motivation below for more
context.

## Motivation

While Form.io's vanilla JS renderer implementation has a ton of features, we find
ourselves not using many of them and having to override some aspects. The complexity
of the codebase makes this a hard task, full of leaky abstractions and it is not easily
testable.

Additionally, many choices made by the Form.io team are limiting us to offer better
accessibility, security and performance. Rather than forking the vanilla renderer, we
intend to implement the feature set that overlaps and follow the reference behaviour,
however there are some places where we feel the reference is wrong and we consciously
diverge from it.

This renderer is implemented in pure React, rather than offering a react-binding to a
vanilla JS renderer, which should solve many state synchronization and slow DOM syncing
options.

## Install

```bash
npm install --save @open-formulieren/formio-renderer
```

## Usage

```tsx
import React from 'react'

import {FormioForm} from 'formio-renderer'


const Example: React.FC = () => {
  const form = {
    components: [{
      type: 'textfield',
      label: 'Example textfield',
      description: 'A minimal example',
      validate: {
        required: true,
      }
    }],
  };
  return (
    <FormioForm
      form={form}
      onChange={console.log}
      onSubmit={console.log}
    />
  );
};
```

## License

EUPL 1.2
