/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                isolatedModules: true,
                tsconfig: {
                    types: ['jest', 'node'],
                    esModuleInterop: true,
                    allowImportingTsExtensions: false,
                    noEmit: true,
                },
            },
        ],
    },
    testMatch: ['**/__tests__/**/*.test.ts'],
    collectCoverageFrom: [
        '**/*.ts',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/__tests__/**',
        '!**/test/**',
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    testTimeout: 30000,
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
};
