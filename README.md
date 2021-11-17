# stylelint-processor-tailwind

This has been written to work with Vue.js, however should work for other frameworks/libraries.

Programatically generated styles are currently unsupported.

It is highly recommended that you disable the following stylelint options:

- `property-no-unknown`
- `declaration-block-no-duplicate-properties`

## Usage

`npm install stylelint-processor-tailwind`

Place all unwanted css properties and tailwind classes inside `property-disallowed-list`
