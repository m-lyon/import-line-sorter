import { getRuleTester } from '../utils';
import { multiline } from '../../lib/rules/multiline';

const ruleTester = getRuleTester();

// Valid cases - single line imports
const valid1 = `
import { a } from 'a';
`;

const valid2 = `
import { a, b } from 'short';
`;

const valid3 = `
import { Component } from 'react';
`;

const valid4 = `
import { veryLongNamedFunction, anotherLongFunction } from 'lib';
`;

// Invalid cases - multiline imports that need fixing
const invalid1 = `
import {
    a,
    b
} from 'lib';
`;

const invalid1_solution = `
import { a, b } from 'lib';
`;

const invalid2 = `
import {
    Component,
    useState,
    useEffect
} from 'react';
`;

const invalid2_solution = `
import { Component, useState, useEffect } from 'react';
`;

const invalid3 = `
import {
    veryLongFunctionName,
    anotherVeryLongFunctionName,
    yetAnotherVeryLongFunctionName
} from 'some-library';
`;

const invalid3_solution = `
import { veryLongFunctionName, anotherVeryLongFunctionName } from 'some-library';
import { yetAnotherVeryLongFunctionName } from 'some-library';
`;

const invalid4 = `
import {
    short,
    medium,
    aVeryLongNamedFunctionThatExceedsTheLimit,
    another,
    evenLongerFunctionNameThatDefinitelyExceedsLimit
} from 'library';
`;

const invalid4_solution = `
import { short, medium, aVeryLongNamedFunctionThatExceedsTheLimit, another } from 'library';
import { evenLongerFunctionNameThatDefinitelyExceedsLimit } from 'library';
`;

const invalid5 = `
import {
    a
} from 'single';
`;

const invalid5_solution = `
import { a } from 'single';
`;

const invalid6 = `
import {
    veryLongNamedFunction,
    anotherLongFunction
} from 'lib';
`;
const invalid6_solution = `
import { veryLongNamedFunction } from 'lib';
import { anotherLongFunction } from 'lib';
`;

const invalid7 = `
import {
    a,
    b,
} from 'lib';
`;
const invalid7_solution = `
import { a, b } from 'lib';
`;

ruleTester.run('multiline', multiline as any, {
    valid: [
        { code: valid1 },
        { code: valid2 },
        { code: valid3 },
        { code: valid4 },
        // Test with custom maxLength option
        {
            code: `import { veryLongNamedFunction, anotherLongFunction } from 'lib';`,
            options: [{ maxLength: 200, debug: false }],
        },
    ],
    invalid: [
        {
            code: invalid1,
            errors: [{ messageId: 'no-multiline-imports' }],
            output: invalid1_solution,
        },
        {
            code: invalid2,
            errors: [{ messageId: 'no-multiline-imports' }],
            output: invalid2_solution,
        },
        {
            code: invalid3,
            errors: [{ messageId: 'no-multiline-imports' }],
            output: invalid3_solution,
            options: [{ maxLength: 100, debug: false }],
        },
        {
            code: invalid4,
            errors: [{ messageId: 'no-multiline-imports' }],
            output: invalid4_solution,
            options: [{ maxLength: 100, debug: false }],
        },
        {
            code: invalid5,
            errors: [{ messageId: 'no-multiline-imports' }],
            output: invalid5_solution,
        },
        // Test with different maxLength
        {
            code: invalid6,
            errors: [{ messageId: 'no-multiline-imports' }],
            output: invalid6_solution,
            options: [{ maxLength: 50, debug: false }],
        },
        // Trailing comma before closing brace (common Prettier output)
        {
            code: invalid7,
            errors: [{ messageId: 'no-multiline-imports' }],
            output: invalid7_solution,
        },
    ],
});

console.log('all multiline tests passed!');
