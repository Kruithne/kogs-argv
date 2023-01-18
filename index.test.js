import { expect, test } from '@jest/globals';
import argv, { parse } from './index.js';

test('API availability', () => {
	expect(typeof argv.parse).toBe('function');
	expect(typeof parse).toBe('function');
});

test('parse() prototype and return value', () => {
	const result = parse([]);

	expect(typeof result).toBe('object');
	expect(typeof result.options).toBe('object');
	expect(Array.isArray(result.arguments)).toBe(true);

	expect(typeof result.options.asBoolean).toBe('function');
	expect(typeof result.options.asNumber).toBe('function');
	expect(typeof result.options.asString).toBe('function');

	expect(typeof result.arguments.asBoolean).toBe('function');
	expect(typeof result.arguments.asNumber).toBe('function');
	expect(typeof result.arguments.asString).toBe('function');
});

test('parse() type checking', () => {
	// `string`, `number` and `boolean` are allowed types.
	// While all values from `process.argv` are `string` type, we allow users
	// to pass in native types since we provide type conversion methods for them.
	expect(() => parse(['Earth', false, true, 1, 1.5, NaN, Infinity])).not.toThrow();

	expect(() => parse(['Earth', null])).toThrow();
	expect(() => parse(['Earth', undefined])).toThrow();
	expect(() => parse(['Earth', {}])).toThrow();
	expect(() => parse(['Earth', []])).toThrow();
	expect(() => parse(['Earth', Symbol('test')])).toThrow();
});

test('parse() arguments', () => {
	const result = parse(['Earth', 'Mars', 'Jupiter']);
	expect(result.options).toEqual({});

	expect(result.arguments).toContain('Earth');
	expect(result.arguments).toContain('Mars');
	expect(result.arguments).toContain('Jupiter');
});

test('parse() arguments asBoolean()', () => {
	// Verbose on purpose for test failure readability.
	const result = parse([
		'Earth',	// 0
		'false',	// 1
		'true',		// 2
		'0',		// 3
		'1',		// 4
		'',			// 5
		false,		// 6
		true,		// 7
		1,			// 8
		0,			// 9
		5,			// 10
		NaN,		// 11
		0.1,		// 12
		-1,			// 13
		' ', 		// 14
	]);

	expect(result.arguments.asBoolean(0)).toBe(true);
	expect(result.arguments.asBoolean(1)).toBe(false);
	expect(result.arguments.asBoolean(2)).toBe(true);
	expect(result.arguments.asBoolean(3)).toBe(false);
	expect(result.arguments.asBoolean(4)).toBe(true);
	expect(result.arguments.asBoolean(5)).toBe(false);
	expect(result.arguments.asBoolean(6)).toBe(false);
	expect(result.arguments.asBoolean(7)).toBe(true);
	expect(result.arguments.asBoolean(8)).toBe(true);
	expect(result.arguments.asBoolean(9)).toBe(false);
	expect(result.arguments.asBoolean(10)).toBe(true);
	expect(result.arguments.asBoolean(11)).toBe(false);
	expect(result.arguments.asBoolean(12)).toBe(true);
	expect(result.arguments.asBoolean(13)).toBe(true);
	expect(result.arguments.asBoolean(14)).toBe(true);
	expect(result.arguments.asBoolean(15)).toBe(undefined);
});

test('parse() arguments asNumber()', () => {
	// Verbose on purpose for test failure readability.
	const result = parse([
		'Earth',	// 0
		'false',	// 1
		'true',		// 2
		'0',		// 3
		'',			// 4
		false,		// 5
		true,		// 6
		5,			// 7
		NaN,		// 8
		0.152,		// 9
		'2.242',	// 10
		' ', 		// 11
		'-35',		// 12
		'+100',		// 13
		'-2.5',		// 14
		'Infinity',	// 15
		'-Infinity',// 16
		'+2.5',		// 17
		'0x10',		// 18
		'0b1011',	// 19
		'0o20',		// 20
		'5_000',	// 21
	]);

	expect(result.arguments.asNumber(0)).toBe(NaN);
	expect(result.arguments.asNumber(1)).toBe(NaN);
	expect(result.arguments.asNumber(2)).toBe(NaN);
	expect(result.arguments.asNumber(3)).toBe(0);
	expect(result.arguments.asNumber(4)).toBe(0);
	expect(result.arguments.asNumber(5)).toBe(0);
	expect(result.arguments.asNumber(6)).toBe(1);
	expect(result.arguments.asNumber(7)).toBe(5);
	expect(result.arguments.asNumber(8)).toBe(NaN);
	expect(result.arguments.asNumber(9)).toBe(0.152);
	expect(result.arguments.asNumber(10)).toBe(2.242);
	expect(result.arguments.asNumber(11)).toBe(0);
	expect(result.arguments.asNumber(12)).toBe(-35);
	expect(result.arguments.asNumber(13)).toBe(100);
	expect(result.arguments.asNumber(14)).toBe(-2.5);
	expect(result.arguments.asNumber(15)).toBe(Infinity);
	expect(result.arguments.asNumber(16)).toBe(-Infinity);
	expect(result.arguments.asNumber(17)).toBe(2.5);
	expect(result.arguments.asNumber(18)).toBe(16);
	expect(result.arguments.asNumber(19)).toBe(11);
	expect(result.arguments.asNumber(20)).toBe(16);
	expect(result.arguments.asNumber(21)).toBe(NaN);
	expect(result.arguments.asNumber(22)).toBe(undefined);
});

test('parse() arguments asString()', () => {
	// Verbose on purpose for test failure readability.
	const result = parse([
		'Earth',	// 0
		'false',	// 1
		'true',		// 2
		'0',		// 3
		'1',		// 4
		'',			// 5
		false,		// 6
		true,		// 7
		1,			// 8
		0,			// 9
		5,			// 10
		NaN,		// 11
		0.1,		// 12
		-1,			// 13
		' ', 		// 14
	]);

	expect(result.arguments.asString(0)).toBe('Earth');
	expect(result.arguments.asString(1)).toBe('false');
	expect(result.arguments.asString(2)).toBe('true');
	expect(result.arguments.asString(3)).toBe('0');
	expect(result.arguments.asString(4)).toBe('1');
	expect(result.arguments.asString(5)).toBe('');
	expect(result.arguments.asString(6)).toBe('false');
	expect(result.arguments.asString(7)).toBe('true');
	expect(result.arguments.asString(8)).toBe('1');
	expect(result.arguments.asString(9)).toBe('0');
	expect(result.arguments.asString(10)).toBe('5');
	expect(result.arguments.asString(11)).toBe('NaN');
	expect(result.arguments.asString(12)).toBe('0.1');
	expect(result.arguments.asString(13)).toBe('-1');
	expect(result.arguments.asString(14)).toBe(' ');
	expect(result.arguments.asString(15)).toBe(undefined);
});

test('parse() arguments prototype', () => {
	const results = parse(['Earth', 'Mars', 'Venus']);

	// Accessing arguments with string keys should work.
	expect(results.arguments.asString('0')).toBe('Earth');
	expect(results.arguments.asString('foo')).toBe(undefined);

	// Accessing arguments directly by index should work.
	expect(results.arguments[0]).toBe('Earth');

	// Iteration should work.
	for (const argument of results.arguments)
		expect(typeof argument).toBe('string');

	// Length should work.
	expect(results.arguments.length).toBe(3);

	// Ensure that prototype cannot be accessed through as-functions.
	expect(results.arguments.asString('length')).toBe(undefined);
	expect(results.arguments.asString('prototype')).toBe(undefined);
	expect(results.arguments.asString('asString')).toBe(undefined);
});

test('parse() options', () => {
	const results = parse(['Earth', '--test', '--my-other-test', 'Jupiter', 'Mars', '--sun=true', 'Venus']);

	expect(results.options.test).toBe(true); // Non-valued options are true.
	expect(results.options.myOtherTest).toBe('Jupiter');
	expect(results.options.sun).toBe('true'); // Option values are not automatically coerced.

	// Arguments should not be incorrectly consumed by options.
	expect(results.arguments[0]).toBe('Earth');
	expect(results.arguments[1]).toBe('Mars');
	expect(results.arguments[2]).toBe('Venus');
});

test('parse() key sanitzation', () => {
	const results = parse([
		'--test', // Should become results.options.test
		'--my-other-test', // Should become results.options.myOtherTest
		'--5-fifty', // Should become results.options.fifty
		'--6424', // Should be not be present, invalid key.
		'--MANGO', // Should become results.options.mango
		'--MANGO-JAM', // Should become results.options.mangoJam
	]);

	expect(results.options.test).toBe(true);
	expect(results.options.myOtherTest).toBe(true);
	expect(results.options.fifty).toBe(true);
	expect(results.options.mango).toBe(true);
	expect(results.options.mangoJam).toBe(true);
	expect(results.options['6424']).toBe(undefined);
});

// TODO: Test parse() options asBoolean.
// TODO: Test parse() options asNumber.
// TODO: Test parse() options asString.