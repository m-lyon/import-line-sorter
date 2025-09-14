import { RuleTester } from 'eslint';
import * as tsParser from '@typescript-eslint/parser';
import { ESLint } from 'eslint';

export function getRuleTester(): RuleTester {
    const eslintVersion = ESLint?.version?.split('.')[0];
    switch (eslintVersion) {
        case '8':
            return new RuleTester({
                // @ts-ignore: v8 types
                parser: require.resolve('@typescript-eslint/parser'),
                parserOptions: {
                    sourceType: 'module',
                    ecmaFeatures: { jsx: true },
                    ecmaVersion: 'latest',
                },
            });
        case '9':
            return new RuleTester({
                languageOptions: {
                    parser: tsParser,
                    parserOptions: {
                        ecmaVersion: 'latest',
                        sourceType: 'module',
                    },
                },
            });
        default:
            throw new Error('This test suite requires ESLint version 8 or 9');
    }
}
