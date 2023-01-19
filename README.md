# @kogs/argv
![tests status](https://github.com/Kruithne/kogs-argv/actions/workflows/github-actions-test.yml/badge.svg) [![license badge](https://img.shields.io/github/license/Kruithne/kogs-argv?color=blue)](LICENSE)

`@kogs/argv` is a [Node.js](https://nodejs.org/) package that provides a simple and opinionated API for parsing command line arguments.

- Simple and easy-to-use API.
- Full [TypeScript](https://www.typescriptlang.org/) definitions.
- Zero dependencies.

## Installation
```bash
npm install @kogs/argv
```

## Usage
```js
// node index.js test --foo bar --baz -c -d fun
import { parse } from '@kogs/argv';
const argv = parse();

// argv.arguments[0] === 'test'
// argv.options.foo === 'bar'
// argv.options.baz === true
// argv.options.c === true
// argv.options.d === 'fun'
```

## Documentation

- [Parse](#parse) - Parse command line arguments.
- [Type Conversions](#type-conversions) - Retrieve arguments and options as specific types.

### Parse

The simplest way to use `@kogs/argv` is to use the `parse` function. This function will parse the command line arguments and return an object containing the parsed arguments and options.

```js
// node index.js test --foo bar --baz -c -d fun
import { parse } from '@kogs/argv';
const argv = parse();

// argv.arguments[0] === 'test'
// argv.options.foo === 'bar'
// argv.options.baz === true
// argv.options.c === true
// argv.options.d === 'fun'
```
By default, `parse` will parse the `process.argv` array (skipping the first two elements, which are the Node.js executable and the script path). You can also pass an array of arguments to parse instead.

> **Note:** Only the primitive types `string`, `number` and `boolean` are supported. Any other types in the array will throw an error.

```js
const argv = parse(['--example', '--foo=bar', '--baz' 'test']);
// argv.options.example === true
// argv.options.foo === 'bar'
// argv.options.baz === true
```

#### Notes on Parsing Long Options

- Arguments that begin with `--` are treated as long options.
- Long options can have a value separated by an `=` or a space.
- Long options without a value are treated as `true`.
- Long options can only contain alphabetical (a-zA-Z) characters and `-`.
- `-` characters in long options are treated as word separators and will be converted to camelCase (e.g. `--foo-bar` becomes `fooBar`).
- All long options are converted to lowercase (with the exception of camelCase from the previous point).
- Invalid characters are ignored in long options. If the key contains no valid characters, it will be ignored.

#### Notes on Parsing Short Options

- Arguments that begin with `-` are treated as short options.
- Short options can have a value separated by a space only. Separating a short option and its value with an `=` is not supported.
- Short options without a value are treated as `true`.
- Short option groups (e.g. `-abc`) are not supported.
- Short options can only be a single character (a-z A-Z).
- Invalid short options are ignored.

#### Notes on Parsing

- If an option is ignored because it is invalid, a preceding value will still be consumed to prevent it from being parsed as an argument.
- Any arguments not consumed by options are added to the `.arguments` array.

### Type Conversions

Everything parsed from the command line is returned as a string by default, but often it's useful to retrieve them as numbers or booleans.

Both the `.options` and `.arguments` properties have three helper functions that can be used to retrieve the values as specific types.

```js
// --foo=5 --bar=false --baz=1.5 --qux=hello 50

// argv.options.foo === '5'
// argv.options.asNumber('foo') === 5
// argv.options.asBoolean('bar') === false
// argv.options.asNumber('baz') === 1.5

// Works on the .arguments array too.
// argv.arguments[0] === '50'
// argv.arguments.asNumber(0) === 50
```

#### asNumber

Retrieve the value of an option or argument as a number. This uses the native `Number()` function to parse the value and returns `NaN` if the value cannot be parsed.

- Missing keys are always returned as `undefined`.
- Boolean values are converted to `1` for `true` and `0` for `false`.
- Empty strings are converted to `0`.
- Whitespace at the start and end of strings are trimmed.
- Strings that cannot be parsed are converted to `NaN`.
- Strings containing a decimal point are converted to floating point numbers.
- Strings starting with `0x` are treated as hexadecimal numbers.
- Strings starting with `0o` are treated as octal numbers.
- Strings starting with `0b` are treated as binary numbers.
- Signed numbers (`+` or `-`) are parsed as numbers with their signage.
- `Infinity` and `-Infinity` are parsed as their respective values.
- Numeric separators (`_`) will result in `NaN`.

For more information, see the [MDN Number documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number).

#### asBoolean

Retrieve the value of an option or argument as a boolean. This does **not** use the native `Boolean()` function, but instead uses the following rules.

- Missing keys are always returned as `undefined`.
- Boolean values are returned as-is.
- Numbers are converted to `true` for non-zero values and `false` for zero.
- `NaN` is converted to `false`.
- Empty strings are converted to `false`.
- Strings literally containing `0` or `false` (case-insensitive, trimmed) are converted to `false`.
- All other strings are converted to `true`.

#### asString

Retrieve the value of an option or argument as a string. This is only useful if you have a boolean option that you want to retrieve as a string, or if you're parsing a custom array of arguments with mixed primitive types.

The value is parsed using the native `String` function.

- Missing keys are always returned as `undefined`.
- Boolean values are converted to `true` or `false`.
- Numbers are converted directly to strings.
- Strings (empty or otherwise) are returned as-is.

For more information, see the [MDN String documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String).

## What is `@kogs`?
`@kogs` is a collection of packages that I've written to consolidate the code I often reuse across my projects with the following goals in mind:

- Consistent API.
- Minimal dependencies.
- Full TypeScript definitions.
- Avoid feature creep.
- ES6+ syntax.

All of the packages in the `@kogs` collection can be found [on npm under the `@kogs` scope.](https://www.npmjs.com/settings/kogs/packages)

## Contributing / Feedback / Issues
Feedback, bug reports and contributions are welcome. Please use the [GitHub issue tracker](https://github.com/Kruithne/kogs-argv/issues) and follow the guidelines found in the [CONTRIBUTING](CONTRIBUTING.md) file.

## License
The code in this repository is licensed under the ISC license. See the [LICENSE](LICENSE) file for more information.