# Changes

## 0.8.1 (2025-09-04)

Added the missing (Dutch) translations.

## 0.8.1 (2025-09-03)

Bugfix release.

- Fixed missing `Select` export (low-level component).
- Fixed missing `isLoading` prop for the `Select` component.

## 0.8.0 (2025-09-02)

Feature release.

- Added support for rendering user-supplied strings with ICU message format.
- [`#108`][#108] Implemented the `softRequiredErrors` component type.
- [`#81`][#81] Implemented the `currency` component type.
- [`#97`][#97] Implemented the `cosign` (v2) component type.
- [`#79`][#79] Added `onChange` prop to `FormioForm` component, receiving the updated form field
  values.
- [`#82`][#82] Ported the `FloatingWidget` from the SDK.
- [`#105`][#105] Implemented the `select` component type.

[#108]: https://github.com/open-formulieren/formio-renderer/issues/108
[#81]: https://github.com/open-formulieren/formio-renderer/issues/81
[#97]: https://github.com/open-formulieren/formio-renderer/issues/97
[#79]: https://github.com/open-formulieren/formio-renderer/issues/79
[#82]: https://github.com/open-formulieren/formio-renderer/issues/82
[#105]: https://github.com/open-formulieren/formio-renderer/issues/105

## 0.7.0 (2025-08-19)

Feature release with some architectural rework.

**💥 Breaking changes**

The low-level `EditGrid` component no longer accepts a `getItemValidationSchema` prop. This has been
replaced with the `validate` prop. This change is necessary to be able to dynamically update the
schema depending on the currently visible fields.

**Features**

- [`#100`][#100] Implemented the `iban` component type.
- [`#73`][#73] Implemented the `content` component type, now built on top of the `utrecht-html` NL
  Design System component.
- [`#59`][#59] Added support for the `clearOnHide` component configuration option.
- [`#101`][#101] Implemented the `licenseplate` component type.
- [`#109`][#109] Implemented the `textarea` component type.
- [`#103`][#103] Implemented the `number` component type.

**Bugfixes**

- [`#133`][#133], [`#141`][#141] Fixed two situations where infinite renders could happen with
  nested edit grids.

**Project maintenance**

- Added CI check for outdated i18n messages.
- [`#127`][#127] Upgraded to Storybook 9.
- [`#127`][#127] Added code coverage instrumentation and reporting.

[#100]: https://github.com/open-formulieren/formio-renderer/issues/100
[#73]: https://github.com/open-formulieren/formio-renderer/issues/73
[#59]: https://github.com/open-formulieren/formio-renderer/issues/100
[#101]: https://github.com/open-formulieren/formio-renderer/issues/101
[#133]: https://github.com/open-formulieren/formio-renderer/issues/133
[#109]: https://github.com/open-formulieren/formio-renderer/issues/109
[#127]: https://github.com/open-formulieren/formio-renderer/issues/127
[#141]: https://github.com/open-formulieren/formio-renderer/issues/141
[#103]: https://github.com/open-formulieren/formio-renderer/issues/103

## 0.6.1 (2025-06-03)

Fixed a packaging bug which caused the type declarations to be omitted.

## 0.6.0 (2025-06-03)

Feature release.

- Updated label markup to prevent invalid HTML being rendered.
- [`#93`][#93] Added tooltip component and enable it for the relevant formio components.
- [`#78`][#78] Added ability to imperatively set the form values and validation errors.
- [`#72`][#72] Implemented the `columns` component type.
- [`#59`][#59] Support simple conditional logic in `editgrid` components.
- Added preview function in storybook for real form definitions.
- [`#71`][#71] Implemented the `checkbox` component type.
- [`#106`][#106] Implemented the `selecboxes` component type.

[#93]: https://github.com/open-formulieren/formio-renderer/issues/93
[#78]: https://github.com/open-formulieren/formio-renderer/issues/78
[#72]: https://github.com/open-formulieren/formio-renderer/issues/72
[#59]: https://github.com/open-formulieren/formio-renderer/issues/59
[#71]: https://github.com/open-formulieren/formio-renderer/issues/71
[#106]: https://github.com/open-formulieren/formio-renderer/issues/106
