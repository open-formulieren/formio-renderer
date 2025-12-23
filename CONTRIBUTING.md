# Contribution guidelines

We are grateful for anyone spending their valuable time on contributions to this library.

To avoid dissapointments, before contributing code, please review our
[Design goals](https://open-formulieren.github.io/formio-renderer/). We cannot commit to maintaining
features that are not directly beneficial to
[Open Forms](https://open-forms.readthedocs.io/en/stable/).

However, if you wish to contribute despite these warnings, you can do so in a number of ways!

## Reporting bugs

If you have encountered a bug in this project, please check if an issue already exists in the list
of existing [issues][issues]. If such an issue does not exist, you can create a [new
issue][new_issue]. When writing the bug report, try to add a clear example that shows how to
reproduce said bug.

[issues]: https://github.com/open-formulieren/formio-renderer/issues
[new_issue]: https://github.com/open-formulieren/formio-renderer/issues/new/choose

## Performing accessibility audits and testing

Accessibility is definitely a blind spot for us - if you can help out with user tests or by
performing accessibility audits, we will happily receive the results and check what can be done to
resolve issues!

## Adding new features

We recommend creating a feature request ticket **BEFORE** developing a new feature. This way, we can
gauge interest in the feature and let you know if we're not (yet) open to it so that you don't spend
a lot of time on something that will not be merged in the near future.

If you get the go-ahead and start writing code, that's wonderful! We do ask you to keep the quality
control process in mind - and all of the things below are enforced through Github Actions:

- we use Typescript for its type-safety features - downcasting is frowned upon (i.e. you should
  really avoid using `as SomeType`!).
- code formatting is done with prettier, you can run `npm run checkformat` and `npm run format`, or
  enable format-on-save in your editor.
- code is linted using eslint, you can run it locally using `npm run lint`.
- code must have tests - often these will be interaction tests in Storybook, but for unit-test like
  tests you can write additional tests and run them with vitest.
- components must be documented in Storybook, so that they undergo visual regression testing.
- use [NL Design System](https://www.nldesignsystem.nl/) components rather than reinventing the
  wheel.

In general - check the `scripts` section in `package.json` for the available developer tools!

### Commit messages

Commit messages are very important to us, as they are essential to understand _why_ changes are
made. They should explain your thought process.

- always refer to the github issue in the commit message summary.
- stick to commit message best practices by using a short summary, and add additional paragraphs to
  the body when relevant
- good things to note down are: alternative solutions considered and reason why they were rejected,
  the requirements that applied at the time, possible limitations/external factors that were
  relevant...
