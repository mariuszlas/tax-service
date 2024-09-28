module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts', '**/*.spec.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    coverageDirectory: '../coverage',
    collectCoverage: true,
    coverageReporters: ['text', 'cobertura'],
    verbose: true,
};
