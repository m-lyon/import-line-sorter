import { RuleTester } from 'eslint';
import { sorter } from '../../lib/rules/sorter';

const ruleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
    },
});

const valid1 = `
import { a } from 'a';
import { bb } from 'bb';
`;
const valid2 = `
export { a } from 'a';
export { bb } from 'bb';
`;
const valid3 = `
import { a } from 'a';
import type { bb } from 'bb';
`;
const valid4 = `
export { a } from 'a';
export type { bb } from 'bb';
`;

const invalid1 = `
import { bb } from 'bb';
import { a } from 'a';
`;
const invalid1_solution = `
import { a } from 'a';
import { bb } from 'bb';
`;
const invalid2 = `
export { bb } from 'bb';
export { a } from 'a';
`;
const invalid2_solution = `
export { a } from 'a';
export { bb } from 'bb';
`;
const invalid3 = `
import type { bb } from 'bb';
import { a } from 'a';
`;
const invalid3_solution = `
import { a } from 'a';
import type { bb } from 'bb';
`;
const invalid4 = `
export type { bb } from 'bb';
export { a } from 'a';
`;
const invalid4_solution = `
export { a } from 'a';
export type { bb } from 'bb';
`;

ruleTester.run('sorter', sorter as any, {
    valid: [{ code: valid1 }, { code: valid2 }, { code: valid3 }, { code: valid4 }],
    invalid: [
        {
            code: invalid1,
            errors: [{ messageId: 'sort-imports' }],
            output: invalid1_solution,
        },
        {
            code: invalid2,
            errors: [{ messageId: 'sort-imports' }],
            output: invalid2_solution,
        },
        {
            code: invalid3,
            errors: [{ messageId: 'sort-imports' }],
            output: invalid3_solution,
        },
        {
            code: invalid4,
            errors: [{ messageId: 'sort-imports' }],
            output: invalid4_solution,
        },
    ],
});

console.log('all tests passed!');
