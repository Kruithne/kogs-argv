import { expect, test, jest } from '@jest/globals';
import argv, { parse } from './index.js';

test('API availability', () => {
	expect(typeof argv.parse).toBe('function');
	expect(typeof parse).toBe('function');

	const result = argv.parse();
	expect(typeof result.version).toBe('function');
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

test('parse() options prototype', () => {
	const results = parse(['--foo=bar']);

	// results.options should work as a normal object.
	expect(Object.keys(results.options).length).toBe(1);

	// Ensure that prototype cannot be accessed through as-functions.
	expect(results.options.asString('toString')).toBe(undefined);
	expect(results.options.asString('prototype')).toBe(undefined);
	expect(results.options.asString('asString')).toBe(undefined);
});

test('parse() options', () => {
	const results = parse(['Earth', '-c', '--test', '-b', 'free', '--my-other-test', 'Jupiter', 'Mars', '--sun=true', 'Venus']);

	expect(results.options.test).toBe(true); // Non-valued options are true.
	expect(results.options.myOtherTest).toBe('Jupiter');
	expect(results.options.sun).toBe('true'); // Option values are not automatically coerced.

	// Short options.
	expect(results.options.c).toBe(true);
	expect(results.options.b).toBe('free');

	// Arguments should not be incorrectly consumed by options.
	expect(results.arguments[0]).toBe('Earth');
	expect(results.arguments[1]).toBe('Mars');
	expect(results.arguments[2]).toBe('Venus');
});

test('parse() short option key sanitization', () => {
	expect(parse(['-t']).options.t).toBe(true);

	expect(parse(['-t', 'foo']).options.t).toBe('foo');
	expect(parse(['-5']).options['5']).toBe(undefined);

	// Short options do not support = syntax.
	expect(parse(['-t=foo']).options.t).toBe(undefined);

	// Do not consume the short one.
	expect(parse(['-t', '-f']).options.t).toBe(true);
	expect(parse(['-t', '-f']).options.f).toBe(true);

	// Short option groups are not supported.
	expect(parse(['-ab']).options.a).toBe(undefined);
	expect(parse(['-ab']).options.b).toBe(undefined);
});

test('parse() long option key sanitzation', () => {
	expect(parse(['--test']).options.test).toBe(true);
	expect(parse(['--my-other-test']).options.myOtherTest).toBe(true);
	expect(parse(['--5-fifty']).options.fifty).toBe(true);
	expect(parse(['--MANGO']).options.mango).toBe(true);
	expect(parse(['--MANGO-JAM']).options.mangoJam).toBe(true);
	expect(parse(['--6424']).options['6424']).toBe(undefined);
});

test('parse() options asBoolean', () => {
	// Verbose on purpose for test failure readability.
	expect(parse(['--test']).options.asBoolean('test')).toBe(true);
	expect(parse(['--test=false']).options.asBoolean('test')).toBe(false); // `false` is counted as false literally.
	expect(parse(['--test=true']).options.asBoolean('test')).toBe(true); // `true` is counted as true literally.
	expect(parse(['--test=0']).options.asBoolean('test')).toBe(false); // `0` is counted as false literally.
	expect(parse(['--test=1']).options.asBoolean('test')).toBe(true); // `1` is counted as true literally.
	expect(parse(['--test=']).options.asBoolean('test')).toBe(false); // Empty strings are false.
	expect(parse(['--test=Infinity']).options.asBoolean('test')).toBe(true); // `Infinity` is a string, strings are true.
	expect(parse(['--test=null']).options.asBoolean('test')).toBe(true); // `null` is a string, strings are true.

	expect(parse(['--test', true]).options.asBoolean('test')).toBe(true); // True goes in, true comes out.
	expect(parse(['--test', false]).options.asBoolean('test')).toBe(false); // False goes in, false comes out.
	expect(parse(['--test', 1]).options.asBoolean('test')).toBe(true);
	expect(parse(['--test', 0]).options.asBoolean('test')).toBe(false);
	expect(parse(['--test', '']).options.asBoolean('test')).toBe(false);
	expect(parse(['--test', 'true']).options.asBoolean('test')).toBe(true);
	expect(parse(['--test', 'false']).options.asBoolean('test')).toBe(false);
	expect(parse(['--test', '1']).options.asBoolean('test')).toBe(true);
	expect(parse(['--test', '0']).options.asBoolean('test')).toBe(false);
	expect(parse(['--test', 'Infinity']).options.asBoolean('test')).toBe(true);
	expect(parse(['--test', 'null']).options.asBoolean('test')).toBe(true);
	expect(parse([]).options.asBoolean('test')).toBe(undefined);
});

test('parse() options asNumber', () => {
	// Verbose on purpose for test failure readability.
	expect(parse(['--test']).options.asNumber('test')).toBe(1);
	expect(parse(['--test=false']).options.asNumber('test')).toBe(NaN);
	expect(parse(['--test=true']).options.asNumber('test')).toBe(NaN);
	expect(parse(['--test=0']).options.asNumber('test')).toBe(0);
	expect(parse(['--test=1']).options.asNumber('test')).toBe(1);
	expect(parse(['--test=']).options.asNumber('test')).toBe(0); // Empty strings become 0.
	expect(parse(['--test=Infinity']).options.asNumber('test')).toBe(Infinity);
	expect(parse(['--test=-Infinity']).options.asNumber('test')).toBe(-Infinity);
	expect(parse(['--test=5.2434']).options.asNumber('test')).toBe(5.2434);
	expect(parse(['--test=-5.2434']).options.asNumber('test')).toBe(-5.2434);
	expect(parse(['--test=+542']).options.asNumber('test')).toBe(542);
	expect(parse(['--test=0x10']).options.asNumber('test')).toBe(16);
	expect(parse(['--test=0o10']).options.asNumber('test')).toBe(8);
	expect(parse(['--test=0b10']).options.asNumber('test')).toBe(2);
	expect(parse(['--test=1_000_000']).options.asNumber('test')).toBe(NaN);

	expect(parse(['--test', true]).options.asNumber('test')).toBe(1);
	expect(parse(['--test', false]).options.asNumber('test')).toBe(0);
	expect(parse(['--test', 1]).options.asNumber('test')).toBe(1);
	expect(parse(['--test', 0]).options.asNumber('test')).toBe(0);
	expect(parse(['--test', '']).options.asNumber('test')).toBe(0);
	expect(parse(['--test', 'true']).options.asNumber('test')).toBe(NaN);
	expect(parse(['--test', 'false']).options.asNumber('test')).toBe(NaN);
	expect(parse(['--test', '1']).options.asNumber('test')).toBe(1);
	expect(parse(['--test', '0']).options.asNumber('test')).toBe(0);
	expect(parse(['--test', Infinity]).options.asNumber('test')).toBe(Infinity);
	expect(parse(['--test', -Infinity]).options.asNumber('test')).toBe(-Infinity);
	expect(parse(['--test', 'Infinity']).options.asNumber('test')).toBe(Infinity);
	expect(parse(['--test', '-Infinity']).options.asNumber('test')).toBe(-Infinity);
	expect(parse(['--test', '5.2434']).options.asNumber('test')).toBe(5.2434);
	expect(parse(['--test', '-5.2434']).options.asNumber('test')).toBe(-5.2434);
	expect(parse(['--test', '+542']).options.asNumber('test')).toBe(542);
	expect(parse(['--test', '0x10']).options.asNumber('test')).toBe(16);
	expect(parse(['--test', '0o10']).options.asNumber('test')).toBe(8);
	expect(parse(['--test', '0b10']).options.asNumber('test')).toBe(2);
	expect(parse(['--test', '1_000_000']).options.asNumber('test')).toBe(NaN);
	expect(parse(['--test', 5.2434]).options.asNumber('test')).toBe(5.2434);
	expect(parse(['--test', -5.2434]).options.asNumber('test')).toBe(-5.2434);
	expect(parse(['--test', 0x10]).options.asNumber('test')).toBe(16);
	expect(parse(['--test', 0o10]).options.asNumber('test')).toBe(8);
	expect(parse(['--test', 0b10]).options.asNumber('test')).toBe(2);
	expect(parse(['--test', 1_000_000]).options.asNumber('test')).toBe(1000000); // Works as primitive number, not string parsing.

	expect(parse([]).options.asNumber('test')).toBe(undefined);
});

test('parse() options asString', () => {
	// Verbose on purpose for test failure readability.
	expect(parse(['--test']).options.asString('test')).toBe('true');
	expect(parse(['--test=false']).options.asString('test')).toBe('false');
	expect(parse(['--test=true']).options.asString('test')).toBe('true');
	expect(parse(['--test=0']).options.asString('test')).toBe('0');
	expect(parse(['--test=1']).options.asString('test')).toBe('1');
	expect(parse(['--test=']).options.asString('test')).toBe('');
	expect(parse(['--test=Infinity']).options.asString('test')).toBe('Infinity');
	expect(parse(['--test=-Infinity']).options.asString('test')).toBe('-Infinity');
	expect(parse(['--test=5.2434']).options.asString('test')).toBe('5.2434');
	expect(parse(['--test=-5.2434']).options.asString('test')).toBe('-5.2434');
	expect(parse(['--test=+542']).options.asString('test')).toBe('+542');
	expect(parse(['--test=0x10']).options.asString('test')).toBe('0x10');
	expect(parse(['--test=0o10']).options.asString('test')).toBe('0o10');
	expect(parse(['--test=0b10']).options.asString('test')).toBe('0b10');
	expect(parse(['--test=1_000_000']).options.asString('test')).toBe('1_000_000');

	expect(parse(['--test', true]).options.asString('test')).toBe('true');
	expect(parse(['--test', false]).options.asString('test')).toBe('false');
	expect(parse(['--test', 1]).options.asString('test')).toBe('1');
	expect(parse(['--test', 0]).options.asString('test')).toBe('0');
	expect(parse(['--test', '']).options.asString('test')).toBe('');
	expect(parse(['--test', 'true']).options.asString('test')).toBe('true');
	expect(parse(['--test', 'false']).options.asString('test')).toBe('false');
	expect(parse(['--test', '1']).options.asString('test')).toBe('1');
	expect(parse(['--test', '0']).options.asString('test')).toBe('0');
	expect(parse(['--test', Infinity]).options.asString('test')).toBe('Infinity');
	expect(parse(['--test', -Infinity]).options.asString('test')).toBe('-Infinity');
});

test('parse() invalid option argument consumption', () => {
	// In the event that an option is invalid, it must still consume a potential argument.
	expect(parse(['--5', 'invalid']).arguments.length).toBe(0);
	expect(parse(['-5', 'invalid']).arguments.length).toBe(0);
});

test('parse() asArray', () => {
	expect(parse(['--test', 'foo,bar,baz']).options.asArray('test')).toEqual(['foo', 'bar', 'baz']);
	expect(parse(['--test','foo|bar|baz']).options.asArray('test')).toEqual(['foo|bar|baz']);
	expect(parse(['--test', 'foo bar baz']).options.asArray('test')).toEqual(['foo bar baz']);

	expect(parse(['--test', 'foo,bar,baz']).options.asArray('test', ',')).toEqual(['foo', 'bar', 'baz']);
	expect(parse(['--test','foo|bar|baz']).options.asArray('test', '|')).toEqual(['foo', 'bar', 'baz']);
	expect(parse(['--test', 'foo bar baz']).options.asArray('test', ' ')).toEqual(['foo', 'bar', 'baz']);

	expect(parse(['--test', 'foo , bar , baz ']).options.asArray('test', ',', true)).toEqual(['foo', 'bar', 'baz']);
	expect(parse(['--test', 'foo , bar , baz ']).options.asArray('test', ',', false)).toEqual(['foo ', ' bar ', ' baz ']);
});

test('parse().version() with default options', () => {
	const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
	const exit = jest.spyOn(process, 'exit').mockImplementation(() => true);
	
	try {
		parse(['--version']).version({ name: 'Test Application', version: '1.0.0' });

		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m Test Application \x1B[36m1.0.0\x1B[39m\n');
		expect(exit).toHaveBeenCalledWith(0);
	} finally {
		stdout.mockRestore();
		exit.mockRestore();
	}
});

test('parse().version() with missing required options', () => {
	const argv = parse(['--version']);
	expect(() => argv.version({ version: '1.0.0' })).toThrow();
	expect(() => argv.version({ name: 'Test Application' })).toThrow();
	expect(() => argv.version({})).toThrow();
});

test('parse().version() with shorthand option', () => {
	const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
	const exit = jest.spyOn(process, 'exit').mockImplementation(() => true);

	try {
		parse(['-v']).version({ name: 'Test Application', version: '1.0.0', shorthand: 'v' });

		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m Test Application \x1B[36m1.0.0\x1B[39m\n');
		expect(exit).toHaveBeenCalledWith(0);
	} finally {
		stdout.mockRestore();
		exit.mockRestore();
	}
});

test('parse().version() with no --version or -v provided', () => {
	const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
	const exit = jest.spyOn(process, 'exit').mockImplementation(() => true);
	
	try {
		parse([]).version({ name: 'Test Application', version: '1.0.0' });

		expect(stdout).not.toHaveBeenCalled();
		expect(exit).not.toHaveBeenCalled();
	} finally {
		stdout.mockRestore();
		exit.mockRestore();
	}
});

test('parse().version() with `alwaysPrint`', () => {
	const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
	const exit = jest.spyOn(process, 'exit').mockImplementation(() => true);
	
	try {
		parse([]).version({ name: 'Test Application', version: '1.0.0', alwaysPrint: true });

		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m Test Application \x1B[36m1.0.0\x1B[39m\n');
		expect(exit).not.toHaveBeenCalled();
	} finally {
		stdout.mockRestore();
		exit.mockRestore();
	}
});

test('parse().version() with `exit` set to false', () => {
	const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
	const exit = jest.spyOn(process, 'exit').mockImplementation(() => true);
	
	try {
		parse(['--version']).version({ name: 'Test Application', version: '1.0.0', exit: false });

		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m Test Application \x1B[36m1.0.0\x1B[39m\n');
		expect(exit).not.toHaveBeenCalled();
	} finally {
		stdout.mockRestore();
		exit.mockRestore();
	}
});

test('parse().help() with default options', () => {
	const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
	const exit = jest.spyOn(process, 'exit').mockImplementation(() => true);

	try {
		parse(['--help']).help({ entries: [
			{ name: '--test <{foo}>', description: 'Test option' }
		]});

		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m Options:\n');
		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m   --test <\x1B[36mfoo\x1B[39m>   Test option\n');

		expect(exit).toHaveBeenCalledWith(0);
	} finally {
		stdout.mockRestore();
		exit.mockRestore();
	}
});

test('parse().help() with shorthand option', () => {
	const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
	const exit = jest.spyOn(process, 'exit').mockImplementation(() => true);

	try {
		parse(['-h']).help({ entries: [
			{ name: '--test <{foo}>', description: 'Test option' },
			{ name: '--another <{bar}>', description: 'Another option' }
		]});

		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m Options:\n');
		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m   --test <\x1B[36mfoo\x1B[39m>      Test option\n');
		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m   --another <\x1B[36mbar\x1B[39m>   Another option\n');

		expect(exit).toHaveBeenCalledWith(0);
	} finally {
		stdout.mockRestore();
		exit.mockRestore();
	}
});

test('parse().help() with `usage` string', () => {
	const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
	const exit = jest.spyOn(process, 'exit').mockImplementation(() => true);

	try {
		parse(['--help']).help({
			usage: 'Usage: > test [{options}]',
			entries: [
				{ name: '--test <{foo}>', description: 'Test option' }
			]
		});

		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m Usage: > test [\x1B[36moptions\x1B[39m]\n');
		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m Options:\n');
		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m   --test <\x1B[36mfoo\x1B[39m>   Test option\n');

		expect(exit).toHaveBeenCalledWith(0);
	} finally {
		stdout.mockRestore();
		exit.mockRestore();
	}
});

test('parse().help() with `url` string', () => {
	const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
	const exit = jest.spyOn(process, 'exit').mockImplementation(() => true);

	try {
		parse(['--help']).help({
			url: 'https://example.com',
			entries: [
				{ name: '--test <{foo}>', description: 'Test option' }
			]
		});

		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m Options:\n');
		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m   --test <\x1B[36mfoo\x1B[39m>   Test option\n');
		expect(stdout).toHaveBeenCalledWith('\x1B[36mi\x1B[39m For more information, see \x1B[36mhttps://example.com\x1B[39m\n');

		expect(exit).toHaveBeenCalledWith(0);
	} finally {
		stdout.mockRestore();
		exit.mockRestore();
	}
});