import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: [
            '**/build',
            '**/coverage',
            '**/node_modules',
            '**/eslint.config.mjs',
            '**/.prettierrc.js',
            '**/jest.config.js',
            '**/package-lock.json',
            '**/dist',
        ],
    },
    ...compat.extends(
        'prettier',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ),
    {
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',

            parserOptions: {
                project: true,
            },
        },

        rules: {
            'linebreak-style': ['error', 'unix'],

            'no-console': [
                'warn',
                {
                    allow: ['warn', 'error'],
                },
            ],

            quotes: [
                'error',
                'single',
                {
                    avoidEscape: true,
                },
            ],

            semi: ['error', 'always'],

            '@typescript-eslint/no-explicit-any': [
                'warn',
                {
                    ignoreRestArgs: true,
                },
            ],

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                },
            ],

            '@typescript-eslint/no-floating-promises': 'warn',
        },
    },
];
