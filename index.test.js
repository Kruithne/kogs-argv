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
	expect(parse(['Earth']).arguments.asBoolean(0)).toBe(true);
	expect(parse(['false']).arguments.asBoolean(0)).toBe(false);
	expect(parse(['true']).arguments.asBoolean(0)).toBe(true);
	expect(parse(['0']).arguments.asBoolean(0)).toBe(false);
	expect(parse(['1']).arguments.asBoolean(0)).toBe(true);
	expect(parse(['']).arguments.asBoolean(0)).toBe(false);
	expect(parse([false]).arguments.asBoolean(0)).toBe(false);
	expect(parse([true]).arguments.asBoolean(0)).toBe(true);
	expect(parse([1]).arguments.asBoolean(0)).toBe(true);
	expect(parse([0]).arguments.asBoolean(0)).toBe(false);
	expect(parse([5]).arguments.asBoolean(0)).toBe(true);
	expect(parse([NaN]).arguments.asBoolean(0)).toBe(false);
	expect(parse([0.1]).arguments.asBoolean(0)).toBe(true);
	expect(parse([-1]).arguments.asBoolean(0)).toBe(true);
	expect(parse([' ']).arguments.asBoolean(0)).toBe(true);
	expect(parse([]).arguments.asBoolean(0)).toBe(undefined);
});

test('parse() arguments asNumber()', () => {
	// Verbose on purpose for test failure readability.
	expect(parse(['Earth']).arguments.asNumber(0)).toBe(NaN);
	expect(parse(['false']).arguments.asNumber(0)).toBe(NaN);
	expect(parse(['true']).arguments.asNumber(0)).toBe(NaN);
	expect(parse(['0']).arguments.asNumber(0)).toBe(0);
	expect(parse(['']).arguments.asNumber(0)).toBe(0);
	expect(parse([false]).arguments.asNumber(0)).toBe(0);
	expect(parse([true]).arguments.asNumber(0)).toBe(1);
	expect(parse([5]).arguments.asNumber(0)).toBe(5);
	expect(parse([NaN]).arguments.asNumber(0)).toBe(NaN);
	expect(parse([0.152]).arguments.asNumber(0)).toBe(0.152);
	expect(parse(['2.242']).arguments.asNumber(0)).toBe(2.242);
	expect(parse([' ']).arguments.asNumber(0)).toBe(0);
	expect(parse(['-35']).arguments.asNumber(0)).toBe(-35);
	expect(parse(['+100']).arguments.asNumber(0)).toBe(100);
	expect(parse(['-2.5']).arguments.asNumber(0)).toBe(-2.5);
	expect(parse(['Infinity']).arguments.asNumber(0)).toBe(Infinity);
	expect(parse(['-Infinity']).arguments.asNumber(0)).toBe(-Infinity);
	expect(parse(['+2.5']).arguments.asNumber(0)).toBe(2.5);
	expect(parse(['0x10']).arguments.asNumber(0)).toBe(16);
	expect(parse(['0b1011']).arguments.asNumber(0)).toBe(11);
	expect(parse(['0o20']).arguments.asNumber(0)).toBe(16);
	expect(parse(['5_000']).arguments.asNumber(0)).toBe(NaN);
	expect(parse([]).arguments.asNumber(0)).toBe(undefined);	
});

test('parse() arguments asString()', () => {
	// Verbose on purpose for test failure readability.
	expect(parse(['Earth']).arguments.asString(0)).toBe('Earth');
	expect(parse(['false']).arguments.asString(0)).toBe('false');
	expect(parse(['true']).arguments.asString(0)).toBe('true');
	expect(parse(['0']).arguments.asString(0)).toBe('0');
	expect(parse(['1']).arguments.asString(0)).toBe('1');
	expect(parse(['']).arguments.asString(0)).toBe('');
	expect(parse([false]).arguments.asString(0)).toBe('false');
	expect(parse([true]).arguments.asString(0)).toBe('true');
	expect(parse([1]).arguments.asString(0)).toBe('1');
	expect(parse([0]).arguments.asString(0)).toBe('0');
	expect(parse([5]).arguments.asString(0)).toBe('5');
	expect(parse([NaN]).arguments.asString(0)).toBe('NaN');
	expect(parse([0.1]).arguments.asString(0)).toBe('0.1');
	expect(parse([-1]).arguments.asString(0)).toBe('-1');
	expect(parse([' ']).arguments.asString(0)).toBe(' ');
	expect(parse([]).arguments.asString(0)).toBe(undefined);
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