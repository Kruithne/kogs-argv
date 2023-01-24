
type PrimitiveType = string | number | boolean;

/**
 * Sanitizes a key to be used as a property name.
 * @param key - The key to sanitize.
 * @returns The sanitized key.
 */
function sanitizeKey(key: string): string {
	let result = '';
	let capitalizeNext = false;

	for (let i = 0, n = key.length; i < n; i++) {
		const char = key[i].toLowerCase();

		// Hypenated keys are converted to camelCase. (e.g. "foo-bar" -> "fooBar")
		if (char === '-') {
			// In the event of a key "5-fifty", it needs to become "fifty" and not "Fifty".
			if (result.length > 0)
				capitalizeNext = true;

			continue;
		}

		// Skip non a-z characters.
		const charCode = char.charCodeAt(0);
		if ((charCode < 97 || charCode > 122))
			continue;

		if (capitalizeNext) {
			result += char.toUpperCase();
			capitalizeNext = false;
		} else {
			result += char;
		}
	}

	return result;
}

/**
 * Checks if the key is a long option.
 * @param key - The key to check.
 * @returns `true` if the key is a long option, `false` otherwise.
 */
function isLongOption(key: string): boolean {
	return key.startsWith('--');
}

/**
 * Checks if the key is a short option.
 * @param key - The key to check.
 * @returns `true` if the key is a short option, `false` otherwise.
 */
function isShortOption(key: string): boolean {
	return key.startsWith('-') && key.length === 2;
}

/**
 * Checks if the key is a long or short option.
 * @param key - The key to check.
 * @returns `true` if the key is a long or short option, `false` otherwise.
 */
function isOption(key: PrimitiveType): boolean {
	if (typeof key !== 'string')
		return false;

	return isLongOption(key) || isShortOption(key);
}

const retrieverPrototype = {
	/**
	 * Retrieves the value of the key in a type-safe manner.
	 * 
	 * @remarks
	 * This method is used internally by other methods of the retriever prototype
	 * to safely access the value of a given key within the context of the retriever.
	 * 
	 * For arrays, keys are coerced to numbers and used as indices.
	 * For objects, keys must be properties of the object.
	 * 
	 * @param key - The key/index to retrieve the value for.
	 * @returns The value of the key, or `undefined` if the key was not found.
	 */
	_getValue: function(key: string | number): PrimitiveType {
		if (Array.isArray(this))
			return this[Number(key)];

		return Object.prototype.hasOwnProperty.call(this, key) ? this[key] : undefined;
	},

	/**
	 * Retrieves the value of the key as a `number`.
	 * 
	 * @remarks
	 * The value is parsed using the native `Number` function.
	 * - Missing keys are always returned as `undefined`.
	 * - Boolean values are converted to `1` for `true` and `0` for `false`.
	 * - Empty strings are converted to `0`.
	 * - Whitespace at the start and end of strings are trimmed.
	 * - Strings that cannot be parsed are converted to `NaN`.
	 * - Strings containing a decimal point are converted to floating point numbers.
	 * - Strings starting with `0x` are treated as hexadecimal numbers.
	 * - Strings starting with `0o` are treated as octal numbers.
	 * - Strings starting with `0b` are treated as binary numbers.
	 * - Signed numbers (`+` or `-`) are parsed as numbers with their signage.
	 * - `Infinity` and `-Infinity` are parsed as their respective values.
	 * - Numeric separators (`_`) will result in `NaN`.
	 * 
	 * See: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number MDN: Number}
	 * 
	 * @param key - The key/index to retrieve the value for.
	 * @returns The value of the key as a `number`, or `undefined` if the key was not found.
	 */
	asNumber: function(key: string | number): number | undefined {
		const value: PrimitiveType = this._getValue(key);

		// Always return undefined if the key was not found.
		if (value === undefined)
			return undefined;

		// If value is already a number type, return it without parsing.
		if (typeof value === 'number')
			return value;

		return Number(value);
	},

	/**
	 * Retrieves the value of the key as a `string`.
	 * 
	 * @remarks
	 * The value is parsed using the native `String` function.
	 * - Missing keys are always returned as `undefined`.
	 * - Boolean values are converted to `true` or `false`.
	 * - Numbers are converted directly to strings.
	 * - Strings (empty or otherwise) are returned as-is.
	 * 
	 * See: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String MDN: String}
	 * 
	 * @param key - The key/index to retrieve the value for.
	 * @returns The value of the key as a `string`, or `undefined` if the key was not found.
	 */
	asString: function(key: string | number): string | undefined {
		const value: PrimitiveType = this._getValue(key);

		// Always return undefined if the key was not found.
		if (value === undefined)
			return undefined;

		// If value is already a string type, return it without parsing.
		if (typeof value === 'string')
			return value;

		return String(value);
	},

	/**
	 * Retrieves the value of the key as an array of strings.
	 * 
	 * @remarks
	 * The value is parsed using the same rules as {@link Config.asString}.
	 * - Missing keys are always returned as `undefined`, not an empty array.
	 * - String is split by the separator and then each item is optionally trimmed.
	 * 
	 * @param key - The key/index to retrieve the value for.
	 * @param separator - The separator to use when splitting the string into an array.
	 * @param trimWhitespace - Whether to trim whitespace from the beginning and end of each array item.
	 * @returns The value of the key as an array of strings, or `undefined` if the key was not found.
	 */
	asArray: function(key: string | number, separator: string = ',', trimWhitespace: boolean = true): string[] | undefined {
		let value: PrimitiveType = this._getValue(key);

		// Always return undefined if key was not found.
		if (value === undefined)
			return undefined;

		if (typeof value !== 'string')
			value = String(value);

		let arr: string[] = value.split(separator);

		if (trimWhitespace)
			arr = arr.map((item) => item.trim());

		return arr;
	},

	/**
	 * Retrieves the value of the key as a `boolean`.
	 * 
	 * @remarks
	 * The following behavior is used to determine the boolean value:
	 * - Missing keys are always returned as `undefined`.
	 * - Boolean values are returned as-is.
	 * - Numbers are converted to `true` for non-zero values and `false` for zero.
	 * - NaN is converted to `false`.
	 * - Empty strings are converted to `false`.
	 * - Strings literally containing `0` or `false` (case-insensitive, trimmed) are converted to `false`.
	 * - All other strings are converted to `true`.
	 * 
	 * @param key - The key/index to retrieve the value for.
	 * @returns The value of the key as a `boolean`, or `undefined` if the key was not found.
	 */
	asBoolean: function(key: string | number): boolean | undefined {
		const value: PrimitiveType = this._getValue(key);

		// Always return undefined if the key was not found.
		if (value === undefined)
			return undefined;

		// If value is already a boolean type, return it without parsing.
		const valueType = typeof value;
		if (valueType === 'boolean')
			return value as boolean;

		// Match Boolean() behavior and return `true` for non-zero numbers.
		// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean
		// 
		// Values won't be numbers from the command line, but users may pass in numbers manually.
		// 
		// For NaN checking (we return false for NaN) we use Number.isNaN() instead of isNaN()
		// to skip the type coercion, since we know the value is a number.
		// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
		if (valueType === 'number')
			return !Number.isNaN(value) && value !== 0;

		// Boolean() returns `true` for any string that is not empty. We differ from this behavior
		// and check for some common true/false literals since we're parsing command line arguments.
		if ((value as string).length === 0)
			return false;

		const lowerTrimmed = (value as string).toLowerCase().trim();
		if (lowerTrimmed === '0' || lowerTrimmed === 'false')
			return false;

		return true;
	}
};

type RetrieverPrototype = typeof retrieverPrototype;
interface ParsedArgsArguments extends Array<string>, RetrieverPrototype {}
type ParsedArgsOptions = RetrieverPrototype & {
	[key: string]: string | boolean;
};

interface ParsedArgs {
	/**
	 * The options parsed from the command line arguments.
	 * 
	 * @remarks
	 * Options are any arguments that are prefixed with a single (`-`) or double (`--`) hyphen.
	 * A standalone option will be assigned a value of `true` (e.g. `-v` or `--verbose`).
	 * An option with a value (separated by `=` or ` `) will be assigned the value (e.g. `-o 1` or `--option=1`).
	 */
	options: ParsedArgsOptions;

	/**
	 * The arguments parsed from the command line arguments.
	 * 
	 * @remarks
	 * Arguments are any arguments that are not prefixed with a single (`-`) or double (`--`) hyphen
	 * and have not been assigned to an option as a value.
	 */
	arguments: ParsedArgsArguments;
}

/**
 * Parses the command line arguments.
 * 
 * @throws {TypeError}
 * Thrown if any of the arguments are not of type `string|number|boolean`.
 * 
 * @param argv - The command line arguments to parse. Defaults to `process.argv.splice(2)`.
 * @returns The parsed command line arguments.
 */
export function parse(argv: string[] = process.argv.splice(2)): ParsedArgs  {
	const opts: ParsedArgsOptions = Object.create(retrieverPrototype);
	const args: ParsedArgsArguments = Object.assign([], retrieverPrototype);

	while (argv.length > 0) {
		const arg = argv.shift();

		const argType = typeof arg;
		if (argType !== 'string' && argType !== 'number' && argType !== 'boolean')
			throw new TypeError(`CLI arguments must be of type string|number|boolean, but got ${argType}.`);

		if (isOption(arg)) {
			if (isLongOption(arg)) {
				const index = arg.indexOf('=');

				let key: string;
				let value: string | boolean;

				if (index > -1) {
					// Option with value (e.g. --option=value)
					key = arg.substring(2, index);
					value = arg.substring(index + 1);
				} else if (argv.length > 0 && !isOption(argv[0])) {
					// Option with value (e.g. --option value)
					key = arg.substring(2);
					value = argv.shift();
				} else {
					// Standalone option (e.g. --option)
					key = arg.substring(2);
					value = true;
				}

				key = sanitizeKey(key);

				// Keys with only invalid characters will just be dropped.
				if (key.length > 0)
					opts[key] = value;
			} else {
				// Short option (e.g. -o)

				// Keys must be a-zA-Z. If not, just drop the key.
				const key = arg[1];

				let value: string | boolean = true;
				if (argv.length > 0 && !isOption(argv[0]))
					value = argv.shift();

				const charCode = key.charCodeAt(0);
				if ((charCode < 97 || charCode > 122) && (charCode < 65 || charCode > 90))
					continue;

				opts[key] = value;
			}
		} else {
			args.push(arg);
		}
	}

	return {
		options: opts,
		arguments: args
	};
}

export default {
	parse
};